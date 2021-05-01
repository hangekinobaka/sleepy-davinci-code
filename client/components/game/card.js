import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'

const CARD_WIDTH = 150
const CARD_HEIGHT = 210

export default function Card({cardTextures, cardStatus}){
  // Stores
  const ratio = useSelector(state => state.win.ratio)

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
        position={[0*ratio, 0*ratio]}
      />
    </>
  )
}