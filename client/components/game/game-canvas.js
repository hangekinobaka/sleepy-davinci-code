import { useEffect, useState } from 'react'
import { Stage, Sprite } from '@inlet/react-pixi'
import { useSelector, useDispatch } from 'react-redux'
import * as PIXI from 'pixi.js'
import { Provider } from 'react-redux'
import store from 'redux/store'
import { setCardNumW, setCardNumB } from 'redux/card/actions'
import { WHITE_CARD_NUM, BLACK_CARD_NUM } from 'configs/game'

import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'
import {CARD_STATUS} from 'configs/game'
import Card from 'components/game/card'
import CardPile from 'components/game/card-pile'

const ratio = DESIGN_HEIGHT / DESIGN_WIDTH

export default function GameCanvas({w,h}) {
  const [canvasHeight, setCanvasHeight] = useState(w * ratio)
  const [app, setApp] = useState()
  const [drawCard, setDrawCard] = useState({
    lay: '', 
    stand: '',
    status: ''
  })

  // textures
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [bgTexture, setBgTexture] = useState('')
  const [layCardTextures, setLayCardTextures] = useState({})
  const [standCardTextures, setStandCardTextures] = useState({})
  // states
  const cardNumW = useSelector(state => state.card.cardNumW)
  const cardNumB = useSelector(state => state.card.cardNumB)
  const dispatch = useDispatch()
  
  useEffect(()=>{
    setCanvasHeight(w * ratio)
  },[w,h])

  // Handle the store changes
  useEffect(() => {
    setDrawCard({
      lay: layCardTextures.w, 
      stand: standCardTextures.w,
      status: CARD_STATUS.draw
    })
  },[cardNumW])
  useEffect(() => {
    setDrawCard({
      lay: layCardTextures.b, 
      stand: standCardTextures.b,
      status: CARD_STATUS.draw
    })
  },[cardNumB])

  useEffect(()=>{
    textureLoader()

    return () => {
      // Reset all the resources
      PIXI.Loader.shared.reset()
      PIXI.utils.clearTextureCache()
      dispatch(setCardNumW(WHITE_CARD_NUM))
      dispatch(setCardNumB(BLACK_CARD_NUM))
    }
  },[])

  // Methods
  /**
   * Load all the textures needed 
   */
  const textureLoader = ()=>{

    PIXI.Loader.shared
      .add([
        { name: 'bg', url: 'img/bg.jpg'},
        { name: 'card_w_stand', url: 'img/card-w.png'},
        { name: 'card_b_stand', url: 'img/card-b.png'},
        { name: 'card_w_lay', url: 'img/card-w-lay.png'},
        { name: 'card_b_lay', url: 'img/card-b-lay.png'}
      ])
      .load(setup)
  
    function setup(loader, resources){
      setBgTexture(resources.bg.texture)
      setLayCardTextures({
        w: resources.card_w_lay.texture,
        b: resources.card_b_lay.texture
      })
      setStandCardTextures({
        w: resources.card_w_stand.texture,
        b: resources.card_b_stand.texture
      })
      initTextures(resources)
      setTextureLoaded(true)
    }
  }


  // Handle when everthing is loaded
  const initTextures = (resources) => {
    setDrawCard({
      lay: resources.card_w_lay.texture, 
      stand: resources.card_w_stand.texture,
      status: CARD_STATUS.none
    })
  }

  return (
    <>
      {
        textureLoaded ? 
          <Stage 
            width={w}
            height={canvasHeight}
            options={{ 
              autoDensity: true,
              antialias: true, 
            }}
            onMount={setApp}
          >
            <Provider store={store}>
              <Sprite
                texture={bgTexture}
                width={w}
                height={canvasHeight}
                anchor={0.5}
                x={w/2}
                y={canvasHeight/2}
              />

              <CardPile cardTextures={layCardTextures} w={w} h={h} />

              <Card 
                cardTextures={{lay: drawCard.lay, stand: drawCard.stand}} 
                w={w} h={h}
                cardStatus={drawCard.status} />
            </Provider>
          </Stage>

          :

          <></>
      }
    </>
  )
}
