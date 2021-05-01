import {DESIGN_WIDTH,DESIGN_HEIGHT} from 'configs/variables'

const canvasRatio = DESIGN_HEIGHT / DESIGN_WIDTH

export const WIN_W_ALTER = 'WIN_W_ALTER'
export const WIN_H_ALTER = 'WIN_H_ALTER'

export const initialState = {
  w: DESIGN_WIDTH,
  h: DESIGN_HEIGHT,
  ratio: 1,
  canvasHeight: DESIGN_HEIGHT
}

export const setWinW = size => ({
  type: WIN_W_ALTER,
  payload:{
    size
  }
})
export const setWinH = size => ({
  type: WIN_H_ALTER,
  payload:{
    size
  }
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case WIN_W_ALTER:
    return {
      ...state,
      w: action.payload.size,
      ratio: (action.payload.size / DESIGN_WIDTH).toFixed(2),
      canvasHeight: action.payload.size * canvasRatio
    }
  case WIN_H_ALTER:
    return {
      ...state,
      h: action.payload.size
    }
  default:
    return state
  }
}

