import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay, toaster, Dialog, Button, 
  LogOutIcon, Icon, TickIcon, Heading } from 'evergreen-ui'
import { setShowConfirmBtn } from 'redux/ui/actions'

import api from 'utils/api'
import styles from 'styles/game.module.scss'
import { API_STATUS } from 'configs/variables'
import { GAME_STATUS } from 'configs/game'
import { GAME_INFO } from 'configs/text/game-info'
import { CONFIRM_TYPE } from 'configs/ui'

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
  const statusObj = useSelector(state => state.user.statusObj)
  const socketClient = useSelector(state => state.user.socketClient)
  const score = useSelector(state => state.user.score)
  const showConfirmBtn = useSelector(state => state.ui.showConfirmBtn)
  const myLine = useSelector(state => state.card.myLine)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
  const opUsername = useSelector(state => state.opponent.opUsername)
  const selectIndex = useSelector(state => state.opponent.selectIndex)
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
    switch(statusObj.status){
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
      else if(myDraggingLine !== null && myDraggingLine.length === 0) setGameInfo(GAME_INFO.waitOpFinishNotification)
      break
    case GAME_STATUS.USER_1_GUESS:
      if(user == 1) setGameInfo(GAME_INFO.guessCardNotification)
      else setGameInfo(GAME_INFO.waitGuessNotification)
      break
    case GAME_STATUS.USER_2_GUESS:
      if(user == 2) setGameInfo(GAME_INFO.guessCardNotification)
      else setGameInfo(GAME_INFO.waitGuessNotification)
      break
    case GAME_STATUS.USER_1_ANSWER:
      if(user == 2) setGameInfo(GAME_INFO.waitOpConfirmNotification)
      else setGameInfo(GAME_INFO.confirmNumInfoGenerator(statusObj.statusData.number))
      break
    case GAME_STATUS.USER_2_ANSWER:
      if(user == 1) setGameInfo(GAME_INFO.waitOpConfirmNotification)
      else setGameInfo(GAME_INFO.confirmNumInfoGenerator(statusObj.statusData.number))
      break
    case GAME_STATUS.USER_1_CHOOSE:
      if(user == 1) setGameInfo(GAME_INFO.isCorrectNotification)
      else setGameInfo(GAME_INFO.makeDecisionNotification)
      break
    case GAME_STATUS.USER_2_CHOOSE:
      if(user == 2) setGameInfo(GAME_INFO.isCorrectNotification)
      else setGameInfo(GAME_INFO.makeDecisionNotification)
      break
    case GAME_STATUS.USER_1_PUT_IN_LINE:
      if(user == 1) setGameInfo(GAME_INFO.putCardInfoGenerator(statusObj.statusData.isCorrect))
      else setGameInfo(GAME_INFO.waitOpPutNotification)
      break
    case GAME_STATUS.USER_2_PUT_IN_LINE:
      if(user == 2) setGameInfo(GAME_INFO.putCardInfoGenerator(statusObj.statusData.isCorrect))
      else setGameInfo(GAME_INFO.waitOpPutNotification)
      break
    default:
      break
    }
  }, [statusObj, room_code])

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
    switch(showConfirmBtn.type){
    case CONFIRM_TYPE.LINE_UPDATE:
      if(myLine.length === 0) return

      socketClient.updateLine(myLine)
      socketClient.updateLineRes(res => {
        if(res.code === API_STATUS.API_CODE_SUCCESS){
          dispatch(setShowConfirmBtn(false))
          setGameInfo(GAME_INFO.waitPutNotification)
        }
      })
      break
    case CONFIRM_TYPE.NUM_SELECT:
      if(selectNum === null || selectIndex === null) return
      socketClient.submitSelection(selectNum, selectIndex)
      break
    default:
      break
    }
  }

  const iSeeHandler = () => {
    socketClient.iSee()
  }

  const continueHandler = () => {
    socketClient.continue(true)
  }

  const notContinueHandler = () => {
    socketClient.continue(false)
  }

  return (
    <Pane className={[styles['game-ui'], 'events-none']} >
      {/* Menu board */}
      <Pane 
        className={[styles['game-menu']]}
        data-show={
          statusObj.status !== undefined 
          && statusObj.status !== null 
          && statusObj.status !== GAME_STATUS.USER_LEFT
          && statusObj.status !== GAME_STATUS.USER_EXIT
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
      <div className={styles['game-info-bar']} dangerouslySetInnerHTML={{__html: gameInfo}} />

      {/* confirm btn - for line update and num selection */}
      {
        showConfirmBtn.show ? 
          <Button
            className={`events-all ${styles['game-btn-confirm']}`}
            appearance="primary"
            onClick={confirmHandler}
            iconAfter={TickIcon}
          >
        Confirm
          </Button>
          :
          <></>
      }
      
      {/* `I see` btn */}
      {
        ((statusObj.status === GAME_STATUS.USER_1_ANSWER && user === 1) ||
        (statusObj.status === GAME_STATUS.USER_2_ANSWER && user === 2)) ? 
          <Button
            className={`events-all ${styles['game-btn-isee']}`}
            onClick={iSeeHandler}
            appearance="primary" intent={statusObj.statusData.isCorrect ? 'danger' : 'success'}
          >
          I see {statusObj.statusData.isCorrect? '😢' : '😃'}
          </Button> 
          :
          <></>
      }

      {/* ask if continue window */}    
      {
        (statusObj.status === GAME_STATUS.USER_1_CHOOSE && user === 1) || 
        (statusObj.status === GAME_STATUS.USER_2_CHOOSE && user === 2)
          ?
          <Pane
            elevation={2}
            position="absolute"
            top={50}
            right={20}
            width={240}
            background="tint1"
            borderRadius={10}
            padding={10}
            className={`
              events-all
              ${styles['game-continue-dialog']}`}
          >
            <Heading textAlign="center">Do you want to guess another round?</Heading>
            <Pane 
              marginTop={18}
              display="flex"
              alignItems="center"
              width='100%'
              justifyContent="space-evenly"
            >
              <Button 
                appearance="primary"
                intent="success"
                width="40%"
                padding={5}
                display="flex" alignItems="center" justifyContent="center"
                onClick={continueHandler}
              >
              Yes
              </Button>

              <Button 
                padding={5}
                width="40%"
                display="flex" alignItems="center" justifyContent="center"
                onClick={notContinueHandler}
              >
              No
              </Button>
            </Pane> 
          </Pane>
          :
          <></>
      }  
      
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
          statusObj.status === undefined
          || statusObj.status === null
          || statusObj.status === GAME_STATUS.USER_LEFT
          || statusObj.status === GAME_STATUS.USER_EXIT
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