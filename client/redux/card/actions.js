import { WHITE_CARD_NUM, BLACK_CARD_NUM } from 'configs/game'

export const CARD_NUM_W_ALTER = 'CARD_NUM_W_ALTER'
export const CARD_NUM_B_ALTER = 'CARD_NUM_B_ALTER'
export const CLOSE_DRAWING = 'CLOSE_DRAWING'
export const RESET_ALL = 'RESET_ALL'
export const IS_INTERAVTIVE_ALTER = 'IS_INTERAVTIVE_ALTER'
export const NUM_TEXTURES_ALTER = 'NUM_TEXTURES_ALTER'
export const DRAWING_NUM_ALTER = 'DRAWING_NUM_ALTER'

export const initialState = {
  cardNumW: WHITE_CARD_NUM,
  cardNumB: BLACK_CARD_NUM,
  drawingCard: 'w',
  isDrawing: false,
  isInteractive: true,
  numSheetTextures: null,
  drawingNum: null
}

export const setCardNumW = num => ({
  type: CARD_NUM_W_ALTER,
  payload:{
    num
  }
})
export const setCardNumB = num => ({
  type: CARD_NUM_B_ALTER,
  payload:{
    num
  }
})
export const closeDrawing = () => ({
  type: CLOSE_DRAWING
})
export const resetAll = () => ({
  type: RESET_ALL
})
export const setIsInteractive = isTure => ({
  type: IS_INTERAVTIVE_ALTER,
  payload:{
    isTure
  }
})
export const setNumSheetTextures = textures => ({
  type: NUM_TEXTURES_ALTER,
  payload:{
    textures
  }
})
export const setDrawingNum = num => ({
  type: DRAWING_NUM_ALTER,
  payload:{
    num
  }
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case CARD_NUM_W_ALTER:
    return {
      ...state,
      cardNumW: action.payload.num,
      drawingCard: 'w',
      isDrawing: true
    }
  case CARD_NUM_B_ALTER:
    return {
      ...state,
      cardNumB: action.payload.num,
      drawingCard: 'b',
      isDrawing: true
    }
  case CLOSE_DRAWING:
    return {
      ...state,
      isDrawing: false
    }
  case RESET_ALL:
    return initialState
  case IS_INTERAVTIVE_ALTER:
    return {
      ...state,
      isInteractive: action.payload.isTure
    }
  case NUM_TEXTURES_ALTER:
    return {
      ...state,
      numSheetTextures: action.payload.textures
    }
  case DRAWING_NUM_ALTER:
    return {
      ...state,
      drawingNum: action.payload.num
    }
  default:
    return state
  }
}

