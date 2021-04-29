import { useEffect, useState } from 'react'
import { Stage, Text } from '@inlet/react-pixi'
import { TextStyle } from 'pixi.js'

import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'
const ratio = DESIGN_HEIGHT / DESIGN_WIDTH

function GameCanvas() {
  const [w, setW] = useState(window.innerWidth)
  const [h, setH] = useState(window.innerHeight)


  useEffect(()=>{
    window.addEventListener('resize', ()=>{
      setW(window.innerWidth)
      setH(window.innerHeight)
    })
  },[])


  return (
    <Stage 
      width={w}
      height={w * ratio}
      options={{ autoDensity: true }}
    >

    </Stage>
  )
}

export default GameCanvas