export const USER_ALTER = 'USER_ALTER'
export const USERNAME_ALTER = 'USERNAME_ALTER'
export const ROOM_ALTER = 'ROOM_ALTER'
export const STATUS_ALTER = 'STATUS_ALTER'
export const SOCKET_ALTER = 'SOCKET_ALTER'
export const RESET = 'RESET'

export const initialState = {
  user: null,
  username: '',
  room_num: 0,
  room_code: '',
  /**
   * 1 for user1 draw, 
   * 2 for user2 draw, 
   * 
   * null for not satrt yet
   */
  status: null,
  socketClient: null
}
export const setUser = user => ({
  type: USER_ALTER,
  payload:{
    user
  }
})
export const setUsername = username => ({
  type: USERNAME_ALTER,
  payload:{
    username
  }
})
export const setRoom = ({room_num, room_code}) => ({
  type: ROOM_ALTER,
  payload:{
    room_num,
    room_code
  }
})
export const setGlobalStatus = status => ({
  type: STATUS_ALTER,
  payload:{
    status
  }
})
export const setSocketClient = sc => ({
  type: SOCKET_ALTER,
  payload:{
    sc
  }
})
export const resetUser = () => ({
  type: RESET
})

export const reducer = (state = initialState, action) => {
  switch (action.type) {
  case USER_ALTER:
    return {
      ...state,
      user: action.payload.user
    }
  case USERNAME_ALTER:
    return {
      ...state,
      username: action.payload.username
    }
  case ROOM_ALTER:
    return {
      ...state,
      room_num: action.payload.room_num,
      room_code: action.payload.room_code
    }
  case STATUS_ALTER:
    return {
      ...state,
      status: action.payload.status
    }
  case SOCKET_ALTER:
    return {
      ...state,
      socketClient: action.payload.sc
    }
  case RESET:
    return {
      ...initialState
    }
  default:
    return state
  }
}

