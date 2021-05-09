import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, 
  CARD_STATUS, CARD_PILE, NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  OP_LINE_X, OP_LINE_Y } from 'configs/game'
import { gsap } from 'gsap'
import { setOpDrawingCardColor, setOpDarggingLine } from 'redux/opponent/actions'


export default function OpCard({cardTextures, id}){
  // Stores
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const socketClient = useSelector(state => state.user.socketClient)
  const opDrawingCardColor = useSelector(state => state.opponent.opDrawingCardColor)
  const opLine = useSelector(state => state.opponent.opLine)
  const opDraggingLine = useSelector(state => state.opponent.opDraggingLine)

  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH*0.7)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT*0.7)
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.draw)  
  const [displayMe, setDisplayMe] = useState(false)
  const [cardScale, setCardScale] = useState(1.5)
  const [numSprite, setNumSprite] = useState()
  const [myColor, setMyColor] = useState(null)
  const [myNumber, setMyNumber] = useState()
  const [myId, setMyId] = useState(id)
  const [myIndex, setMyIndex] = useState(null)
  const [cardInit, setCardInit] = useState(false)

  const me = useRef()

  useEffect(() => {
    if(cardInit || opLine === null || opDraggingLine === null) return
    
    // Check if this id already exist in opLine
    // If yes means this card is an init stand card, directly go to the opponent line
    for(let i = 0; i < opLine.length; i++ ){
      if(myId === opLine[i].id){
        const { color } = opLine[i]
        positionByIndex(i)
        setMyIndex(i)
        setCardTexture(cardTextures.stand[color])
        setMyColor(color)
        setDisplayMe(true)
        setCardStatus(CARD_STATUS.stand)  
        return setCardInit(true)  
      }
    }    

    // Check if opDraggingLine is not 0 and this card id is over opLine's
    // If yes means that this card go direct to the wait line
    if(opDraggingLine.length > 0 && myId > opLine.length){
      for(let i = 0; i < opDraggingLine.length; i++ ){
        if(myId - opLine.length === i + 1){
          const { color } = opDraggingLine[i]
          setCardTexture(cardTextures.stand[color])
          setMyColor(color)
          setDisplayMe(true)
          drawSuccessHandler()
          return setCardInit(true)      
        }
      }  
    }  

    setCardStatus(CARD_STATUS.draw)  
    return setCardInit(true)  

  }, [opLine, opDraggingLine])

  useEffect(() => {
    statusHandler()
  },[cardStatus, opDrawingCardColor, opLine])

  const statusHandler = () => {
    if( cardStatus === null ) return
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.dragable:
      if( opLine === null || opDraggingLine === null) return
      // Insert all un-arranged cards
      for(let i = 0; i < opLine.length; i++ ){
        if( myId === opLine[i].id && 
          (opDraggingLine.filter(obj => obj.id === opLine[i].id)).length !== 0 ){
          positionByIndex(i)
          setMyIndex(i)
          setCardStatus(CARD_STATUS.stand)  
          return
        }
      }    
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
      setDisplayMe(true)
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
    // Add the card to the waiting line
    const newLine = [...opDraggingLine]
    newLine.push({ color: opDrawingCardColor, id: myId })
    dispatch(setOpDarggingLine(newLine))

    const tl = gsap.timeline()
    const scale = me.current.scale.x
    const prevNum = myId - opLine.length - 1
    tl
      .fromTo(me.current, 
        {
          pixi: { scale:scale*1.7},

        },
        {
          pixi: {x:DESIGN_WIDTH - 110 - cardWidth * prevNum, y:OP_LINE_Y + 70, scale:scale},
          ease: 'power1.inOut',
          duration: 1.6,
          onComplete: () => {
            drawSuccessHandler()
          }}
      )
  }
  const drawSuccessHandler = () => {
    const prevNum = myId - opLine.length - 1
    setCardPosition({x:DESIGN_WIDTH - 110 - cardWidth * prevNum, y:OP_LINE_Y + 70})
    setCardStatus(CARD_STATUS.dragable)
    dispatch(setOpDrawingCardColor(null))
  }

  // Positioning by index
  const positionByIndex = index => {
    setCardPosition({
      x: OP_LINE_X + cardWidth/2 + index * cardWidth + 2, 
      y: OP_LINE_Y
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
      /></>
  )
}