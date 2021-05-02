import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { CARD_STATUS, CARD_PILE } from 'configs/game'
 
const CARD_WIDTH = 150
const CARD_HEIGHT = 210

export default function Card({cardTextures, cardStatus}){
  // Stores
  const ratio = useSelector(state => state.win.ratio)
  const w = useSelector(state => state.win.w)
  const canvasHeight = useSelector(state => state.win.canvasHeight)
  const drawingCard = useSelector(state => state.card.drawingCard)

  useEffect(() => {
    console.log(`Change status ${cardStatus}`)
  },[cardStatus])

  // Methods
  const cardPosition = () => {
    switch (cardStatus){
    case CARD_STATUS.draw:
      if(drawingCard === 'w')
        return {
          x: -CARD_PILE.CARD_MARGIN_BETWWEN / 2 + 180, y: 0
        }
      else if(drawingCard === 'b')
        return {
          x: CARD_PILE.CARD_MARGIN_BETWWEN / 2 - 200, y: 0
        }
      break
    case CARD_STATUS.none:
    default: 
      return {
        x: 0, y: 0
      }
    }
  }

  return (
    <>
      <Sprite
        texture={cardTextures.stand}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        anchor={0.5}
        position={cardPosition()}
        visible={cardStatus !== CARD_STATUS.none}
      />
    </>
  )
}