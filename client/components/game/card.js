import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, useApp } from '@inlet/react-pixi'
import { CARD_STATUS, CARD_PILE, CARD_TYPE, NUM_SHEET_MAP } from 'configs/game'
import { closeDrawing } from 'redux/card/actions'
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/variables'
import { gsap } from 'gsap'
import { setIsInteractive } from 'redux/card/actions'
import * as PIXI from 'pixi.js'

const CARD_WIDTH = 180
const CARD_HEIGHT = 252

export default function Card({cardTextures}){
  const app = useApp()
  // Stores
  const drawingCard = useSelector(state => state.card.drawingCard)
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.draw)  
  const [displayMe, setDisplayMe] = useState(false)
  const me = useRef()

  useEffect(() => {
    statusHandler()
  },[cardStatus])

  // Methods
  const statusHandler = () => {
    let pos = { x: 0, y: 0 }
    switch (cardStatus){
    case CARD_STATUS.drawOver:
      dispatch(closeDrawing())
      dispatch(setIsInteractive(true))
      break
    case CARD_STATUS.draw:
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
      // Set init position
      addNumber()
      setCardPosition(pos)
      drawAnimation()
      setDisplayMe(true)
      break
    case CARD_STATUS.none:
    default: 
      setCardPosition(pos)
    }
  }

  const drawAnimation = () => {
    const tl = gsap.timeline()

    tl
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-1000, y:DESIGN_HEIGHT-350, scaleX: 3, scaleY: 3},
        ease: 'power1.inOut',
        duration: 1.5
      })
      .to(me.current, {
        pixi: {x:DESIGN_WIDTH-170, y:DESIGN_HEIGHT-350, scaleX: 2, scaleY: 2},
        ease: 'power1.out',
        duration: .8,
        onComplete: () => setCardStatus(CARD_STATUS.drawOver)
      })
  }

  // Add the number sprite
  const addNumber = () => {
    const sprite =  PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP['b10_s']])
    sprite.width = CARD_WIDTH / 2
    sprite.height = CARD_HEIGHT / 2
    sprite.anchor.set(0.5)
    me.current.addChild(sprite)
  }

  return (
    <>
      <Sprite
        ref={me}
        texture={cardTexture}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        anchor={0.5}
        position={cardPosition}
        visible={displayMe}
      />
    </>
  )
}