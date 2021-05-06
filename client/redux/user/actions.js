export const USERNAME_ALTER = 'USERNAME_ALTER'
export const ROOM_ALTER = 'ROOM_ALTER'

export const initialState = {
  username: '',
  room_num: 0,
  room_code: '0000',
}


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

export const reducer = (state = initialState, action) => {
  switch (action.type) {
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
  default:
    return state
  }
}

