import { useEffect, useState } from 'react'
import { Sprite, Container } from '@inlet/react-pixi'
import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'

const WHITE_CARD_NUM = 12
const BLACK_CARD_NUM = 12
const CONTAINER_X = 800
const CONTAINER_Y = 600
const CARD_WIDTH = 150 
const CARD_HEIGHT = 90
const CARD_DELTA_Y = 15
const CARD_X = [-4,0,4]
const CARD_MARGIN_BETWWEN = 1000

export default function Card({cardTextures, w, h}){
  const [ratio, setRatio] = useState((w / DESIGN_WIDTH).toFixed(2))
  const [wNum, setWNum] = useState(WHITE_CARD_NUM)
  const [bNum, setBNum] = useState(BLACK_CARD_NUM)

  useEffect(()=>{
    setRatio((w / DESIGN_WIDTH).toFixed(2))
  },[w,h])

  return (
    <Container position={[CONTAINER_X*ratio,CONTAINER_Y*ratio]} scale={ratio}>

      {/* white card pile */}
      <Container>
        {
          [...new Array(WHITE_CARD_NUM)].map((item, index) => (
            <Sprite
              key={`card-pile-w-${index}`}
              texture={cardTextures.w}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              anchor={0.5}
              x={CARD_X[Math.floor((Math.random()*3))]}
              y={0-index*CARD_DELTA_Y}
            />
          ))
        }
      </Container>


      {/* black card pile */}
      {
        [...new Array(BLACK_CARD_NUM)].map((item, index) => (
          <Sprite
            key={`card-pile-b-${index}`}
            texture={cardTextures.b}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            anchor={0.5}
            x={CARD_MARGIN_BETWWEN + CARD_X[Math.floor((Math.random()*3))]}
            y={0-index*CARD_DELTA_Y}
          />
        ))
      }
      
    </Container >
  )
}