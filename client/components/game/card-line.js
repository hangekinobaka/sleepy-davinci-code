import { useEffect, useState, useRef } from 'react'
import { Graphics, Container } from '@inlet/react-pixi'
import { CARD_WIDTH, LINE_X, LINE_Y, LINE_WIDTH, LINE_HEIGHT, WHITE_CARD_NUM } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { setMyLine, setDragRes, setInsertPlace } from 'redux/card/actions'

let collideInterval = null
let collideArea = null
export default function CardLine(){
  // Stores
  const myLine = useSelector(state => state.card.myLine)
  const isDragging = useSelector(state => state.card.isDragging)
  const draggingCard = useSelector(state => state.card.draggingCard)
  const drawingNum = useSelector(state => state.card.drawingNum)
  const drawingCard = useSelector(state => state.card.drawingCard)
  const insertPlace = useSelector(state => state.card.insertPlace)
  const dispatch = useDispatch()
  // Refs 
  const placeholders = []
  for ( let i = 0; i < WHITE_CARD_NUM; i++){
    placeholders.push(useRef())
  }

  useEffect(() => {
    return () => {
      // cleanup
      clearInterval(collideInterval)
    }
  }, [])

  useEffect(() => {
    if(isDragging === null) return

    if(isDragging){
      dispatch(setInsertPlace(null))
      collideInterval = setInterval(collisionHandler, 200)
      dispatch(setDragRes(null))

    }else{
      clearInterval(collideInterval)
      // Place the card 
      if(collideArea !== null){
        // If the card is still in the colliding area
        if(insertPlace !== null){
          // if the card insertion isa valid,
          // update the line
          let newLine = [...myLine]
          newLine.splice(insertPlace, 0, {
            num:drawingNum , color: drawingCard, id: draggingCard.id
          })
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
    g.lineStyle(2, 0xff00ff, 1)
    g.beginFill(0xff00bb, 0.25)
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
    if(placeholders.length === 0 || !draggingCard) return
    
    placeholders.forEach((ph, i) => {
      const collide = testCollision(draggingCard.sprite, ph.current) 
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

    if(myLine[i]){
      // If there is card in the current position 
      // you can put the card in this place if it smaller than the current card and larger than the previous card
      if(drawingNum < myLine[i].num){
        if(i === 0 || drawingNum > myLine[i-1].num) dispatch(setInsertPlace(i))
        else if(drawingNum === myLine[i-1].num && drawingCard === 'b') dispatch(setInsertPlace(i))
        else dispatch(setInsertPlace(null))

      }else if(myLine[i].num === drawingNum && drawingCard === 'w'){
        // If the number is the same
        // you can put it here if the color is white
        dispatch(setInsertPlace(i))
      }else{
        dispatch(setInsertPlace(null))
      }
    }else{
      // If there is no card in the current position 
      // you can put the card in the end of line if it is larger than the last card
      if(drawingNum > myLine[myLine.length - 1].num){
        dispatch(setInsertPlace(myLine.length))
      }else if(drawingNum === myLine[myLine.length - 1].num){
        // If the number is the same as the last one
        // you can put it if the color is black
        if(drawingCard === 'b'){
          dispatch(setInsertPlace(myLine.length))
        }else{
          dispatch(setInsertPlace(null))
        }
      }else{
        dispatch(setInsertPlace(null))
      }
    }
  }

  return (
    <Container
      position={[ LINE_X, LINE_Y] }
      width={LINE_WIDTH}
      height={LINE_HEIGHT}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Graphics 
            ref={placeholders[index]}
            key={`placeholders-${index}`}
            draw={drawPlaceHolder(index)}
          />
        ))
      }
    </Container>
  )
}