import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, useApp } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  LINE_X, LINE_Y } from 'configs/game'
import { closeDrawing, setIsDragging, setDraggingCard, setIsInteractive,
  setCardIdCounter, setInsertPlace } from 'redux/card/actions'
import { gsap } from 'gsap'
import * as PIXI from 'pixi.js'

let isDraggingLocal = false
export default function Card({cardTextures}){
  // Stores
  const drawingCard = useSelector(state => state.card.drawingCard)
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const drawingNum = useSelector(state => state.card.drawingNum)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const dragResult = useSelector(state => state.card.dragResult)
  const myLine = useSelector(state => state.card.myLine)
  const cardIdCounter = useSelector(state => state.card.cardIdCounter)
  const insertPlace = useSelector(state => state.card.insertPlace)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT)
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.draw)  
  const [displayMe, setDisplayMe] = useState(false)
  const [numSprite, setNumSprite] = useState()
  const [myColor, setMyColor] = useState()
  const [myNumber, setMyNumber] = useState()
  const [myId, setMyId] = useState(cardIdCounter)
  const [myIdex, setMyIdex] = useState(null)
  const me = useRef()

  useEffect(() => {
    dispatch(setCardIdCounter(cardIdCounter+1))
  }, [])

  useEffect(() => {
    statusHandler()
  },[cardStatus, drawingNum])

  useEffect(() => {
    if(dragResult === null || cardStatus !== CARD_STATUS.dragable) return
    
    if(dragResult.success){
      setCardStatus(CARD_STATUS.stand)
      positionByIndex(dragResult.index)
      setMyIdex(dragResult.index)
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
    if(myIdex === null) return
    
    if(insertPlace === null){
      positionByIndex(myIdex)
      return
    }

    if(insertPlace <= myIdex){
      positionByIndex(myIdex+1)
    }

  }, [insertPlace])

  // Methods
  const statusHandler = () => {
    let pos = { x: 0, y: 0 }
    switch (cardStatus){
    case CARD_STATUS.dragable:
      dispatch(closeDrawing())
      dispatch(setIsInteractive(true))
      break
    case CARD_STATUS.draw:
      if(!drawingNum) return
      dispatch(setDraggingCard({
        id: myId,
        sprite: me.current
      }))

      if(drawingCard === 'w'){
        pos = {
          x: (DESIGN_WIDTH-CARD_PILE.CARD_MARGIN_BETWWEN)/2 + 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(drawingCard === 'b'){
        pos = {
          x: (DESIGN_WIDTH+CARD_PILE.CARD_MARGIN_BETWWEN)/2 - 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.b)
      }
      setMyColor(drawingCard)
      addNumber()
      setCardPosition(pos)
      drawAnimation()
      setDisplayMe(true)
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
    tl
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-1000, y:DESIGN_HEIGHT-350, scale:scale+1},
        ease: 'power1.inOut',
        duration: 1.3
      })
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-170, y:DESIGN_HEIGHT-350, scale:scale},
        ease: 'power1.out',
        duration: .6,
        onComplete: () => {
          setDrag()
        }
      })
  }

  // Set drag status
  const setDrag = () => {
    setCardPosition({x:DESIGN_WIDTH-170, y:DESIGN_HEIGHT-350})
    setCardStatus(CARD_STATUS.dragable)

    me.current
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove)
  }

  // Add the number sprite
  const addNumber = () => {
    if(!numSheetTextures || !drawingNum || !drawingCard) return

    const sprite =  PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP[`${drawingCard}${drawingNum}_s`]])
    sprite.width = CARD_WIDTH / 2
    sprite.height = CARD_HEIGHT / 2
    sprite.anchor.set(0.5)
    setNumSprite(sprite)
    me.current.addChild(sprite)
    setMyNumber(drawingNum)
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
    isDraggingLocal = true
    dispatch(setIsDragging(true))
  }
  const onDragEnd = () => {
    isDraggingLocal = false
    dispatch(setIsDragging(false))
    me.current.off()
  }
  const onDragMove = event => {
    if (isDraggingLocal) {
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

        interactive={isInteractive && (cardStatus === CARD_STATUS.dragable)}
      />
    </>
  )
}