export const RESET = 'RESET'
export const OP_DRAWING_CARD_COLOR_ALTER = 'OP_DRAWING_CARD_COLOR_ALTER'
export const OP_LINE_ALTER = 'OP_LINE_ALTER'
export const OP_DRAG_LINE_ALTER = 'OP_DRAG_LINE_ALTER'
export const OP_DRAG_LINE_TEMP_ALTER = 'OP_DRAG_LINE_TEMP_ALTER'
export const DISABLE_SELECT_ALTER = 'DISABLE_SELECT_ALTER'
export const SELECT_INDEX_ALTER = 'SELECT_INDEX_ALTER'
export const OP_USERNAME_ALTER = 'OP_USERNAME_ALTER'

export const initialState = {
  opDrawingCardColor: null,
  /**
   * opLine example:  
   * [
   *   { color: 'b', id: 1},
   *   { color: 'b', id: 3},
   *   { color: 'w', id: 4},
   *   { color: 'b', id: 2}
   * ]
   */
  opLine: null,
  opDraggingLine: null,
  opDraggingLineTemp: null,
  disableSelect: true,
  selectIndex: null,
  opUsername: ''
}

export const resetOp = () => ({
  type: RESET
})
export const setOpDrawingCardColor = color => ({
  type: OP_DRAWING_CARD_COLOR_ALTER,
  payload:{
    color
  }
})
export const setOpLine = newLine => ({
  type: OP_LINE_ALTER,
  payload:{
    newLine
  }
})
export const setOpDarggingLine = newLine => ({
  type: OP_DRAG_LINE_ALTER,
  payload:{
    newLine
  }
})
export const setOpDarggingLineTemp = newLine => ({
  type: OP_DRAG_LINE_TEMP_ALTER,
  payload:{
    newLine
  }
})
export const setDisableSelect = isDisabled => ({
  type: DISABLE_SELECT_ALTER,
  payload:{
    isDisabled
  }
})
export const setSelectIndex = index => ({
  type: SELECT_INDEX_ALTER,
  payload:{
    index
  }
})
export const setOpUsername = username => ({
  type: OP_USERNAME_ALTER,
  payload:{
    username
  }
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case OP_DRAWING_CARD_COLOR_ALTER:
    return {
      ...state,
      opDrawingCardColor: action.payload.color
    }
  case OP_LINE_ALTER:
    return {
      ...state,
      opLine: [...action.payload.newLine]
    }
  case OP_DRAG_LINE_ALTER:
    return {
      ...state,
      opDraggingLine: [...action.payload.newLine]
    }
  case OP_DRAG_LINE_TEMP_ALTER:
    return {
      ...state,
      opDraggingLineTemp: [...action.payload.newLine]
    }
  case DISABLE_SELECT_ALTER:
    return {
      ...state,
      disableSelect: action.payload.isDisabled
    }
  case SELECT_INDEX_ALTER:
    return {
      ...state,
      selectIndex: action.payload.index
    }
  case OP_USERNAME_ALTER:
    return {
      ...state,
      opUsername: action.payload.username
    }
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

