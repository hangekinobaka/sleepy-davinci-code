import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { io } from 'socket.io-client'
import { Pane, Spinner } from 'evergreen-ui'
import { setWinW, setWinH } from 'redux/win/actions'
import { setDrawingNum, setCardNumW, setCardNumB, setIsInteractive, 
  setCanDrawCard, setMyLine, resetAll, setMyDarggingLine, setDisableDrag } from 'redux/card/actions'
import { setUser, setUsername , setRoom, setGlobalStatus, resetUser, setSocketClient} from 'redux/user/actions'
import { setShowConfirmBtn, resetUi } from 'redux/ui/actions'
import { resetOp, setOpDrawingCardColor, setOpLine, setOpDarggingLine } from 'redux/opponent/actions'
import { useSelector, useDispatch } from 'react-redux'

import { API_STATUS } from 'configs/variables'
import { GAME_STATUS } from 'configs/game'
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
  const drawingCardColor = useSelector(state => state.card.drawingCardColor)
  const myLine = useSelector(state => state.card.myLine)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
  const confirmUpdateLine = useSelector(state => state.card.confirmUpdateLine)
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
    console.log(`user ${user}`)
    switch(globalStatus){
    case null:
      break
    case GAME_STATUS.USER_1_DRAW:
    case GAME_STATUS.USER_1_DRAW_INIT:
      dispatch(setDisableDrag(true))
      if(user == 1) dispatch(setCanDrawCard(true))
      break
    case GAME_STATUS.USER_2_DRAW:
    case GAME_STATUS.USER_2_DRAW_INIT:
      dispatch(setDisableDrag(true))
      if(user == 2) dispatch(setCanDrawCard(true))
      break
    case GAME_STATUS.PUT_IN_LINE_INIT:
      dispatch(setDisableDrag(false))
      break
    default:
      break
    }
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
      dispatch(resetUi())
      dispatch(resetOp())
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
    /**
     * Start Socket.io handling
     */
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
      dispatch(setMyLine(initData.line))
      dispatch(setMyDarggingLine(initData.drawingLine))
      dispatch(setIsInteractive(true))

      // Opponent data
      dispatch(setOpLine(initData.opLine))
      dispatch(setOpDarggingLine(initData.opDrawingLine))

      dispatch(setCardNumW(initData.wNum))
      dispatch(setCardNumB(initData.bNum))
      dispatch(setGlobalStatus(initData.status))
    })

    // Receive draw card number
    sc.receiveCard(({num}) => {
      dispatch(setDrawingNum(num))
    })

    // Add card number change listener
    sc.cardNumChange(({ wNum, bNum }) => {
      dispatch(setCardNumW(wNum))
      dispatch(setCardNumB(bNum))
    })

    // Receive the gaem status change
    sc.status(status => {
      dispatch(setGlobalStatus(status))
    })

    // Receive opponent card
    sc.opReceiveCard(({color}) => {
      dispatch(setOpDrawingCardColor(color))
    })

    dispatch(setSocketClient(sc))
  },[ENDPOINT])

  useEffect(() => {
    if(isDrawing) {
      // Sewnd draw card signal
      socketClient.draw(drawingCardColor)
      dispatch(setDrawingNum(null))
    }
  },[isDrawing])

  useEffect(() => {
    if(myLine === null || !confirmUpdateLine) return

    socketClient.updateLine(myLine)
  },[confirmUpdateLine])

  useEffect(() => {
    if(myDraggingLine === null) return
    if(myDraggingLine.length !== 0) return
    switch (globalStatus){
    case GAME_STATUS.PUT_IN_LINE_INIT:
      dispatch(setShowConfirmBtn(true))
      break
    default:
      break
    }
  }, [myDraggingLine])

  // methods
  const sendInit = async () => {
    const res = await api('post', '/init')
    switch (res.code) {
    case API_STATUS.API_CODE_ROOM_DESTROYED:
    case API_STATUS.API_CODE_FAIL:
    case API_STATUS.API_CODE_NO_DATA:
      router.push('/')
      return Promise.resolve()
    case API_STATUS.API_CODE_SUCCESS:
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