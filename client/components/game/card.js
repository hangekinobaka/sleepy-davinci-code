import { useEffect, useState } from 'react'
import * as PIXI from 'pixi.js'
import { Sprite } from '@inlet/react-pixi'

export default function Card({cardTexture}){

  useEffect(()=>{
  },[])
    
     
  return (
    <>
      <Sprite
        texture={cardTexture}
        width={100}
        height={150}
        anchor={0.5}
        x={300}
        y={300}
      />
    </>
  )
}