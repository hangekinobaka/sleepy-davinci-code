import { useEffect, useState } from 'react'
import { Sprite } from '@inlet/react-pixi'

export default function Card({cardTextures, w, h, cardStatus}){
  
  useEffect(() => {
    console.log(`Change status ${cardStatus}`)
  },[cardStatus])

  return (
    <>
      <Sprite
        texture={cardTextures.stand}
        width={100}
        height={150}
        anchor={0.5}
        x={300}
        y={300}
      />
    </>
  )
}