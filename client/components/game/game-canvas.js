// libs
import { useEffect, useState } from 'react'
import { Stage, Sprite, Container, Text } from '@inlet/react-pixi'
import { useSelector, useDispatch } from 'react-redux'
import * as PIXI from 'pixi.js'
import { Provider } from 'react-redux'
import store from 'redux/store'
// redux
import { resetAll } from 'redux/card/actions'
// configs
import { NUM_SHEET_MAP, CARD_TYPE } from 'configs/game'
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/variables'
// utils
import { setFps } from 'utils/pixi'
// Components
import Card from 'components/game/card'
import CardPile from 'components/game/card-pile'
// gsap plugin register
import { PixiPlugin, MotionPathPlugin } from 'gsap/all'
import { gsap } from 'gsap'
PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)
gsap.registerPlugin(MotionPathPlugin)


export default function GameCanvas() {
  // stores
  const ratio = useSelector(state => state.win.ratio)
  const w = useSelector(state => state.win.w)
  const canvasHeight = useSelector(state => state.win.canvasHeight)
  const dispatch = useDispatch()

  // states
  const [app, setApp] = useState()
  const [ftpTextField, setFtpTextField] = useState('')
  const [loadingTextField, setLoadingTextField] = useState('')

  // textures
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [bgTexture, setBgTexture] = useState('')
  const [layCardTextures, setLayCardTextures] = useState({})
  const [standCardTextures, setStandCardTextures] = useState({})
  const [numSheetTextures, setNumSheetTextures] = useState()

  // Setup app initialization
  useEffect(()=>{
    if(!app) return
    
    // add fps widget
    if(process.env.NODE_ENV === 'development'){
      setFps(app, fps => {
        setFtpTextField(fps)
      })
    }
  }, [app])


  /**
   * Load all the textures needed 
   */
  useEffect(()=>{
    textureLoader()

    return () => {
      // Reset all the resources
      PIXI.Loader.shared.reset()
      PIXI.utils.clearTextureCache()
      dispatch(resetAll())
    }
  },[])

  // Methods
  const textureLoader = ()=>{

    PIXI.Loader.shared
      .add([
        { name: 'bg', url: 'img/bg.jpg'},
        { name: 'card_w_stand', url: 'img/card-w.png'},
        { name: 'card_b_stand', url: 'img/card-b.png'},
        { name: 'card_w_lay', url: 'img/card-w-lay.png'},
        { name: 'card_b_lay', url: 'img/card-b-lay.png'},
        { name: 'num_sheet', url: 'img/number-sheet.json'}
      ])
      .load(setup)
      .onProgress.add((e) => {
        const str = Math.floor(e.progress)
          .toString()
          .padStart(2, '0') + '%'
        
        setLoadingTextField(str)
      })
  
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
      setNumSheetTextures(resources.num_sheet)

      initTextures(resources)

      setTextureLoaded(true)
    }
  }


  // Handle when everthing is loaded
  const initTextures = (resources) => {
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
            x={0}
            y={0}
          >
              
            <Provider store={store}>
              <Container 
                scale={ratio}
              >
                <Sprite
                  texture={bgTexture}
                  width={DESIGN_WIDTH}
                  height={DESIGN_HEIGHT}
                  anchor={0.5}
                  x={DESIGN_WIDTH/2}
                  y={DESIGN_HEIGHT/2}
                />

                <CardPile cardTextures={layCardTextures} />
              
                {/* draw card instance: change with draw status */}
                <Card 
                  cardTextures={{lay: layCardTextures, stand: standCardTextures}} 
                  cardType={CARD_TYPE.draw} />
              </Container>
              
              {/* fps widget */}
              { process.env.NODE_ENV === 'development' ? 

                <Text
                  text={ftpTextField}
                  x={0}
                  y={0}/>
                :
                <></>
              }
            </Provider>
          </Stage>

          :

          <h1>
            {`Loading ... ${loadingTextField}`}
          </h1>
      }
    </>
  )
}
