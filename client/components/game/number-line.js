import { useEffect, useState, useRef } from 'react'
import { Sprite, Container, useTick } from '@inlet/react-pixi'
import { WHITE_CARD_NUM, NUM_SHEET_MAP, DESIGN_WIDTH } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { gsap } from 'gsap'

const NUM_WIDTH = 120
const NUM_LINE_X = 500
const NUM_LINE_Y = 360
const NUM_LINE_HEIGHT = 100

export default function NumberLine(){
  // Stores
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const selectIndex = useSelector(state => state.opponent.selectIndex)
  const dispatch = useDispatch()
  // States
  const [numPositions, setNumPositions] = useState(new Array(WHITE_CARD_NUM).fill({x:0, y:0}))
  // Refs 
  const numberBlocks = []

  // init num array configs
  const temp = numPositions
  // for ( let i = 0; i < WHITE_CARD_NUM; i++){
  //   numberBlocks.push(useRef())

  // }

  // Watch if a card is selected
  useEffect(() => {
    if(selectIndex === null) return 
    
    const tl = gsap.timeline({ paused:true } )
    numberBlocks.forEach((block,i) => {

      tl
        .fromTo(block.current, 
          {
            pixi: {x: 400, y: 0},
          },
          {
            pixi: { x:100, y: 0},
            ease: 'power1.out',
            duration: .5,
          },
          '+=1'
        )
    })
    // console.log(tl)

    tl.play()

    
  }, [selectIndex])


  return (
    <Container
      position={[ NUM_LINE_X, NUM_LINE_Y] }
      width={NUM_WIDTH * WHITE_CARD_NUM}
      height={NUM_LINE_HEIGHT}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Sprite 
            ref={numberBlocks[index]}
            key={`num-${index}`}
            texture={numSheetTextures[NUM_SHEET_MAP[`${'b'}${
              index === WHITE_CARD_NUM - 1 ? 'J' : index+1
            }_l`]]}
            width={NUM_WIDTH}
            height={NUM_LINE_HEIGHT}
            data-num={index === WHITE_CARD_NUM - 1 ? 'J' : index+1}
            position={[0,0]}
          />
        ))
      }
    </Container>
  )
}