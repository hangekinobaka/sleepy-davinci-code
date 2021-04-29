import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import { Pane, Spinner } from 'evergreen-ui'

import {API_CODE_SUCCESS, API_CODE_FAIL, API_CODE_NO_DATA, API_CODE_ROOM_DESTROYED} from 'configs/variables'
import api from 'utils/api'
import SocketClient from 'utils/io'
import GameLayout from 'layouts/game-layout'

import GameUI from 'components/game/game-ui'
const GameCanvas = dynamic(() => import('components/game/game-canvas'), {
  ssr: false
})

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL|| 'localhost:5000'

let socketClient

export default function Game() {
  const router = useRouter()

  const [gameData, setGameData] = useState(undefined)
  const [initState, setInitState] = useState(false)

  useEffect(async () => {
    const data = await sendInit()
    if(!data) return
    // Connect the web socket
    const socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io',
      withCredentials: true
    })

    socketClient = new SocketClient(socket)

    const username = data.user_num === 1 ? data.user_1.username : data.user_2.username
    socketClient.join(username, data.room_num)
    socketClient.message()

  },[ENDPOINT])

  // methods
  const sendInit = async () => {
    const res = await api('post', '/init')
    switch (res.code) {
    case API_CODE_ROOM_DESTROYED:
    case API_CODE_FAIL:
    case API_CODE_NO_DATA:
      router.push('/')
      return Promise.resolve()
    case API_CODE_SUCCESS:
      setGameData(res.data)
      setInitState(true)
      return Promise.resolve(res.data)
    default:
      break
    }
    setInitState(true)
    return Promise.resolve()
  }

  return (
    <GameLayout>
      {
        initState ? 
          <Pane display="flex" alignItems="center" justifyContent="center" height={window.innerHeight}>
            <GameUI initState/>
            <GameCanvas />
          </Pane>
          : 
          <Pane display="flex" alignItems="center" justifyContent="center" height={600}>
            <Spinner />
          </Pane>
      }
    </GameLayout>
  )
}