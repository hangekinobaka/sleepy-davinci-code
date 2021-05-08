import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  LINE_X, LINE_Y } from 'configs/game'
import { gsap } from 'gsap'
import { setOpDrawingCardColor, setOpDarggingLine } from 'redux/opponent/actions'


export default function OpCard({cardTextures, id}){
  // Stores
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const dragResult = useSelector(state => state.card.dragResult)
  const insertPlace = useSelector(state => state.card.insertPlace)
  const socketClient = useSelector(state => state.user.socketClient)
  const opDrawingCardColor = useSelector(state => state.opponent.opDrawingCardColor)
  const opLine = useSelector(state => state.opponent.opLine)
  const opDraggingLine = useSelector(state => state.opponent.opDraggingLine)

  const myLine = useSelector(state => state.card.myLine)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT)
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.draw)  
  const [displayMe, setDisplayMe] = useState(true)
  const [cardScale, setCardScale] = useState(1.5)
  const [numSprite, setNumSprite] = useState()
  const [myColor, setMyColor] = useState(null)
  const [myNumber, setMyNumber] = useState()
  const [myId, setMyId] = useState(id)
  const [myIndex, setMyIndex] = useState(null)
  const [cardInit, setCardInit] = useState(false)

  const me = useRef()

  useEffect(() => {
    statusHandler()
  },[cardStatus, opDrawingCardColor, opLine])

  const statusHandler = () => {
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.dragable:
      break
    case CARD_STATUS.draw:
      if(opDrawingCardColor === null || opLine === null) return

      if(opDrawingCardColor === 'w'){
        pos = {
          x: (DESIGN_WIDTH-CARD_PILE.CARD_MARGIN_BETWWEN)/2 + 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(opDrawingCardColor === 'b'){
        pos = {
          x: (DESIGN_WIDTH+CARD_PILE.CARD_MARGIN_BETWWEN)/2 - 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.b)
      }
      setMyColor(opDrawingCardColor)
      setCardPosition(pos)
      drawAnimation()
      break
    case CARD_STATUS.stand:
      break
    case CARD_STATUS.none:
    default: 
      setCardPosition(pos)
      break
    }
  }

  const drawAnimation = () => {
    const tl = gsap.timeline()

    const prevNum = myId - opLine.length - 1
    tl
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH - 170 - (CARD_WIDTH-40) * prevNum, y:350, scale:1.2},
        ease: 'power1.inOut',
        duration: 1.6,
        onComplete: () => {
          drawSuccessHandler()
        }
      })
  }
  const drawSuccessHandler = () => {
    const prevNum = myId - opLine.length - 1
    setCardPosition({x:DESIGN_WIDTH - 170 - (CARD_WIDTH-40) * prevNum, y:350})
    setCardStatus(CARD_STATUS.dragable)
    setCardScale(1.2)
    setOpDrawingCardColor(null)

    // Add the card to the waiting line
    console.log(opDraggingLine)
    const newLine = [...opDraggingLine]
    newLine.push({ color: opDrawingCardColor })
    dispatch(setOpDarggingLine(newLine))
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
        scale={cardScale}
      /></>
  )
}