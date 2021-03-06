import { useEffect, useRef } from 'react'
import { Graphics, Container, useTick } from '@inlet/react-pixi'
import { CARD_WIDTH, LINE_X, LINE_Y, LINE_WIDTH, LINE_HEIGHT, 
  WHITE_CARD_NUM, GAME_STATUS } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { setMyLine, setDragRes, setInsertPlace } from 'redux/card/actions'
import * as PIXI from 'pixi.js'

const ticker = PIXI.Ticker.shared

let collideInterval = null
let collideArea = null
export default function CardLine(){
  // Stores
  const myLine = useSelector(state => state.card.myLine)
  const isDragging = useSelector(state => state.card.isDragging)
  const insertPlace = useSelector(state => state.card.insertPlace)
  const statusObj = useSelector(state => state.user.statusObj)
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch()

  // Refs
  const me = useRef()
  const placeholders = useRef(new Array(WHITE_CARD_NUM))

  useEffect(() => {
    return () => {
      // cleanup
      clearInterval(collideInterval)
    }
  }, [])
  
  useEffect(() => {
    if(isDragging === null) return

    if(isDragging){
      collideInterval = setInterval(collisionHandler, 200)
      dispatch(setDragRes(null))

    }else{
      clearInterval(collideInterval)
      // Place the card 
      if(collideArea !== null){
        // If the card is still in the colliding area
        if(insertPlace !== null){
          // if the card insertion is valid,
          // update the line
          let newLine = myLine === null ? [] : [...myLine]
          const newCard = {
            num: window.glDraggingCard.num, 
            color: window.glDraggingCard.color, 
            id: window.glDraggingCard.id,
            revealed: false
          }
          switch(statusObj.status){
          case GAME_STATUS.USER_1_PUT_IN_LINE:
            if(user === 1 && !statusObj.statusData.isCorrect){
              newCard.revealed = true
            }
            break
          case GAME_STATUS.USER_2_PUT_IN_LINE:
            if(user === 2 && !statusObj.statusData.isCorrect){
              newCard.revealed = true
            }
            break
          default:
            break
          }
          newLine.splice(insertPlace, 0, newCard)
          window.glDraggingCard = null
          dispatch(setMyLine(newLine))
          dispatch(setDragRes({
            success: true,
            index: insertPlace
          }))

          return
        }
      }

      dispatch(setDragRes({
        success: false,
        index: null
      }))
    }
  },[isDragging])

  // Methods
  const drawPlaceHolder= (i) => (g) => { 
    const x = i * CARD_WIDTH + 2
    g.clear()
    g.lineStyle(5, 0x613708, 1)
    g.beginFill(0x381e02, 1)
    g.moveTo(x, 0)
    g.lineTo(x + CARD_WIDTH, 0)
    g.lineTo(x + CARD_WIDTH, LINE_HEIGHT)
    g.lineTo(x, LINE_HEIGHT)
    g.lineTo(x, 0)
    g.endFill()
  }

  const testCollision = (object1, object2) => {
    const bounds1 = object1.getBounds()
    const bounds2 = object2.getBounds()
    // 50% or more overlaping are seeing as collided
    return bounds1.x < bounds2.x + bounds2.width*0.5
          && bounds1.x + bounds1.width > bounds2.x + bounds2.width*0.5
          && bounds1.y < bounds2.y + bounds2.height
          && bounds1.y + bounds1.height > bounds2.y + bounds2.height*0.5
  }
  
  // check if the dragging card is colliding with the placeholder
  const collisionHandler = () => {
    if(placeholders.current.length === 0 || window.glDraggingCard === null) return
    
    placeholders.current.forEach((ph, i) => {
      const collide = testCollision(window.glDraggingCard.sprite, ph) 
      if(collide) {
        if(collideArea === i) return
        collideArea = i
        testInsert(i)
      }else{
        if(collideArea === null || collideArea !== i) return 
        collideArea = null
        dispatch(setInsertPlace(null))
      }
    })
  }

  // Handle the card insertion
  const testInsert = i => {
    if(myLine.length === 0) {dispatch(setInsertPlace(0)); return}

    // If we are inserting the 'J' card, we can put it any where.
    if(window.glDraggingCard.num === 'J') {
      if(!myLine[i]) dispatch(setInsertPlace(myLine.length))
      else dispatch(setInsertPlace(i))
      return
    }

    // Test if this i number is smaller than num
    const testPrevSmaller = (i) => {
      /**
       * Possible true condition:
       * 1. the i is negative
       * 2. it is number and smaller
       * 3. it is number and the number is the same and the drawingCard color is black
       * 4. it is 'J', then repeat this function with the -1 index
       */
      if(i < 0) return true
      if(myLine[i].num === 'J'){
        return testPrevSmaller(i-1)
      }
      return (
        (parseInt(myLine[i].num) < num) || 
        (parseInt(myLine[i].num) === num && window.glDraggingCard.color === 'b')
      )
    }

    // Test if this i number is larger than num
    const testNextLarger = (i) => {
      /**
       * Possible true condition:
       * 1. the i is over the length
       * 2. it is number and larger
       * 3. it is number and the number is the same and the drawingCard color is white
       * 4. it is 'J', then repeat this function with the +1 index
       */
      if(i >= myLine.length) return true
      if(myLine[i].num === 'J'){
        return testNextLarger(i+1)
      }
      return (
        (parseInt(myLine[i].num) > num) || 
        (parseInt(myLine[i].num) === num && window.glDraggingCard.color === 'w')
      )
    }

    const num = parseInt(window.glDraggingCard.num)
    const cur = myLine[i] ? 
      myLine[i].num === 'J' ? 
        'J'
        : parseInt(myLine[i].num) 
      : null

    if(myLine[i]){
      // If there is card in the current position 
      if(cur === 'J'){
        // if the current number is "J"
        // You can put it in if next number is bigger and previous number is smaller
        if(testNextLarger(i+1) && testPrevSmaller(i-1)) dispatch(setInsertPlace(i))
        else dispatch(setInsertPlace(null))
      }else if(num < cur){
        // if the current number is bigger
        // you can put the card in this place if the prev number is smaller
        if(testPrevSmaller(i-1)) dispatch(setInsertPlace(i))
        else dispatch(setInsertPlace(null))
      }else if(cur === num && window.glDraggingCard.color === 'w'){
        // If the number is the same
        // you can put it here if the color is white
        dispatch(setInsertPlace(i))
      }else{
        dispatch(setInsertPlace(null))
      }
    }else{
      // If there is no card in the current position 
      if(testPrevSmaller(myLine.length-1)){
        // you can put the card in the end of line if it is larger than the last card
        dispatch(setInsertPlace(myLine.length))
      }else{
        dispatch(setInsertPlace(null))
      }
    }
  }

  const insertingAnimation = delta => {
    if(me.current.alpha > 0) me.current.alpha -= (0.03 * delta)
    else {
      me.current.alpha = 1
    }
  }

  useTick(delta => {
    if(insertPlace !== null) insertingAnimation(delta)
    else me.current.alpha = 1
  })
  

  return (
    <Container
      ref={me}
      position={[ LINE_X, LINE_Y] }
      width={LINE_WIDTH}
      height={LINE_HEIGHT}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Graphics 
            ref={el => placeholders.current[index] = el}
            key={`placeholders-${index}`}
            draw={drawPlaceHolder(index)}
          />
        ))
      }
    </Container>
  )
}