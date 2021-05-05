import { useEffect, useState, useRef } from 'react'
import { Graphics, Container } from '@inlet/react-pixi'
import { CARD_WIDTH, CARD_HEIGHT, CARD_WIDTH_LAY, CARD_HEIGHT_LAY, WHITE_CARD_NUM } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/variables'

const LINE_X = 120
const LINE_Y = DESIGN_HEIGHT - 150
const LINE_WIDTH = CARD_WIDTH * 12 + 20
const LINE_HEIGHT = 100

let collideInterval = null
export default function CardLine(){
  let collideArea = null
  // Stores
  const myLine = useSelector(state => state.card.myLine)
  const isDragging = useSelector(state => state.card.isDragging)
  const draggingCard = useSelector(state => state.card.draggingCard)
  const dispatch = useDispatch()
  // Refs 
  const placeholders = []
  for ( let i = 0; i < WHITE_CARD_NUM; i++){
    placeholders.push(useRef())
  }

  useEffect(() => {
    return () => {
      // cleanup
    }
  }, [])

  useEffect(() => {
    if(isDragging){
      collideInterval = setInterval(collisionHandler, 200)
    }else{
      clearInterval(collideInterval)
    }
    return () => {
      // cleanup
      clearInterval(collideInterval)
    }
  }, [isDragging])

  // Methods
  const drawPlaceHolder= (i) => (g) => { 
    const x = i * CARD_WIDTH + 2
    g.clear()
    g.lineStyle(2, 0xff00ff, 1)
    g.beginFill(0xff00bb, 0.25)
    g.moveTo(x, 0)
    g.lineTo(x + CARD_WIDTH, 0)
    g.lineTo(x + CARD_WIDTH, LINE_HEIGHT)
    g.lineTo(x, LINE_HEIGHT)
    g.lineTo(x, 0)
    g.endFill()
  }

  const testCollision = (object1, object2) => {
    const bounds1 = object1.getBounds()
    const bounds2 = object2.getBounds()
    // 50% or more overlaps are seeing as collided
    return bounds1.x < bounds2.x + bounds2.width*0.5
          && bounds1.x + bounds1.width > bounds2.x + bounds2.width*0.5
          && bounds1.y < bounds2.y + bounds2.height
          && bounds1.y + bounds1.height > bounds2.y + bounds2.height*0.5
  }
  
  // check if the dragging card is colliding with the placeholder
  const collisionHandler = () => {
    if(placeholders.length === 0 || !draggingCard) return
    
    placeholders.forEach((ph, i) => {
      const collide = testCollision(draggingCard, ph.current) 
      if(collide) {
        if(collideArea === i) return
        collideArea = i
        console.log(`touch ${i}`)
      }else{
        if(collideArea === null || collideArea !== i) return 
        collideArea = null
        console.log(`leave ${i}`)
      }
    })
  }

  return (
    <Container
      position={[ LINE_X, LINE_Y] }
      width={LINE_WIDTH}
      height={LINE_HEIGHT}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Graphics 
            ref={placeholders[index]}
            key={`placeholders-${index}`}
            draw={drawPlaceHolder(index)}
          />
        ))
      }
    </Container>
  )
}