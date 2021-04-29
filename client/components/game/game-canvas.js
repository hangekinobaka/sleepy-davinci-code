import { useEffect, useState } from 'react'
import * as PIXI from 'pixi.js'
import styles from 'styles/game.module.scss'

import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'
const ratio = DESIGN_HEIGHT / DESIGN_WIDTH

export default function GameCanvas() {

  const [w, setW] = useState(window.innerWidth)
  const [h, setH] = useState(window.innerHeight)
  const [app, setApp] = useState(new PIXI.Application({
    width: w, 
    height: w * ratio, 
    backgroundColor: 0x1099bb, 
    resizeTo: window,
    autoResize: true
  }))
  const [card, setCard] = useState()

  useEffect(()=>{
    // Window init handler
    window.addEventListener('resize', function(event){ 
      setW(window.innerWidth)
      setH(window.innerHeight)
    })

    document.getElementById('game-canvas').appendChild(app.view)
    const container = new PIXI.Container()
    app.stage.addChild(container)

    const texture = PIXI.Texture.from('/card-w.png')
    const card = new PIXI.Sprite(texture)
    setCard(card)
   
    container.addChild(card)
  },[app])

  useEffect(()=>{
    // Window resize handler
    if(!app || !card) return
    console.log(card)
    card.x = w / 2
    card.y = h / 2 
    card.anchor.set(0.5)
  },[w, h])

  return(
    <div id="game-canvas" className={styles['game-canvas']}></div>
  )
}