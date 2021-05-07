import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import { Pane, Spinner } from 'evergreen-ui'
import { setWinW, setWinH } from 'redux/win/actions'
import { setDrawingNum, setCardNumW, setCardNumB, setIsInteractive, setCanDrawCard, setMyLine, resetAll } from 'redux/card/actions'
import { setUser, setUsername , setRoom, setGlobalStatus, resetUser, setSocketClient} from 'redux/user/actions'
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
  const drawingCard = useSelector(state => state.card.drawingCard)
  const myLine = useSelector(state => state.card.myLine)
  const globalStatus = useSelector(state => state.user.status)
  const user = useSelector(state => state.user.user)
  const socketClient = useSelector(state => state.user.socketClient)
  const dispatch = useDispatch()

  const router = useRouter()
  // States 
  const [initState, setInitState] = useState(false)

  // Set game status based on the game turn
  useEffect(() => {
    console.log(`status change ${globalStatus}`)
    if(globalStatus === null) return
    if(globalStatus === user) dispatch(setCanDrawCard(true))
  }, [globalStatus])

  useEffect(()=>{
    dispatch(setWinW(window.innerWidth))
    dispatch(setWinH(window.innerHeight))
    window.addEventListener('resize', ()=>{
      dispatch(setWinW(window.innerWidth))
      dispatch(setWinH(window.innerHeight))
    })
    return () => {
      // Clean up
      dispatch(resetAll())
      dispatch(resetUser())
    }
  },[])

  useEffect(async () => {
    const data = await sendInit()
    if(!data) return
    const {room_code, room_num, user_num } = data
    const username = data.user_num === 1 ? data.user_1.username : data.user_2.username
    dispatch(setUsername(username))
    dispatch(setRoom({room_num, room_code}))
    dispatch(setUser(user_num))

    // Connect the web socket
    const socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io',
      withCredentials: true
    })
    const sc = new SocketClient(socket)

    // Join the socket room
    sc.join()

    // Receive the game init data
    sc.init(initData => {
      console.log('run init')
      console.log(initData)
      dispatch(setCardNumW(initData.wNum))
      dispatch(setCardNumB(initData.bNum))
      dispatch(setMyLine(initData.line))
      dispatch(setIsInteractive(true))
      dispatch(setGlobalStatus(initData.status))
    })

    // Receive draw card number
    sc.receiveCard(number => {
      dispatch(setDrawingNum(number))
    })

    // Receive the gaem status change
    sc.status(status => {
      dispatch(setGlobalStatus(status))
    })

    dispatch(setSocketClient(sc))
  },[ENDPOINT])

  useEffect(() => {
    if(isDrawing) {
      // Sewnd draw card signal
      socketClient.draw(drawingCard)
      dispatch(setDrawingNum(null))
    }
  },[isDrawing])

  useEffect(() => {
    if(myLine.length === 0) return

    socketClient.updateLine(myLine)
  },[myLine])

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