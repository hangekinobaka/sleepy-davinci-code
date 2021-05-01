import { useEffect, useState } from 'react'
import { Sprite } from '@inlet/react-pixi'

const CARD_WIDTH = 100 
const CARD_HEIGHT = 140
const CARD_DELTA_Y = 15
const CARD_X = [-4,0,4]
const CARD_MARGIN_BETWWEN = 1000

export default function Card({cardTextures, w, h, cardStatus}){
  
  useEffect(() => {
    console.log(`Change status ${cardStatus}`)
  },[cardStatus])

  return (
    <>
      <Sprite
        texture={cardTextures.stand}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        anchor={0.5}
        x={300}
        y={300}
      />
    </>
  )
}