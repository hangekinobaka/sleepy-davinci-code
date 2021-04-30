import { useEffect, useState } from 'react'
import { Stage, Sprite } from '@inlet/react-pixi'
import * as PIXI from 'pixi.js'

import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'
import Card from 'components/game/card'

const ratio = DESIGN_HEIGHT / DESIGN_WIDTH

export default function GameCanvas({w,h}) {
  const [canvasHeight, setCanvasHeight] = useState(w * ratio)
  const [app, setApp] = useState()

  // textures
  const [cardTexture, setCardTexture] = useState('')

  
  useEffect(()=>{
    setCanvasHeight(w * ratio)
  },[w,h])

  useEffect(()=>{
    if(!app) return
    
  },[app])

  useEffect(()=>{
    textureLoader()
  },[])

  // Methods

  /**
   * Load all the textures needed 
   */
  const textureLoader = ()=>{

    PIXI.Loader.shared
      .add([
        { name: 'card', url: 'img/card-w.png'}
      ])
      .load(setup)
  
    function setup(loader, resources){
      setCardTexture(resources.card.texture)
    }
  }

  return (
    <Stage 
      width={w}
      height={canvasHeight}
      options={{ 
        autoDensity: true,
        antialias: true, 
      }}
      onMount={setApp}
    >
      <Sprite
        image="img/bg.jpg"
        width={w}
        height={canvasHeight}
        anchor={0.5}
        x={w/2}
        y={canvasHeight/2}
      />

      <Card cardTexture={cardTexture}/>
    </Stage>
  )
}
