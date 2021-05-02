import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, Container } from '@inlet/react-pixi'
import { WHITE_CARD_NUM, BLACK_CARD_NUM, CARD_PILE } from 'configs/game'
import { setCardNumW, setCardNumB } from 'redux/card/actions'

const CARD_WIDTH = 150 
const CARD_HEIGHT = 90
const CARD_DELTA_Y = 15
const CARD_X = [-4,0,4]

export default function CardPile({cardTextures}){
  // stores
  const ratio = useSelector(state => state.win.ratio)
  const w = useSelector(state => state.win.w)
  const canvasHeight = useSelector(state => state.win.canvasHeight)
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
      <Container position={[w/2 - CARD_PILE.CARD_MARGIN_BETWWEN*ratio/2,canvasHeight/2]} scale={ratio}>

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
                x={CARD_PILE.CARD_MARGIN_BETWWEN + bRandomFactor[index]}
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