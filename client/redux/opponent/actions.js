export const RESET = 'RESET'

export const initialState = {
  
}

export const resetOp = () => ({
  type: RESET
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

