export const RESET = 'RESET'
export const OP_DRAWING_CARD_COLOR_ALTER = 'OP_DRAWING_CARD_COLOR_ALTER'
export const OP_LINE_ALTER = 'OP_LINE_ALTER'
export const OP_DRAG_LINE_ALTER = 'OP_DRAG_LINE_ALTER'

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
  opDraggingLine: null
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
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

