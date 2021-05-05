import { WHITE_CARD_NUM, BLACK_CARD_NUM } from 'configs/game'

export const CARD_NUM_W_ALTER = 'CARD_NUM_W_ALTER'
export const CARD_NUM_B_ALTER = 'CARD_NUM_B_ALTER'
export const CLOSE_DRAWING = 'CLOSE_DRAWING'
export const RESET_ALL = 'RESET_ALL'
export const IS_INTERAVTIVE_ALTER = 'IS_INTERAVTIVE_ALTER'
export const NUM_TEXTURES_ALTER = 'NUM_TEXTURES_ALTER'
export const DRAWING_NUM_ALTER = 'DRAWING_NUM_ALTER'
export const MY_LINE_ALTER = 'MY_LINE_ALTER'
export const IS_DRAGGING_ALTER = 'IS_DRAGGING_ALTER'
export const DRAGGING_CARD_ALTER = 'DRAGGING_CARD_ALTER'
export const DRAG_RESULT_ALTER = 'DRAG_RESULT_ALTER'
export const CARD_ID_COUNTER_ALTER = 'CARD_ID_COUNTER_ALTER'
export const INSERT_PLACE_ALTER = 'INSERT_PLACE_ALTER'

export const initialState = {
  cardNumW: WHITE_CARD_NUM,
  cardNumB: BLACK_CARD_NUM,
  drawingCard: 'w',
  isDrawing: false,
  isInteractive: true,
  numSheetTextures: null,
  drawingNum: null,
  /**
   * myLine example:  
   * [
   *   {num: 1, color: 'b', id: 1},
   *   {num: 5, color: 'b', id: 3},
   *   {num: 6, color: 'w', id: 4},
   *   {num: 6, color: 'b', id: 2}
   * ]
   */
  myLine:[],
  isDragging: null,
  draggingCard: null,
  /**
   * dragResult example:  
   * {
   *    success: true,
   *    index: 1
   * }
   */
  dragResult: null,
  cardIdCounter:1,
  insertPlace: null
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
export const setMyLine = newLine => ({
  type: MY_LINE_ALTER,
  payload:{
    newLine
  }
})
export const setIsDragging = isDragging => ({
  type: IS_DRAGGING_ALTER,
  payload:{
    isDragging
  }
})
export const setDraggingCard = card => ({
  type: DRAGGING_CARD_ALTER,
  payload:{
    card
  }
})
export const setDragRes = res => ({
  type: DRAG_RESULT_ALTER,
  payload:{
    res
  }
})
export const setCardIdCounter = id => ({
  type: CARD_ID_COUNTER_ALTER,
  payload:{
    id
  }
})
export const setInsertPlace = index => ({
  type: INSERT_PLACE_ALTER,
  payload:{
    index
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
  case MY_LINE_ALTER:
    return {
      ...state,
      myLine: [...action.payload.newLine]
    }
  case IS_DRAGGING_ALTER:
    return {
      ...state,
      isDragging: action.payload.isDragging
    }
  case DRAGGING_CARD_ALTER:
    return {
      ...state,
      draggingCard: action.payload.card
    }
  case DRAG_RESULT_ALTER:
    return {
      ...state,
      dragResult: {...action.payload.res}
    }
  case CARD_ID_COUNTER_ALTER:
    return{
      ...state,
      cardIdCounter: action.payload.id
    }
  case INSERT_PLACE_ALTER:
    return{
      ...state,
      insertPlace: action.payload.index
    }

  default:
    return state
  }
}

