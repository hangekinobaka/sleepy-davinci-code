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
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [cardTexture, setCardTexture] = useState('')
  const [bgTexture, setBgTexture] = useState('')

  
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
        { name: 'bg', url: 'img/bg.jpg'},
        { name: 'card', url: 'img/card-w.png'}
      ])
      .load(setup)
  
    function setup(loader, resources){
      setCardTexture(resources.card.texture)
      setBgTexture(resources.bg.texture)
      setTextureLoaded(true)
    }
  }

  return (
    <>
      {
        textureLoaded ? 
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
              texture={bgTexture}
              width={w}
              height={canvasHeight}
              anchor={0.5}
              x={w/2}
              y={canvasHeight/2}
            />

            <Card cardTexture={cardTexture}/>
          </Stage>

          :

          <></>
      }
    </>
  )
}
