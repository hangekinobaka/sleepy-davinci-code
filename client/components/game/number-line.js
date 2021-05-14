import { useEffect, useState, useRef } from 'react'
import { Sprite, Container, useTick } from '@inlet/react-pixi'
import { WHITE_CARD_NUM, NUM_SHEET_MAP, DESIGN_WIDTH, DESIGN_HEIGHT } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { gsap } from 'gsap'
import { setIsInteractive } from 'redux/card/actions'
import { setSelectNum } from 'redux/opponent/actions'

const NUM_WIDTH = 120
const NUM_LINE_X = 530
const NUM_LINE_Y = 360

export default function NumberLine(){
  // Stores
  const isInteractive = useSelector(state => state.card.isInteractive)
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const selectIndex = useSelector(state => state.opponent.selectIndex)
  const dispatch = useDispatch()
  // States
  const [displayMe, setDisplayMe] = useState(false)
  const [numPositions, setNumPositions] = useState(new Array(WHITE_CARD_NUM).fill({x:0, y:0}))
  // Refs 
  const numberBlocks = useRef(new Array(WHITE_CARD_NUM))

  // Watch if a card is selected
  useEffect(() => {
    if(!numberBlocks.current) return

    numberBlocks.current.forEach(block => {
      // Reset all events
      block.removeAllListeners()
    })

    if(selectIndex === null) {
      dispatch(setSelectNum(null))
      setDisplayMe(false) 
      return
    }
    setDisplayMe(true)
    setNumPositions(numPositions.map((pos,i) => ({
      x:NUM_WIDTH * selectIndex, 
      y:0
    })))
    const tl = gsap.timeline({ paused:true } )
    numberBlocks.current.forEach((block,i) => {
      tl
        .fromTo(block, 
          {
            pixi: {x: NUM_WIDTH * selectIndex, y: 0},
          },
          {
            pixi: { x:NUM_WIDTH * i, y: 0},
            ease: 'power1.out',
            duration: .4,
            onComplete: () => {
              initPos()
              dispatch(setIsInteractive(true))
              setTap(block)
            }
          },
          '<'
        )
    })
    tl.play()
    
  }, [selectIndex])

  const initPos = () => {
    setNumPositions(numPositions.map((pos,i) => ({
      x:NUM_WIDTH * i, 
      y:0
    })))
  }

  const setTap = (block) => {
    block.on('pointerdown', numClickHandler)
  }

  const numClickHandler = e => {
    dispatch(setSelectNum(e.target['data-num']))
  }

  return (
    <Container
      position={[ NUM_LINE_X, NUM_LINE_Y] }
      visible={displayMe}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Sprite 
            ref={el => numberBlocks.current[index] = el}
            key={`num-${index}`}
            texture={numSheetTextures[NUM_SHEET_MAP[`${'b'}${
              index === WHITE_CARD_NUM - 1 ? 'J' : index+1
            }_l`]]}
            width={NUM_WIDTH}
            height={100}
            data-num={index === WHITE_CARD_NUM - 1 ? 'J' : index+1}
            position={numPositions[index]}

            interactive={
              isInteractive
            }
          />
        ))
      }
    </Container>
  )
}