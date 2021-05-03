import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import { Pane, Spinner } from 'evergreen-ui'
import { setWinW, setWinH } from 'redux/win/actions'
import { setDrawingNum } from 'redux/card/actions'
import { useSelector, useDispatch } from 'react-redux'

import {API_CODE_SUCCESS, API_CODE_FAIL, API_CODE_NO_DATA, API_CODE_ROOM_DESTROYED} from 'configs/variables'
import api from 'utils/api'
import SocketClient from 'utils/io'
import GameLayout from 'layouts/game-layout'

import GameUI from 'components/game/game-ui'
const GameCanvas = dynamic(() => import('components/game/game-canvas'), {
  ssr: false
})

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL|| 'localhost:5000'

export default function Game() {
  // Stores
  const w = useSelector(state => state.win.w)
  const h = useSelector(state => state.win.h)
  const isDrawing = useSelector(state => state.card.isDrawing)
  const dispatch = useDispatch()

  const router = useRouter()

  const [gameData, setGameData] = useState(undefined)
  const [initState, setInitState] = useState(false)
  const [socketClient, setSocketClient] = useState()


  useEffect(()=>{
    dispatch(setWinW(window.innerWidth))
    dispatch(setWinH(window.innerHeight))
    window.addEventListener('resize', ()=>{
      dispatch(setWinW(window.innerWidth))
      dispatch(setWinH(window.innerHeight))
    })
  },[])

  useEffect(async () => {
    const data = await sendInit()
    if(!data) return
    // Connect the web socket
    const socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io',
      withCredentials: true
    })

    const sc = new SocketClient(socket)

    const username = data.user_num === 1 ? data.user_1.username : data.user_2.username
    sc.join(username, data.room_num)
    sc.message()

    setSocketClient(sc)
  },[ENDPOINT])

  useEffect(() => {
    if(isDrawing) {
      const num = socketClient.drawCard()
      dispatch(setDrawingNum(num))
    }
  },[isDrawing])

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
          <Pane display="flex" alignItems="center" justifyContent="center" height={h} background="#2a2d38">
            <GameUI initState/>
            <GameCanvas w={w} h={h}/>
          </Pane>
          : 
          <Pane display="flex" alignItems="center" justifyContent="center" height={600}>
            <Spinner />
          </Pane>
      }
    </GameLayout>
  )
}