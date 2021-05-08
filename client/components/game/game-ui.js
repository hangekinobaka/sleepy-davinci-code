import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay, toaster, Dialog, Button, SideSheet, 
  Paragraph, Position, DoubleChevronRightIcon, LogOutIcon, IconButton, Icon } from 'evergreen-ui'
import Component from '@reach/component-component'
import { setShowConfirmBtn } from 'redux/ui/actions'

import api from 'utils/api'
import styles from 'styles/game.module.scss'
import { API_STATUS } from 'configs/variables'
import { GAME_STATUS } from 'configs/game'

export default function GameUI() {
  // Stores
  const username = useSelector(state => state.user.username)
  const user = useSelector(state => state.user.user)
  const room_code = useSelector(state => state.user.room_code)
  const status = useSelector(state => state.user.status)
  const socketClient = useSelector(state => state.user.socketClient)
  const showConfirmBtn = useSelector(state => state.ui.showConfirmBtn)
  const myLine = useSelector(state => state.card.myLine)
  const myDraggingLine = useSelector(state => state.card.myDraggingLine)
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
    case null:
      setFullScreenInfoTitle('Waiting')
      setFullScreenInfo('Waiting for your opponent...')
      setFullScreenRoomInfo(`Your room code is: ${room_code}`)
      break
    case GAME_STATUS.USER_LEFT:
      setFullScreenInfoTitle('Your Opponent has left')
      setFullScreenInfo('If he or she comes back in 3 mins, the game will be resumed')
      setFullScreenRoomInfo('')
      break
    case GAME_STATUS.USER_EXIT:
      setFullScreenInfoTitle('Your Opponent has exited')
      setFullScreenInfo('Please click exit and restart a game')
      setFullScreenRoomInfo('')
      break
    case GAME_STATUS.USER_1_DRAW_INIT:
    case GAME_STATUS.USER_1_DRAW:
      if(user == 1) setGameInfo('Please draw a card...')
      else setGameInfo('Opponent is drawing card.')
      break
    case GAME_STATUS.USER_2_DRAW_INIT:
    case GAME_STATUS.USER_2_DRAW:
      if(user == 2) setGameInfo('Please draw a card...')
      else setGameInfo('Opponent is drawing card.')
      break
    case GAME_STATUS.PUT_IN_LINE_INIT:
      if(myDraggingLine !== null && myDraggingLine.length !== 0) setGameInfo('Please put the cards in your line')
      else if(myDraggingLine !== null && myDraggingLine.length === 0) setGameInfo('Your opponent didn\'t finish yet, please wait.')
      break
    case GAME_STATUS.USER_1_GUESS_MUST:
      if(user == 1) setGameInfo('Please guess a card in your opponent\'s line...')
      else setGameInfo('Opponent is guessing your card. Please wait.')
      break
    case GAME_STATUS.USER_2_GUESS_MUST:
      if(user == 2) setGameInfo('Please guess a card in your opponent\'s line...')
      else setGameInfo('Opponent is guessing your card. Please wait.')
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

  return (
    <Pane className={[styles['game-ui'], 'events-none']} >
      {/* Menu board */}
      <Pane display="flex" alignItems="center"
        className={styles['game-menu']}
        data-show={
          status !== null 
          && status !== GAME_STATUS.USER_LEFT
          && status !== GAME_STATUS.USER_EXIT
        }
        elevation={1}
        paddingLeft={5}
        height={80}
        width={100}
        style={
          {
            background: '#cc6600'
          }
        }>
        {/* Exit btn */}
        <Button 
          className='events-all' // for click event
          appearance="primary"
          onClick={sendExit}
          padding={5}
          display="flex" alignItems="center" justifyContent="center"
          marginRight={5}
        >
            exit <Icon icon={LogOutIcon} marginLeft={4} size={10} />
        </Button>
        {/* side bar menu */}
        {/* <Component initialState={{ sideIsShown: false }}>
          {({ state, setState }) => (
            <>
              <SideSheet
                width={300}
                position={Position.LEFT}
                isShown={state.sideIsShown 
                && !loading 
                && status !== null
                && status !== GAME_STATUS.USER_EXIT
                && status !== GAME_STATUS.USER_LEFT
                }
                onCloseComplete={() => setState({ sideIsShown: false })}
              >
                <Paragraph margin={40}>Basic Example</Paragraph>
              </SideSheet>
              <IconButton icon={DoubleChevronRightIcon} appearance="primary" intent="success" onClick={() => setState({ sideIsShown: true })}
                display="flex" alignItems="center"  width={40}>

              </IconButton>
            </>
          )}
        </Component> */}
      </Pane>
      
      {/* Game Info */}
      <div className={styles['game-info-bar']}>
        <span>{gameInfo}</span>
      </div>

      {/* confirm btn */}
      <Button
        className={`events-all ${styles['game-btn-confirm']}`}
        appearance="primary"
        onClick={confirmHandler}
        padding={5}
        display="flex" alignItems="center" justifyContent="center"
        data-show={showConfirmBtn}
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
          status === null
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

      {/* remove `X` icon on the side bar */}
      <style global jsx>{`
        .css-1y9310r{
          display:none;
        }
      `}</style>
    </Pane>
  )
}