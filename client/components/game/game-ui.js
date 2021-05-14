import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay, toaster, Dialog, Button, LogOutIcon, Icon, TickIcon } from 'evergreen-ui'
import { setShowConfirmBtn } from 'redux/ui/actions'

import api from 'utils/api'
import styles from 'styles/game.module.scss'
import { API_STATUS } from 'configs/variables'
import { GAME_STATUS } from 'configs/game'
import { GAME_INFO } from 'configs/text/game-info'

const userFontArr = {
  s: '8px',
  m: '11px',
  l: '15px',
}

export default function GameUI() {
  // Stores
  const username = useSelector(state => state.user.username)
  const user = useSelector(state => state.user.user)
  const room_code = useSelector(state => state.user.room_code)
  const status = useSelector(state => state.user.status)
  const socketClient = useSelector(state => state.user.socketClient)
  const score = useSelector(state => state.user.score)
  const showConfirmBtn = useSelector(state => state.ui.showConfirmBtn)
  const myLine = useSelector(state => state.card.myLine)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
  const opUsername = useSelector(state => state.opponent.opUsername)
  const selectNum = useSelector(state => state.opponent.selectNum)
  const dispatch = useDispatch()
  
  // States
  const [loading, setLoading] = useState(false)
  const [gameInfo, setGameInfo] = useState('')
  const [fullScreenInfo, setFullScreenInfo] = useState('')
  const [fullScreenInfoTitle, setFullScreenInfoTitle] = useState('')
  const [fullScreenRoomInfo, setFullScreenRoomInfo] = useState('')

  const router = useRouter()

  useEffect(() => {
    switch(status){
    case undefined:
    case null:
      if(room_code !== ''){
        setFullScreenInfoTitle(GAME_INFO.waitingTitle)
        setFullScreenInfo(GAME_INFO.waitingText)
        setFullScreenRoomInfo(`${GAME_INFO.roomCodeText}${room_code}`)
        break
      }
      setFullScreenInfoTitle(GAME_INFO.initTitle)
      setFullScreenInfo(GAME_INFO.initText)
      break
    case GAME_STATUS.USER_LEFT:
      setFullScreenInfoTitle(GAME_INFO.opLeftTitle)
      setFullScreenInfo(GAME_INFO.opLeftText)
      setFullScreenRoomInfo('')
      break
    case GAME_STATUS.USER_EXIT:
      setFullScreenInfoTitle(GAME_INFO.opExitTitle)
      setFullScreenInfo(GAME_INFO.opExitText)
      setFullScreenRoomInfo('')
      break
    case GAME_STATUS.USER_1_DRAW_INIT:
    case GAME_STATUS.USER_1_DRAW:
      if(user == 1) setGameInfo(GAME_INFO.drawCardNotification)
      else setGameInfo(GAME_INFO.waitDrawNotification)
      break
    case GAME_STATUS.USER_2_DRAW_INIT:
    case GAME_STATUS.USER_2_DRAW:
      if(user == 2) setGameInfo(GAME_INFO.drawCardNotification)
      else setGameInfo(GAME_INFO.waitDrawNotification)
      break
    case GAME_STATUS.PUT_IN_LINE_INIT:
      if(myDraggingLine !== null && myDraggingLine.length !== 0) setGameInfo(GAME_INFO.putCardNotification)
      else if(myDraggingLine !== null && myDraggingLine.length === 0) setGameInfo(GAME_INFO.waitPutNotification)
      break
    case GAME_STATUS.USER_1_GUESS_MUST:
      if(user == 1) setGameInfo(GAME_INFO.guessCardNotification)
      else setGameInfo(GAME_INFO.waitGuessNotification)
      break
    case GAME_STATUS.USER_2_GUESS_MUST:
      if(user == 2) setGameInfo(GAME_INFO.guessCardNotification)
      else setGameInfo(GAME_INFO.waitGuessNotification)
      break
    default:
      break
    }
  }, [status])

  // APIs
  const sendExit = async () => {
    setLoading(true)
    const res = await api('post', '/exit')
    switch (res.code) {
    case API_STATUS.API_CODE_SUCCESS:
      // Send exit signal
      socketClient.exit()
      router.push('/')
      return
    case API_STATUS.API_CODE_FAIL:
      toaster.danger(
        'Exit failed. Please try it later...'
      )
      break
    default:
      break
    }
    setLoading(false)
  }
  
  // Handlers
  const confirmHandler = () => {
    if(myLine.length === 0) return
    socketClient.updateLine(myLine)
    socketClient.updateLineRes(res => {
      if(res === API_STATUS.API_CODE_SUCCESS){
        dispatch(setShowConfirmBtn(false))
        setGameInfo('Your opponent didn\'t finish yet, please wait.')
      }
    })
  }
  const numConfirmHandler = () => {
    console.log('click')
  }

  return (
    <Pane className={[styles['game-ui'], 'events-none']} >
      {/* Menu board */}
      <Pane 
        className={[styles['game-menu']]}
        data-show={
          status !== undefined 
          && status !== null 
          && status !== GAME_STATUS.USER_LEFT
          && status !== GAME_STATUS.USER_EXIT
        }
        paddingTop={30}
        paddingLeft={20}
        paddingRight={20}
        width={150}
        height={135}
      >
        {/* First Line */}
        <Pane display="flex" alignItems="center" justifyContent="space-between">
          {/* Exit btn */}
          <Button 
            className={`events-all ${styles['game-btn-exit']}`}
            onClick={sendExit}
            padding={5}
            display="flex" alignItems="center" justifyContent="center"
          >
            <span
              className={styles['game-btn-exit-text']}>
              exit 
            </span>
            <Icon icon={LogOutIcon} marginLeft={4} size={12} />
          </Button>
          {/* room number text */}
          <span
            className={`${styles['game-menu-text']}`}>
            Room: <br />
            {room_code}
          </span>
        </Pane>

        {/* Second Line */}
        <Pane display="flex" alignItems="center" justifyContent="center" height={30}>
          {/* User info */}
          <span
            className={`${styles['game-menu-text']}`}
            style={{fontSize: username.length + opUsername.length <= 10 ? 
              userFontArr.l : 
              username.length + opUsername.length <= 15 ? 
                userFontArr.m :
                userFontArr.s}}>
            {username} VS {opUsername}
          </span>
        </Pane>

        {/* Third Line */}
        <Pane display="flex" alignItems="center" justifyContent="center" height={30}>
          {/* score info */}
          <span
            className={`${styles['game-menu-text']}`}
          >
            {score === null ? '' : `${score[user]} : ${score[user===1?2:1]}`}
          </span>
        </Pane>
      </Pane>

      {/* Game Info */}
      <div className={styles['game-info-bar']}>
        <span>{gameInfo}</span>
      </div>

      {/* confirm line update btn */}
      <Button
        className={`events-all ${styles['game-btn-confirm']}`}
        appearance="primary"
        onClick={confirmHandler}
        padding={5}
        display="flex" alignItems="center" justifyContent="center"
        data-show={showConfirmBtn}
        iconAfter={TickIcon}
      >
        Confirm
      </Button>

      {/* confirm number selection btn */}
      <Button
        className={`events-all ${styles['game-btn-num-confirm']}`}
        appearance="primary"
        onClick={numConfirmHandler}
        padding={5}
        display="flex" alignItems="center" justifyContent="center"
        data-show={selectNum !== null}
      >
        Confirm
      </Button>

      {/* Loading overlay */}
      <Overlay 
        isShown={loading} 
        preventBodyScrolling={true}
        shouldCloseOnClick={false}
        shouldCloseOnEscapePress={false}
      >
        <div>
          <Pane display="flex" alignItems="center" justifyContent="center" height={600}>
            <Spinner />
          </Pane>
        </div>
      </Overlay>

      {/* Full Screen Info */}
      <Dialog
        isShown={!loading && (
          status === undefined
          || status === null
          || status === GAME_STATUS.USER_LEFT
          || status === GAME_STATUS.USER_EXIT
        )}
        title={fullScreenInfoTitle}
        hasFooter={false}
        hasClose={false}
        shouldCloseOnOverlayClick={false}
        shouldCloseOnEscapePress={false}
      >

        <Button appearance="primary"
          className={styles['game-exit-fullscreen']}
          onClick={sendExit}
          padding={5}
          display="flex" alignItems="center" justifyContent="center"
          marginTop={10}
          marginRight={10}
        >
            exit <Icon icon={LogOutIcon} marginLeft={4} size={10} />
        </Button>
        {fullScreenInfo}<br />
        {fullScreenRoomInfo}
      </Dialog>
      
    </Pane>
  )
}