import { useEffect, useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, Container } from '@inlet/react-pixi'
import { DESIGN_WIDTH} from 'configs/variables'
import { WHITE_CARD_NUM, BLACK_CARD_NUM } from 'configs/game'
import { setCardNumW, setCardNumB } from 'redux/card/actions'

const CONTAINER_X = 800
const CONTAINER_Y = 600
const CARD_WIDTH = 150 
const CARD_HEIGHT = 90
const CARD_DELTA_Y = 15
const CARD_X = [-4,0,4]
const CARD_MARGIN_BETWWEN = 1000

export default function CardPile({cardTextures, w, h}){
  const [ratio, setRatio] = useState((w / DESIGN_WIDTH).toFixed(2))

  // stores
  const cardNumW = useSelector(state => state.card.cardNumW)
  const cardNumB = useSelector(state => state.card.cardNumB)
  const dispatch = useDispatch()

  /**
   * Generate the card pile's random factors
   */
  const genRand = () => {
    const randArr = []
    for(let i = 0; i < WHITE_CARD_NUM; i++){
      const rand = CARD_X[Math.floor((Math.random()*3))]
      randArr.push(rand)
    }
    return randArr
  }

  // generate the x differences
  const wRandomFactor = useMemo(genRand,[])
  const bRandomFactor = useMemo(genRand,[])

  useEffect(()=>{
    setRatio((w / DESIGN_WIDTH).toFixed(2))
  },[w,h])

  // methods
  const pileClickHandler = (e)=>{
    const color = e.target['data-color']
    if(color === 'w'){
      dispatch(setCardNumW(cardNumW - 1))
    }else if(color === 'b'){
      dispatch(setCardNumB(cardNumB - 1))
    }
  }

  return (
    <>
      <Container position={[CONTAINER_X*ratio,CONTAINER_Y*ratio]} scale={ratio}>

        {/* white card pile */}
        <Container 
          interactive={true}
          pointerdown={pileClickHandler}
          data-color="w">
          {
            [...new Array(WHITE_CARD_NUM)].map((item, index) => (
              <Sprite
                key={`card-pile-w-${index}`}
                texture={cardTextures.w}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                anchor={0.5}
                x={wRandomFactor[index]}
                y={0-index*CARD_DELTA_Y}
                visible={index <= cardNumW - 1}
              />
            ))
          }
        </Container>


        {/* black card pile */}
        <Container 
          interactive={true}
          pointerdown={pileClickHandler}
          data-color="b">
          {
            [...new Array(BLACK_CARD_NUM)].map((item, index) => (
              <Sprite
                key={`card-pile-b-${index}`}
                texture={cardTextures.b}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                anchor={0.5}
                x={CARD_MARGIN_BETWWEN + bRandomFactor[index]}
                y={0-index*CARD_DELTA_Y}
                visible={index <= cardNumB - 1}
              />
            ))
          }
        </Container>
      </Container >
    </>
  )
}