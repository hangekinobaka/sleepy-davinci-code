import { useEffect, useState, useRef } from 'react'
import { Sprite, Container, useTick } from '@inlet/react-pixi'
import { CARD_WIDTH, LINE_X, LINE_Y, LINE_WIDTH, LINE_HEIGHT, WHITE_CARD_NUM, NUM_SHEET_MAP, DESIGN_WIDTH } from 'configs/game'
import { useSelector, useDispatch } from 'react-redux'
import { setMyLine, setDragRes, setInsertPlace } from 'redux/card/actions'
import * as PIXI from 'pixi.js'

export default function NumberLine(){
  // Stores
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const dispatch = useDispatch()

  return (
    <Container
      position={[ 540, 440] }
      width={LINE_WIDTH * 0.7}
      height={100}
    >
      {
        [...new Array(WHITE_CARD_NUM)].map((item, index) => (
        
          <Sprite 
            key={`num-${index}`}
            texture={numSheetTextures[NUM_SHEET_MAP[`${'b'}${
              index === WHITE_CARD_NUM - 1 ? 'J' : index+1
            }_l`]]}
            width={30}
            height={70}
            anchor={0.5}
            position={[ (30) * index, 0]}
          />
        ))
      }
    </Container>
  )
}