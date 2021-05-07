// libs
import { useEffect, useState, useRef } from 'react'
import { Stage, Sprite, Container, Text } from '@inlet/react-pixi'
import { useSelector, useDispatch } from 'react-redux'
import * as PIXI from 'pixi.js'
import { Provider } from 'react-redux'
import store from 'redux/store'
// redux
import { setNumSheetTextures } from 'redux/card/actions'
// configs
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/game'
// utils
import { setFps } from 'utils/pixi'
// Components
import Card from 'components/game/card'
import CardPile from 'components/game/card-pile'
import CardLine from 'components/game/card-line'
// gsap plugin register
import { PixiPlugin } from 'gsap/all'
import { gsap } from 'gsap'
PixiPlugin.registerPIXI(PIXI)
gsap.registerPlugin(PixiPlugin)

export default function GameCanvas() {
  // stores
  const ratio = useSelector(state => state.win.ratio)
  const w = useSelector(state => state.win.w)
  const canvasHeight = useSelector(state => state.win.canvasHeight)
  const isDrawing = useSelector(state => state.card.isDrawing)
  const myLine = useSelector(state => state.card.myLine)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
  const dispatch = useDispatch()

  // states
  const [app, setApp] = useState()
  const [ftpTextField, setFtpTextField] = useState('')
  const [loadingTextField, setLoadingTextField] = useState('')
  const [myCardNum, setMyCardNum] = useState(0)

  // textures
  const [textureLoaded, setTextureLoaded] = useState(false)
  const [bgTexture, setBgTexture] = useState('')
  const [layCardTextures, setLayCardTextures] = useState({})
  const [standCardTextures, setStandCardTextures] = useState({})

  // Refs
  const isMounted = useRef(false)

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
    isMounted.current = true

    return () => {
      // Reset all the resources
      PIXI.Loader.shared.reset()
      PIXI.utils.clearTextureCache()
      isMounted.current = false
    }
  },[])

  useEffect(()=>{
    if(isDrawing) setMyCardNum(myCardNum+1)
  },[isDrawing])

  useEffect(() => {
    // if my line number not fit the local card count, meaning that it is an init state
    if(myCardNum < myLine.length + myDraggingLine.length){
      setMyCardNum(myLine.length + myDraggingLine.length)
    }
  }, [myLine, myDraggingLine])

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
        if(isMounted.current) setLoadingTextField(str)
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
      dispatch(setNumSheetTextures(resources.num_sheet.textures))

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
                {/* bg */}
                <Sprite
                  texture={bgTexture}
                  width={DESIGN_WIDTH}
                  height={DESIGN_HEIGHT}
                  anchor={0.5}
                  x={DESIGN_WIDTH/2}
                  y={DESIGN_HEIGHT/2}
                />

                {/* draw card pile */}
                <CardPile cardTextures={layCardTextures} />

                {/* my card line */}
                <CardLine />
              
                {/* card instances */}
                {
                  [...new Array(myCardNum)].map((item, index) => (
                    <Card 
                      key={`card-${index}`}
                      id={index+1}
                      cardTextures={{lay: layCardTextures, stand: standCardTextures}} 
                    />
                  ))
                }

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
