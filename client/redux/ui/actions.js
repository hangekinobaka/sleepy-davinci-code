export const SHOW_CONFIRMA_BTN_ALTER = 'SHOW_CONFIRMA_BTN_ALTER'
export const RESET = 'RESET'

export const initialState = {
  showConfirmBtn: false,
  
}
export const setShowConfirmBtn = show => ({
  type: SHOW_CONFIRMA_BTN_ALTER,
  payload:{
    show
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
      showConfirmBtn: action.payload.show
    }
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

