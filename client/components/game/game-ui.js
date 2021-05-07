import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay, toaster, Dialog, Button, SideSheet, 
  Paragraph, Position, DoubleChevronRightIcon, LogOutIcon, IconButton, Icon } from 'evergreen-ui'
import Component from '@reach/component-component'

import api from 'utils/api'
import styles from 'styles/game.module.scss'
import { API_CODE_SUCCESS, API_CODE_FAIL } from 'configs/variables'
import { GAME_STATUS } from 'configs/game'

export default function GameUI() {
  // Stores
  const username = useSelector(state => state.user.username)
  const user = useSelector(state => state.user.user)
  const room_code = useSelector(state => state.user.room_code)
  const status = useSelector(state => state.user.status)
  const socketClient = useSelector(state => state.user.socketClient)

  // States
  const [loading, setLoading] = useState(false)
  const [gameInfo, setGameInfo] = useState('')
  const [fullScreenInfo, setFullScreenInfo] = useState('')
  const [fullScreenInfoTitle, setFullScreenInfoTitle] = useState('')

  const router = useRouter()

  useEffect(() => {
    switch(status){
    case null:
      setFullScreenInfoTitle('Waiting')
      setFullScreenInfo('Waiting for your opponent...')
      break
    case GAME_STATUS.USER_LEFT:
      setFullScreenInfoTitle('Your Opponent has left')
      setFullScreenInfo('If he or she comes back in 3 mins, the game will be resumed')
      break
    case GAME_STATUS.USER_EXIT:
      setFullScreenInfoTitle('Your Opponent has exited')
      setFullScreenInfo('Please click exit and restart a game')
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
    case API_CODE_SUCCESS:
      // Send exit signal
      socketClient.exit()

      router.push('/')
      return
    case API_CODE_FAIL:
      toaster.danger(
        'Exit failed. Please try it later...'
      )
      break
    default:
      break
    }
    setLoading(false)
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
          className='events-all'
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
        {fullScreenInfo}
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