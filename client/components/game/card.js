import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  LINE_X, LINE_Y, GAME_STATUS } from 'configs/game'
import { setIsDrawing, setIsDragging, setIsInteractive, 
  setInsertPlace, setMyDraggingLine } from 'redux/card/actions'
import { gsap } from 'gsap'
import * as PIXI from 'pixi.js'

const SCALE_CARD_HIGHLIGHT = 1.1
let isDraggingLocal = false
export default function Card({cardTextures, id}){
  // Stores
  const drawingCardColor = useSelector(state => state.card.drawingCardColor)
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const drawingNum = useSelector(state => state.card.drawingNum)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const dragResult = useSelector(state => state.card.dragResult)
  const myLine = useSelector(state => state.card.myLine)
  const insertPlace = useSelector(state => state.card.insertPlace)
  const socketClient = useSelector(state => state.user.socketClient)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
  const disableDrag = useSelector(state => state.card.disableDrag)
  const statusObj = useSelector(state => state.user.statusObj)
  const user = useSelector(state => state.user.user)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT)
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(null)  
  const [displayMe, setDisplayMe] = useState(false)
  const [numSprite, setNumSprite] = useState()
  const [myColor, setMyColor] = useState()
  const [myNumber, setMyNumber] = useState()
  const [myId, setMyId] = useState(id)
  const [myIndex, setMyIndex] = useState(null)
  const [cardInit, setCardInit] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)
  const [highlighted, setHighlighted] = useState(false)
  const [myRevealed, setMyRevealed] = useState(false)


  const me = useRef()

  useEffect(() => {
    if(cardInit || myLine === null || myDraggingLine === null) return

    // Check if this id already exist in myLine
    // If yes means this card is an init stand card, directly go to the line
    for(let i = 0; i < myLine.length; i++ ){
      if(myId === myLine[i].id){
        const { num, color, revealed } = myLine[i]
        positionByIndex(i)
        setMyIndex(i)
        setCardTexture(cardTextures.stand[color])
        addNumber(color, num)
        setMyColor(color)
        setMyNumber(num) 
        setMyRevealed(revealed)
        if(revealed){
          setCardStatus(CARD_STATUS.lay)
        }else{
          setCardStatus(CARD_STATUS.stand)  
          // Check if I am the guessing card
          // If yes highlight the card
          if((statusObj.status === GAME_STATUS.USER_1_ANSWER && user === 1) || 
          statusObj.status === GAME_STATUS.USER_2_ANSWER && user === 2){
            if(statusObj.statusData.index === i){
              setHighlighted(true)
            }
          }
        }
        
        return setCardInit(true)  
      }
    }    

    // Check if draggingLines is not 0 and this card id is over myLine's
    // If yes means that this card go direct to the wait line
    if(myDraggingLine.length > 0 && myId > myLine.length){
      for(let i = 0; i < myDraggingLine.length; i++ ){
        if(myId - myLine.length === i + 1){
          const { num, color } = myDraggingLine[i]
          setCardTexture(cardTextures.stand[color])
          addNumber(color, num)
          setMyColor(color)
          setMyNumber(num) 
          setDragIndex(i)
          return setCardInit(true)      
        }
      }  
    }  

    setCardStatus(CARD_STATUS.draw)  
    return setCardInit(true)  

  }, [myLine, myDraggingLine])

  useEffect(() => {
    if(dragResult === null || cardStatus !== CARD_STATUS.dragable || myId !== window.glDraggingId) return

    // Insert card success
    if(dragResult.success){
      // Put card in place
      setCardStatus(CARD_STATUS.stand)
      positionByIndex(dragResult.index)
      setMyIndex(dragResult.index)
      
      // Remove the card from the waiting line
      const index = myId - myLine.length - 1
      const newLine = [...myDraggingLine]
      newLine.splice(index, 1)
      dispatch(setMyDraggingLine(newLine))

      dispatch(setInsertPlace(null))
    }else{
      setDrag()
    }
  }, [dragResult])

  useEffect(() => {
    if(myLine === null || myIndex === null) return
    if((cardStatus === CARD_STATUS.stand || cardStatus === CARD_STATUS.lay) &&
      myLine[myIndex].id !== myId){
      positionByIndex(myIndex+1)
      setMyIndex(myIndex+1)
    }
  }, [myLine])
  
  useEffect(() => {
    if(cardStatus !== CARD_STATUS.stand && cardStatus !== CARD_STATUS.lay && myIndex === null) return
    
    if(insertPlace === null){
      positionByIndex(myIndex)
      return
    }

    if(insertPlace <= myIndex){
      positionByIndex(myIndex+1)
    }

  }, [insertPlace])

  useEffect(() => {
    if(!myNumber || !myColor || !myId ) return
    if( cardStatus === CARD_STATUS.draw )drawAnimation()
    if( cardStatus === null ) setDrag()
    setDisplayMe(true)
  }, [myNumber, myColor, myId])

  useEffect(() => {
    if(myColor === null) return

    if(highlighted){
      setCardTexture(cardTextures.select[myColor])
      setCardWidth(CARD_WIDTH*SCALE_CARD_HIGHLIGHT)
      setCardHeight(CARD_HEIGHT*SCALE_CARD_HIGHLIGHT)
      return
    }else{
      setCardTexture(cardTextures.stand[myColor])
      setCardWidth(CARD_WIDTH)
      setCardHeight(CARD_HEIGHT)
    }
  }, [highlighted, myColor])

  useEffect(() => {
    statusHandler()
  },[cardStatus, drawingNum, statusObj, myRevealed])

  // Methods
  const statusHandler = () => {
    if(cardStatus === null) return
    // pos init
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.dragable:
      dispatch(setIsDrawing(false))

      // If it is under the PUT_IN_LINE status
      if((statusObj.status === GAME_STATUS.USER_1_PUT_IN_LINE && user === 1) || 
      statusObj.status === GAME_STATUS.USER_2_PUT_IN_LINE && user === 2){
        setMyRevealed(!statusObj.statusData.isCorrect)
      }

      break
    case CARD_STATUS.draw:
      if(!drawingNum) return
      
      if(drawingCardColor === 'w'){
        pos = {
          x: (DESIGN_WIDTH-CARD_PILE.CARD_MARGIN_BETWWEN)/2 + 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(drawingCardColor === 'b'){
        pos = {
          x: (DESIGN_WIDTH+CARD_PILE.CARD_MARGIN_BETWWEN)/2 - 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.b)
      }

      addNumber(drawingCardColor, drawingNum)
      setMyColor(drawingCardColor)
      setMyNumber(drawingNum)
      setCardPosition(pos)
      break
    case CARD_STATUS.stand:
      // Check if i am a revealed card, if yes, put me down
      if(myRevealed){
        setCardStatus(CARD_STATUS.lay)
        return
      }

      // If it is under the ANSWER status
      if((statusObj.status === GAME_STATUS.USER_1_ANSWER && user === 1) || 
        statusObj.status === GAME_STATUS.USER_2_ANSWER && user === 2){
        // Check if I am the guessing card
        // If yes highlight the card
        if(statusObj.statusData.index === myIndex){
          setHighlighted(true)
        }
      }else{
        // cancel the highlight
        setHighlighted(false)
      }

      // If it is under the second or more GUESS status
      if((statusObj.status === GAME_STATUS.USER_1_GUESS && user === 2) || 
        statusObj.status === GAME_STATUS.USER_2_GUESS && user === 1){
        // Check if I am the guessing card
        // If yes, double check if the guess is correct( normally yes ),
        // if yes, put me down 
        if(statusObj.statusData.index === myIndex && statusObj.statusData.isCorrect){
          setMyRevealed(true)
        }
      }
      break
    case CARD_STATUS.lay:
      putDownCard(myColor, myNumber)
      positionByIndex(myIndex, true)
      break
    case CARD_STATUS.none:
    default: 
      setCardPosition(pos)
      break
    }
  }

  const drawAnimation = () => {
    const tl = gsap.timeline()
    const scale = me.current.scale.x
    const prevNum = myId - myLine.length - 1
    setDragIndex(prevNum)
    tl
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-1000, y:LINE_Y - 150, scale:scale+1},
        ease: 'power1.inOut',
        duration: 1.1
      })
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH - 170 - cardWidth * prevNum, y:LINE_Y - 150, scale:scale},
        ease: 'power1.out',
        duration: .5,
        onComplete: () => {
          drawSuccessHandler()
        }
      })
  }

  const drawSuccessHandler = () => {
    setDrag()
    dispatch(setIsInteractive(true))
    socketClient.drawFinish({color: drawingCardColor, num: drawingNum, drawId: myId})

    // Add the card to the waiting line
    const newLine = [...myDraggingLine]
    newLine.push({num: drawingNum, drawingCardColor})
    dispatch(setMyDraggingLine(newLine))
  }

  // Set drag status
  const setDrag = () => {
    const prevNum = dragIndex === null ? myId - myLine.length - 1 : dragIndex
    setCardPosition({x:DESIGN_WIDTH - 170 - cardWidth * prevNum, y:LINE_Y - 150})
    setCardStatus(CARD_STATUS.dragable)

    me.current
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)
  }

  // Add the number sprite
  const addNumber = (color, number) => {
    if(!numSheetTextures) return

    const sprite =  PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP[`${color}${number}_s`]])
    sprite.width = cardWidth / 2
    sprite.height = cardHeight / 2
    sprite.anchor.set(0.5)
    setNumSprite(sprite)
    me.current.addChild(sprite)
  }

  // Make the card lay down 
  const putDownCard = (color, number) => {
    if(!myColor || !myNumber) return
    // Set card texture
    setCardTexture(cardTextures.lay[myColor])
    setCardHeight(CARD_HEIGHT_LAY)
    // Set number texture
    if(!numSprite) {
      const sprite =  PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP[`${color}${number}_l`]])
      sprite.width = cardWidth / 2
      sprite.height = CARD_HEIGHT_LAY / 2
      sprite.anchor.set(0.5)
      setNumSprite(sprite)
      me.current.addChild(sprite)
    }else{
      numSprite.texture = numSheetTextures[NUM_SHEET_MAP[`${color}${number}_l`]]
      numSprite.width = cardWidth / 2
      numSprite.height = CARD_HEIGHT_LAY / 2
    }
  }

  // Card drag handlers
  const onDragStart = () => {
    window.glDraggingCard = {
      id: myId,
      sprite: me.current,
      num: myNumber,
      color: myColor
    }
    window.glDraggingId = myId
    isDraggingLocal = true
    dispatch(setIsDragging(true))
  }
  const onDragEnd = () => {
    if(window.glDraggingId !== myId) return
    isDraggingLocal = false
    dispatch(setIsDragging(false))
    me.current.removeAllListeners()
  }
  const onDragMove = event => {
    if (isDraggingLocal && window.glDraggingCard !== null && window.glDraggingId === myId) {
      const newPosition = event.data.getLocalPosition(me.current.parent)
      setCardPosition({
        x:newPosition.x,
        y:newPosition.y
      })
    }
  }

  // Positioning by index
  const positionByIndex = (index, isLay=false) => {
    setCardPosition({
      x: LINE_X + cardWidth/2 + index * cardWidth + 2, 
      y: isLay ? LINE_Y + CARD_HEIGHT_LAY / 4 + 12 : LINE_Y
    })
  }

  return (
    <>
      <Sprite
        ref={me}
        texture={cardTexture}
        width={cardWidth}
        height={cardHeight}
        anchor={0.5}
        position={cardPosition}
        visible={displayMe}

        interactive={
          isInteractive && 
          (cardStatus === CARD_STATUS.dragable && !disableDrag)
        }
      />
    </>
  )
}