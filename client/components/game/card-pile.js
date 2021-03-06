import { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite, Container } from '@inlet/react-pixi'
import { WHITE_CARD_NUM, BLACK_CARD_NUM, CARD_PILE, DESIGN_WIDTH, DESIGN_HEIGHT } from 'configs/game'
import { setDrawingCardColor, setIsInteractive, setIsDrawing, setCanDrawCard } from 'redux/card/actions'

const CARD_WIDTH = 180
const CARD_HEIGHT = 110
const CARD_DELTA_Y = 26
const CARD_X = [-5,0,5]
const PILE_X = DESIGN_WIDTH/2 - CARD_PILE.CARD_MARGIN_BETWWEN/2
const PILE_Y = DESIGN_HEIGHT/2 + 210


export default function CardPile({cardTextures}){
  // stores
  const cardNumW = useSelector(state => state.card.cardNumW)
  const cardNumB = useSelector(state => state.card.cardNumB)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const canDrawCard = useSelector(state => state.card.canDrawCard)
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
    dispatch(setIsInteractive(false))
    dispatch(setCanDrawCard(false))
    const color = e.target['data-color']
    dispatch(setDrawingCardColor(color))
    dispatch(setIsDrawing(true))
  }

  return (
    <>
      <Container position={{
        x:PILE_X,
        y:PILE_Y
      }}>

        {/* white card pile */}
        <Container 
          interactive={isInteractive && canDrawCard}
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
          interactive={isInteractive && canDrawCard}
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