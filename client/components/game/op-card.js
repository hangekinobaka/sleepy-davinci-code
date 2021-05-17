import { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Sprite } from '@inlet/react-pixi'
import { gsap } from 'gsap'
import { setOpDrawingCardColor, setOpDarggingLine, setSelectIndex } from 'redux/opponent/actions'
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
  const [myRevealed, setMyRevealed] = useState(false)

  const me = useRef()

  useEffect(() => {
    // init process
    if( cardInit || opLine === null || opDraggingLine === null || 
      statusObj.status === null || !me.current ) return
    // Check if this id already exist in opLine
    // If yes means this card is an init stand card, directly go to the opponent line
    for(let i = 0; i < opLine.length; i++ ){
      if(myId === opLine[i].id){
        const { color, revealed, num } = opLine[i]
        positionByIndex(i)
        setMyIndex(i)
        setCardTexture(cardTextures.stand[color])
        setMyColor(color)

        // Check if I am the guessing card
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
        setMyRevealed(revealed)
        if(revealed){
          setMyNumber(num)
          setCardStatus(CARD_STATUS.standShow)
        }else{
          setCardStatus(CARD_STATUS.stand)
        }
        setDisplayMe(true)
        return setCardInit(true)  
      }
    }    

    // Check if opDraggingLine is not 0 and this card id is over opLine's
    // If yes means that this card go direct to the wait line
    if(opDraggingLine.length > 0 && myId > opLine.length){
      for(let i = 0; i < opDraggingLine.length; i++ ){
        if(myId - opLine.length === i + 1){
          const { color, revealed, num } = opDraggingLine[i]
          setCardTexture(cardTextures.stand[color])
          setMyColor(color)
          setDisplayMe(true)
          drawSuccessHandler()
          setMyRevealed(revealed)
          if(revealed){setMyNumber(num)}

          // [IMPORTANT!] Change the status in the end 
          setCardStatus(CARD_STATUS.disabled)
          return setCardInit(true)      
        }
      }  
    }  

    setCardStatus(CARD_STATUS.draw)  
    return setCardInit(true)  

  }, [opLine, opDraggingLine, statusObj, me])

  // If select staus has changed, display different things
  useEffect(() => {
    if(myColor === null) return
    if(selected && cardStatus === CARD_STATUS.stand){
      setCardTexture(cardTextures.select[myColor])
      setCardWidth(CARD_WIDTH*SCALE_CARD_SIZE_SELECT)
      setCardHeight(CARD_HEIGHT*SCALE_CARD_SIZE_SELECT)
      return
    }else{
      setCardTexture(cardTextures.stand[myColor])
      setCardWidth(CARD_WIDTH*SCALE_CARD_SIZE)
      setCardHeight(CARD_HEIGHT*SCALE_CARD_SIZE)

      if(numSprite && !myRevealed) {
        numSprite.visible = false
      }
    }
  }, [selected])

  // Handle revealed show separately
  useEffect(() => {
    if(!myNumber) return
    if(myRevealed){
      addNumber(myNumber) 
    }
  }, [myRevealed, myNumber])

  useEffect(() => {
    statusHandler()
  },[cardStatus, opLine, opDrawingCardColor, statusObj])

  const statusHandler = () => {
    if( cardStatus === null ) return
    let pos = { x: 0, y: 0 }

    switch (cardStatus){
    case CARD_STATUS.dragable:
      // If the opponent has made a wrong guess, show the wating card
      if((statusObj.status === GAME_STATUS.USER_1_PUT_IN_LINE && user === 2) ||
      (statusObj.status === GAME_STATUS.USER_2_PUT_IN_LINE && user === 1)){
        if(!statusObj.statusData.isCorrect){
          setMyNumber(statusObj.statusData.opDraggingNum)
        }
      }

      // When the opLine is updated, insert all un-arranged cards
      if( opLine === null ) return
      for(let i = 0; i < opLine.length; i++ ){
        if( myId === opLine[i].id){
          positionByIndex(i)
          setMyIndex(i)
          if(myRevealed){
            setCardStatus(CARD_STATUS.standShow)  
          }else{
            setCardStatus(CARD_STATUS.stand)  
          }
        }
      }    
      break
    case CARD_STATUS.draw:
      if(opDrawingCardColor === null) return
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
      drawAnimation()
      
      // [IMPORTANT!] Change the status in the end 
      setCardStatus(CARD_STATUS.disabled)
      break
    case CARD_STATUS.standShow:
      // When the opLine is updated, rearrage this card
      if(statusObj.status === GAME_STATUS.USER_1_DRAW ||
        statusObj.status === GAME_STATUS.USER_2_DRAW ){
        insertIntoLine()
      }
      break
    case CARD_STATUS.stand:
      // When the opLine is updated, rearrage this card
      if(statusObj.status === GAME_STATUS.USER_1_DRAW ||
        statusObj.status === GAME_STATUS.USER_2_DRAW ){
        insertIntoLine()
      }

      // If it is not under the guessing status, remove all the selections
      if(
        statusObj.status !== GAME_STATUS.USER_1_GUESS && statusObj.status !== GAME_STATUS.USER_2_GUESS 
      ){
        setSelected(false)
      }

      // If it is under the ANSWER status
      if((statusObj.status === GAME_STATUS.USER_1_ANSWER && user === 2) || 
        statusObj.status === GAME_STATUS.USER_2_ANSWER && user === 1){
        // Check if I am the guessing card
        // If yes select the card and show the guessing number
        if(statusObj.statusData.index === myIndex){
          setSelected(true)
          addNumber(statusObj.statusData.number)
        }
      }else{
        // cancel the highlight
        setSelected(false)
      }

      // If it is under the second or more GUESS status
      // OR one of the user is won
      if(((statusObj.status === GAME_STATUS.USER_1_CHOOSE || statusObj.status === GAME_STATUS.USER_1_WIN) && user === 1) || 
        (statusObj.status === GAME_STATUS.USER_2_CHOOSE || statusObj.status === GAME_STATUS.USER_2_WIN) && user === 2){
        // Check if I am the guessing card
        // If yes, double check if the guess is correct( normally yes ),
        // if yes, show me 
        if(statusObj.statusData.index === myIndex && statusObj.statusData.isCorrect){
          setMyRevealed(true)
          setCardStatus(CARD_STATUS.standShow)
        }
      }
      break
    case CARD_STATUS.disabled:
      if(statusObj.status === GAME_STATUS.PUT_IN_LINE_INIT || 
        statusObj.status === GAME_STATUS.USER_1_PUT_IN_LINE || 
        statusObj.status === GAME_STATUS.USER_2_PUT_IN_LINE){
        setCardStatus(CARD_STATUS.dragable)
      }
      break
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

  useEffect(() => {
    if(myNumber === null) return
    addNumber(myNumber)
  }, [myNumber])

  const drawAnimation = () => {
    // Add the card to the waiting line
    const newLine = [...opDraggingLine]
    newLine.push({ color: opDrawingCardColor, id: myId })
    dispatch(setOpDarggingLine(newLine))
    dispatch(setOpDrawingCardColor(null))
    
    // Display card 
    setDisplayMe(true)

    // Config animation
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

    if((statusObj.status === GAME_STATUS.USER_1_GUESS && user === 1 ) || 
    (statusObj.status === GAME_STATUS.USER_2_GUESS && user === 2 )){
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

    if((statusObj.status === GAME_STATUS.USER_1_GUESS && user === 1 ) || 
    (statusObj.status === GAME_STATUS.USER_2_GUESS && user === 2 )){

      if(selectIndex !== myIndex && selected){
        setSelected(!selected)
      }
    }
    
  }, [selectIndex])

  // Add the number sprite
  const addNumber = (number, color=null) => {
    color = color === null ? myColor :  color
    if(!numSheetTextures || color === null) return

    if(numSprite){
      numSprite.texture = numSheetTextures[NUM_SHEET_MAP[`${color}${number}_s`]]
      numSprite.visible = true
      return
    }

    const sprite = PIXI.Sprite.from(numSheetTextures[NUM_SHEET_MAP[`${color}${number}_s`]])
    sprite.width = cardWidth / 2
    sprite.height = cardHeight / 2
    sprite.anchor.set(0.5)
    setNumSprite(sprite)
    me.current.addChild(sprite)
  }

  // (Re)insert cards into the op line
  const insertIntoLine = () => {
    if( opLine === null ) return
    for(let i = 0; i < opLine.length; i++ ){
      if( myId === opLine[i].id){
        positionByIndex(i)
        setMyIndex(i)
        return
      }
    }    
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