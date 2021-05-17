export const SHOW_CONFIRMA_BTN_ALTER = 'SHOW_CONFIRMA_BTN_ALTER'
export const RESET = 'RESET'

export const initialState = {
  showConfirmBtn: {
    show: false,
    type: null
  },
  
}
export const setShowConfirmBtn = (show, type=null) => ({
  type: SHOW_CONFIRMA_BTN_ALTER,
  payload:{
    show,
    type
  }
})
export const resetUi = () => ({
  type: RESET
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case SHOW_CONFIRMA_BTN_ALTER:
    return {
      ...state,
      showConfirmBtn: {
        show: action.payload.show,
        type: action.payload.type
      }
    }
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

