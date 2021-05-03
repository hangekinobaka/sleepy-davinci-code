import { WHITE_CARD_NUM, BLACK_CARD_NUM } from 'configs/game'

export const CARD_NUM_W_ALTER = 'CARD_NUM_W_ALTER'
export const CARD_NUM_B_ALTER = 'CARD_NUM_B_ALTER'
export const CLOSE_DRAWING = 'CLOSE_DRAWING'
export const RESET_ALL = 'RESET_ALL'

export const initialState = {
  cardNumW: WHITE_CARD_NUM,
  cardNumB: BLACK_CARD_NUM,
  drawingCard: 'w',
  isDrawing: false
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
  default:
    return state
  }
}

