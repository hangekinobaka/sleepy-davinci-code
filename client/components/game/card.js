import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, useApp } from '@inlet/react-pixi'
import { CARD_STATUS, CARD_PILE, CARD_TYPE } from 'configs/game'
import { closeDrawing } from 'redux/card/actions'
import * as PIXI from 'pixi.js'
import { TweenMax } from 'gsap'

const CARD_WIDTH = 150
const CARD_HEIGHT = 210

let i = 0
export default function Card({cardTextures, cardType = CARD_TYPE.draw}){
  const app = useApp()
  // Stores
  const drawingCard = useSelector(state => state.card.drawingCard)
  const isDrawing = useSelector(state => state.card.isDrawing)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.none)  
  const me = useRef()

  useEffect(()=>{
    var sprite = new PIXI.Sprite(cardTextures.stand.w)
    app.stage.addChild(sprite)
    switch (cardType){
    case CARD_TYPE.draw:
      TweenMax.to(sprite,  {pixi:{scaleX:2, scaleY:1.5, skewX:30, rotation:60}})
      app.ticker.add((delta) => {

      })
      break
    default: break
    }
  },[cardType, app])

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
      setTimeout(() => setCardStatus(CARD_STATUS.none), 1000)
      break
    case CARD_STATUS.draw:
      if(drawingCard === 'w'){
        pos = {
          x: -CARD_PILE.CARD_MARGIN_BETWWEN / 2 + 180, y: 0
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(drawingCard === 'b'){
        pos = {
          x: CARD_PILE.CARD_MARGIN_BETWWEN / 2 - 200, y: 0
        }
        setCardTexture(cardTextures.stand.b)
      }
      setCardPosition(pos)
      setTimeout(() => setCardStatus(CARD_STATUS.drawOver), 10)
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
    <>
      <Sprite
        ref={me}
        texture={cardTexture}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        anchor={0.5}
        position={cardPosition}
        visible={cardStatus !== CARD_STATUS.none}
      />
    </>
  )
}