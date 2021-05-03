import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, Container, useApp } from '@inlet/react-pixi'
import { CARD_STATUS, CARD_PILE, CARD_TYPE } from 'configs/game'
import { closeDrawing } from 'redux/card/actions'
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/variables'
import {gsap} from 'gsap'

const CARD_WIDTH = 100
const CARD_HEIGHT = 140

const tl = gsap.timeline()
export default function Card({cardTextures, cardType = CARD_TYPE.draw}){
  const app = useApp()
  // Stores
  const canvasHeight = useSelector(state => state.win.canvasHeight)
  const w = useSelector(state => state.win.w)
  const ratio = useSelector(state => state.win.ratio)
  const drawingCard = useSelector(state => state.card.drawingCard)
  const isDrawing = useSelector(state => state.card.isDrawing)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.none)  
  const [displayMe, setDisplayMe] = useState(false)
  const me = useRef()

  // useEffect(()=>{
  //   switch (cardType){
  //   case CARD_TYPE.draw:
  //     break
  //   default: break
  //   }
  // },[cardType, app])

  useEffect(() => {
    switch (cardType){
    case CARD_TYPE.draw:
      drawStatusHandler()
      break
    default: break
    }
  },[cardStatus])

  useEffect(() => {
    if(isDrawing) setCardStatus(CARD_STATUS.draw)
  }, [isDrawing])

  // Methods
  const drawStatusHandler = () => {
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.drawOver:
      dispatch(closeDrawing())

      break
    case CARD_STATUS.draw:
      if(drawingCard === 'w'){
        pos = {
          x: 0, y: 0
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(drawingCard === 'b'){
        pos = {
          x: 0, y: 0
        }
        setCardTexture(cardTextures.stand.b)
      }
      setCardPosition(pos)
      setDisplayMe(true)
      setTimeout(() => setCardStatus(CARD_STATUS.drawOver), 0)
      break
    case CARD_STATUS.none:
    default: 
      setCardPosition(pos)
    }
  }

  // custom ticker
  // useTick(delta => {

  // i += 0.05 * delta

  // setCardPosition({
  //   x: Math.sin(i) * 1000,
  //   y: Math.sin(i/1.5) * 1000
  // })
  // })

  return (
    <Container 
      // scale={ratio}
      x={0}
      y={0}>
      <Sprite
        ref={me}
        texture={cardTexture}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        anchor={0.5}
        position={cardPosition}
        visible={displayMe}
      />
    </Container>
  )
}