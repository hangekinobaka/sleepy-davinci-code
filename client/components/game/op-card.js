import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  LINE_X, LINE_Y } from 'configs/game'

export default function OpCard({cardTextures, id}){
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
  const [myIndex, setMyIndex] = useState(null)
  const [cardInit, setCardInit] = useState(false)
  const [dragIndex, setDragIndex] = useState(null)

  return (
    <>
      <Sprite
        // ref={me}
        texture={cardTexture}
        width={cardWidth}
        height={cardHeight}
        anchor={0.5}
        position={cardPosition}
        visible={displayMe}
      /></>
  )
}