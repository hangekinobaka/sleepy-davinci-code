import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { gsap } from 'gsap'
import { setOpDrawingCardColor, setOpDarggingLine, setOpDarggingLineTemp, 
  setSelectIndex } from 'redux/opponent/actions'
import { setIsInteractive } from 'redux/card/actions'
import { setShowConfirmBtn } from 'redux/ui/actions'
import { CONFIRM_TYPE } from 'configs/ui'
import { CARD_WIDTH, CARD_HEIGHT, CARD_STATUS, CARD_PILE, 
  NUM_SHEET_MAP, DESIGN_WIDTH,DESIGN_HEIGHT,
  OP_LINE_X, OP_LINE_Y, GAME_STATUS } from 'configs/game'
import * as PIXI from 'pixi.js'

const SCALE_CARD_SIZE = 0.7
const SCALE_CARD_SIZE_SELECT = 0.8

export default function OpCard({cardTextures, id}){
  // Stores
  const numSheetTextures = useSelector(state => state.card.numSheetTextures)
  const isInteractive = useSelector(state => state.card.isInteractive)
  const opDrawingCardColor = useSelector(state => state.opponent.opDrawingCardColor)
  const opLine = useSelector(state => state.opponent.opLine)
  const opDraggingLine = useSelector(state => state.opponent.opDraggingLine)
  const opDraggingLineTemp = useSelector(state => state.opponent.opDraggingLineTemp)
  const disableSelect = useSelector(state => state.opponent.disableSelect)
  const selectIndex = useSelector(state => state.opponent.selectIndex)
  const selectNum = useSelector(state => state.opponent.selectNum)
  const statusObj = useSelector(state => state.user.statusObj)
  const user = useSelector(state => state.user.user)

  const dispatch = useDispatch()
  // States
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0})
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH*SCALE_CARD_SIZE)
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT*SCALE_CARD_SIZE)
  const [cardTexture, setCardTexture] = useState(cardTextures.stand.w)
  const [cardStatus, setCardStatus] = useState(CARD_STATUS.none)  
  const [displayMe, setDisplayMe] = useState(false)
  const [numSprite, setNumSprite] = useState(null)
  const [myColor, setMyColor] = useState(null)
  const [myNumber, setMyNumber] = useState(null)
  const [myId, setMyId] = useState(id)
  const [myIndex, setMyIndex] = useState(null)
  const [cardInit, setCardInit] = useState(false)
  const [selected, setSelected] = useState(false)

  const me = useRef()

  useEffect(() => {
    // init process

    if(cardInit || opLine === null || opDraggingLine === null || statusObj.status === null ) return
    
    // Check if this id already exist in opLine
    // If yes means this card is an init stand card, directly go to the opponent line
    for(let i = 0; i < opLine.length; i++ ){
      if(myId === opLine[i].id){
        const { color, revealed } = opLine[i]
        positionByIndex(i)
        setMyIndex(i)
        setCardTexture(cardTextures.stand[color])
        setMyColor(color)
        setDisplayMe(true)

        // Check if I am guessing a card
        // If yes highlight the card and show the guessing number
        if((statusObj.status === GAME_STATUS.USER_1_ANSWER && user === 2) || 
        statusObj.status === GAME_STATUS.USER_2_ANSWER && user === 1){
          if(statusObj.statusData.index === i){
            addNumber(statusObj.statusData.number, color)
            setSelected(true)
          }
        }

        // Check if I am revealed
        // If yes, show the number and becomes immutable
        if(revealed){
          addNumber(10, color)
          setCardStatus(CARD_STATUS.standShow)
        }else{
          setCardStatus(CARD_STATUS.stand)
        }
        return setCardInit(true)  
      }
    }    

    // Check if opDraggingLine is not 0 and this card id is over opLine's
    // If yes means that this card go direct to the wait line
    if(opDraggingLine.length > 0 && myId > opLine.length){
      for(let i = 0; i < opDraggingLine.length; i++ ){
        if(myId - opLine.length === i + 1){
          const { color } = opDraggingLine[i]
          setCardTexture(cardTextures.stand[color])
          setMyColor(color)
          setDisplayMe(true)
          drawSuccessHandler()
          return setCardInit(true)      
        }
      }  
    }  

    setCardStatus(CARD_STATUS.draw)  
    return setCardInit(true)  

  }, [opLine, opDraggingLine, statusObj])

  useEffect(() => {
    switch(statusObj.status){
    case GAME_STATUS.PUT_IN_LINE_INIT:
    case GAME_STATUS.USER_1_PUT_IN_LINE:
    case GAME_STATUS.USER_2_PUT_IN_LINE:
      setCardStatus(CARD_STATUS.dragable)
      break
    default: 
      break
    }
  }, [statusObj.status])

  // Handle drag status triggered by line change
  useEffect(() => {
    if( cardStatus === CARD_STATUS.dragable){
      if( opLine === null || opDraggingLineTemp === null ) return
      
      // Insert all un-arranged cards
      for(let i = 0; i < opLine.length; i++ ){
        if( myId === opLine[i].id && 
          (opDraggingLineTemp.filter(obj => obj.id === opLine[i].id)).length !== 0 ){
          positionByIndex(i)
          setMyIndex(i)
          setCardStatus(CARD_STATUS.stand)  
          return
        }
      }    
    }
  }, [opLine, opDraggingLineTemp, cardStatus])

  useEffect(() => {
    statusHandler()
  },[cardStatus, opDrawingCardColor ])

  const statusHandler = () => {
    if( cardStatus === null ) return
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.dragable:
      break
    case CARD_STATUS.draw:
      if(opDrawingCardColor === null || opLine === null) return

      if(opDrawingCardColor === 'w'){
        pos = {
          x: (DESIGN_WIDTH-CARD_PILE.CARD_MARGIN_BETWWEN)/2 + 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.w)
      }
      else if(opDrawingCardColor === 'b'){
        pos = {
          x: (DESIGN_WIDTH+CARD_PILE.CARD_MARGIN_BETWWEN)/2 - 100, y: DESIGN_HEIGHT/2 - 60
        }
        setCardTexture(cardTextures.stand.b)
      }
      dispatch(setIsInteractive(true))
      setMyColor(opDrawingCardColor)
      setCardPosition(pos)
      setDisplayMe(true)
      drawAnimation()
      break
    case CARD_STATUS.standShow:
    case CARD_STATUS.stand:
    case CARD_STATUS.none:
      break
    default: 
      setCardPosition(pos)
      break
    }
  }

  // Handle when select number changed
  useEffect(() => {
    if(selectIndex !== myIndex || selectNum === null) return 

    addNumber(selectNum)
    dispatch(setShowConfirmBtn(true, CONFIRM_TYPE.NUM_SELECT))
    
  }, [selectNum])

  const drawAnimation = () => {
    // Add the card to the waiting line
    const newLine = [...opDraggingLine]
    newLine.push({ color: opDrawingCardColor, id: myId })
    dispatch(setOpDarggingLine(newLine))
    dispatch(setOpDarggingLineTemp(newLine))

    const tl = gsap.timeline()
    const scale = me.current.scale.x
    const prevNum = myId - opLine.length - 1
    gsap
      .fromTo(me.current, 
        {
          pixi: { scale:scale*1.7},
        },
        {
          pixi: {x:DESIGN_WIDTH - 110 - cardWidth * prevNum, y:OP_LINE_Y + 70, scale:scale},
          ease: 'power1.inOut',
          duration: 1.6,
          onComplete: () => {
            drawSuccessHandler()
          }}
      )
  }
  const drawSuccessHandler = () => {
    dispatch(setIsInteractive(true))
    const prevNum = myId - opLine.length - 1
    setCardPosition({x:DESIGN_WIDTH - 110 - cardWidth * prevNum, y:OP_LINE_Y + 70})
    
    setCardStatus(CARD_STATUS.none)
    dispatch(setOpDrawingCardColor(null))
  }

  // Positioning by index
  const positionByIndex = index => {
    setCardPosition({
      x: OP_LINE_X + cardWidth/2 + index * cardWidth + 3, 
      y: OP_LINE_Y
    })
  }

  // event handlers
  const cardClickHandler = () => {
    // For card selection
    // Only available for standing card
    if(cardStatus !== CARD_STATUS.stand) return

    if( ((statusObj.status === GAME_STATUS.USER_1_GUESS_MUST || statusObj.status === GAME_STATUS.USER_1_GUESS ) && user === 1 ) || 
    ((statusObj.status === GAME_STATUS.USER_2_GUESS_MUST || statusObj.status === GAME_STATUS.USER_1_GUESS) && user === 2 )){
      
      if(selected){
        dispatch(setSelectIndex(null))
      }else{
        dispatch(setSelectIndex(myIndex))
      }
      setSelected(!selected)
    }
  }

  // Watch if the select index is changed
  useEffect(() => {
    // For card selection
    // Only available for standing card
    if(cardStatus !== CARD_STATUS.stand) return

    if( ((statusObj.status === GAME_STATUS.USER_1_GUESS_MUST || statusObj.status === GAME_STATUS.USER_1_GUESS ) && user === 1 ) || 
    ((statusObj.status === GAME_STATUS.USER_2_GUESS_MUST || statusObj.status === GAME_STATUS.USER_1_GUESS) && user === 2 )){

      if(selectIndex !== myIndex && selected){
      
        setSelected(!selected)
      }
    }
    
  }, [selectIndex])

  useEffect(() => {
    if(myNumber !== null || myColor === null) return

    if(selected){
      setCardTexture(cardTextures.select[myColor])
      setCardWidth(CARD_WIDTH*SCALE_CARD_SIZE_SELECT)
      setCardHeight(CARD_HEIGHT*SCALE_CARD_SIZE_SELECT)
      return
    }else{
      setCardTexture(cardTextures.stand[myColor])
      setCardWidth(CARD_WIDTH*SCALE_CARD_SIZE)
      setCardHeight(CARD_HEIGHT*SCALE_CARD_SIZE)
    }

    if(numSprite) {
      numSprite.visible = false
    }

  }, [selected, myColor])

  // Add the number sprite
  const addNumber = (number, color=null) => {
    color = color === null ? myColor :  color
    if(!numSheetTextures || color === null) return

    if(numSprite){
      numSprite.texture = numSheetTextures[NUM_SHEET_MAP[`${color}${number}_s`]]
      numSprite.visible = true
      return
    }

    const sprite =  PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP[`${color}${number}_s`]])
    sprite.width = cardWidth / 2
    sprite.height = cardHeight / 2
    sprite.anchor.set(0.5)
    setNumSprite(sprite)
    me.current.addChild(sprite)
  }

  return (
    <>
      <Sprite
        ref={me}
        texture={cardTexture}
        width={cardWidth}
        height={cardHeight}
        anchor={0.5}
        position={cardPosition}
        visible={displayMe}

        pointertap={cardStatus === CARD_STATUS.stand ? cardClickHandler : null}
        interactive={
          isInteractive && 
          (cardStatus === CARD_STATUS.stand && !disableSelect)
        }
      />
      
    </>
  )
}