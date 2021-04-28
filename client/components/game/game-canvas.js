import { useEffect, useState } from 'react'
import * as PIXI from 'pixi.js'
import styles from 'styles/game.module.scss'

export default function GameCanvas() {
  useEffect(()=>{

    const app = new PIXI.Application({
      width: 800, 
      height: 600, 
      backgroundColor: 0x1099bb, 
      // autoResize: true,
      // resizeTo: window
    })
    // app.renderer.resize(w, h)
    document.getElementById('game-canvas').appendChild(app.view)
    
    const container = new PIXI.Container()
  },[])

  return(
    <div id="game-canvas" className={styles['game-canvas']}></div>
  )
}