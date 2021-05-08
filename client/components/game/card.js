import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, useApp } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  LINE_X, LINE_Y, GAME_STATUS } from 'configs/game'
import { setIsDrawing, setIsDragging, setIsInteractive, 
  setInsertPlace, setMyDarggingLine } from 'redux/card/actions'
import { gsap } from 'gsap'
import * as PIXI from 'pixi.js'

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
  const [myIdex, setMyIdex] = useState(null)
  const [cardInit, setCardInit] = useState(false)

  const me = useRef()

  useEffect(() => {
    if(cardInit || myLine === null || myDraggingLine === null) return

    // Check if this id already exist in myLine
    // If yes means this card is an init stand card, directly go to the line
    for(let i = 0; i < myLine.length; i++ ){
      if(myId === myLine[i].id){
        const { num, color } = myLine[i]
        positionByIndex(i)
        setMyIdex(i)
        setCardTexture(cardTextures.stand[color])
        addNumber(color, num)
        setMyColor(color)
        setMyNumber(num) 
        setCardStatus(CARD_STATUS.stand)  
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
          return setCardInit(true)      
        }
      }  
    }  

    setCardStatus(CARD_STATUS.draw)  
    return setCardInit(true)  

  }, [])

  useEffect(() => {
    statusHandler()
  },[cardStatus, drawingNum])

  useEffect(() => {
    if(dragResult === null || cardStatus !== CARD_STATUS.dragable || myId !== window.glDraggingId) return

    // Insert card success
    if(dragResult.success){
      // Put card in place
      setCardStatus(CARD_STATUS.stand)
      positionByIndex(dragResult.index)
      setMyIdex(dragResult.index)
      
      // Remove the card from the waiting line
      const index = myId - myLine.length - 1
      const newLine = [...myDraggingLine]
      newLine.splice(index, 1)
      dispatch(setMyDarggingLine(newLine))

      dispatch(setInsertPlace(null))
    }else{
      setDrag()
    }
  }, [dragResult])

  useEffect(() => {
    if(myLine === null || myIdex === null) return
    if(cardStatus === CARD_STATUS.stand &&
      myLine[myIdex].id !== myId){
      positionByIndex(myIdex+1)
      setMyIdex(myIdex+1)
    }
  }, [myLine])
  
  useEffect(() => {
    if(cardStatus !== CARD_STATUS.stand && cardStatus !== CARD_STATUS.lay && myIdex === null) return
    
    if(insertPlace === null){
      positionByIndex(myIdex)
      return
    }

    if(insertPlace <= myIdex){
      positionByIndex(myIdex+1)
    }

  }, [insertPlace])

  useEffect(() => {
    if(!myNumber || !myColor || !myId ) return
    if( cardStatus === CARD_STATUS.draw )drawAnimation()
    if( cardStatus === null ) setDrag()
    setDisplayMe(true)
  }, [myNumber, myColor, myId])

  // Methods
  const statusHandler = () => {
    let pos = { x: 0, y: 0 }
    switch (cardStatus){
    case CARD_STATUS.dragable:
      dispatch(setIsDrawing(false))
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
      break
    case CARD_STATUS.none:
    default: 
      setCardPosition(pos)
    }
  }

  const drawAnimation = () => {
    const tl = gsap.timeline()
    const scale = me.current.scale.x
    const prevNum = myId - myLine.length - 1

    tl
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-1000, y:DESIGN_HEIGHT-350, scale:scale+1},
        ease: 'power1.inOut',
        duration: 1.3
      })
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH - 170 - CARD_WIDTH * prevNum, y:DESIGN_HEIGHT-350, scale:scale},
        ease: 'power1.out',
        duration: .6,
        onComplete: () => {
          drawSuccessHandler()
        }
      })
  }

  const drawSuccessHandler = () => {
    setDrag()
    dispatch(setIsInteractive(true))
    socketClient.drawFinish()
  }

  // Set drag status
  const setDrag = () => {
    const prevNum = myId - myLine.length - 1
    setCardPosition({x:DESIGN_WIDTH - 170 - CARD_WIDTH * prevNum, y:DESIGN_HEIGHT-350})
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
    sprite.width = CARD_WIDTH / 2
    sprite.height = CARD_HEIGHT / 2
    sprite.anchor.set(0.5)
    setNumSprite(sprite)
    me.current.addChild(sprite)
  }

  // Make the card lay down 
  const putDownCard = () => {
    if(!myColor || !myNumber) return
    // Set card texture
    setCardTexture(cardTextures.lay[myColor])
    setCardWidth(CARD_WIDTH_LAY)
    setCardHeight(CARD_HEIGHT_LAY)
    // Set number texture
    numSprite.texture = numSheetTextures[NUM_SHEET_MAP[`${myColor}${myNumber}_l`]]
    numSprite.width = CARD_WIDTH_LAY / 2
    numSprite.height = CARD_HEIGHT_LAY / 2
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
  const positionByIndex = index => {
    setCardPosition({
      x: LINE_X + CARD_WIDTH/2 + index * CARD_WIDTH + 2, 
      y: LINE_Y
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