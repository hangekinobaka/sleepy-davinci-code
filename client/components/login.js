import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from 'styles/login.module.scss'
import Component from '@reach/component-component'
import { Pane, Tablist, Tab, TextInputField, Switch, Button, CaretRightIcon, 
  Text, Heading, Spinner, Overlay,toaster} from 'evergreen-ui'

import api from 'utils/api'
import {USERNAME_LEN,INVITE_CODE_LEN, API_CODE_SUCCESS, API_CODE_FAIL, API_CODE_NO_DATA, 
  API_CODE_ROOM_GEN_FAIL, API_CODE_NO_ROOM, API_CODE_ROOM_TAKEN} from 'configs/variables'

export default function Join() {
  const router = useRouter()
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [username, setUsername] = useState('')
  const [usernameClicked, setUsernameClicked] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [inviteCode, setInviteCode] = useState('')
  const [initState, setInitState] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    sendInit()
  }, [])

  // Check if the username is valid
  const usernameIsInvalid = () => usernameClicked && username === ''
  
  // Methods
  const formSubmit = (e)=>{
    e.preventDefault()
    
    switch(e.target.name){
    case 'start':
      sendLogin()
      break
    case 'join':
      sendJoin()
      break
    default:
      break
    }
  } 

  // APIs
  const sendLogin = async () => {
    setLoading(true)
    try {
      const res = await api('post', '/login', { username, isPrivate })
      switch (res.code) {
      case API_CODE_SUCCESS:
        router.push('/game')
        return 
      case API_CODE_ROOM_GEN_FAIL:  
        toaster.danger(
          'Oops! The room might be full. Please try it later...'
        )
        break
      case API_CODE_FAIL:
      default:
        toaster.danger(
          'Oops! login error. Please try it later...'
        )
        break
      }
    } catch (error) {
      toaster.danger(
        'Oops! Network error. Please try it later...'
      )
    }
    setLoading(false)
  }
  const sendInit = async () => {
    const res = await api('post', '/init')
    switch (res.code) {
    case API_CODE_SUCCESS:
      router.push('/game')
      return
    case API_CODE_NO_DATA:
    case API_CODE_FAIL:
    default:
      break
    }
    setInitState(true)
  }
  const sendJoin = async () => {
    setLoading(true)
    try {
      const res = await api('post', '/join', { username, inviteCode })
      switch (res.code) {
      case API_CODE_SUCCESS:
        router.push('/game')
        return
      case API_CODE_NO_ROOM:  
        toaster.warning(
          'Seems no room left, try to create one yourself!'
        )
        setSelectedIndex(0)
        break
      case API_CODE_ROOM_TAKEN:
        toaster.warning(
          'Sorry, this room is taken.'
        )
        break
      case API_CODE_FAIL:
      default:
        toaster.danger(
          'Oops! login error. Please try it later...'
        )
        break
      }
    } catch (error) {
      toaster.danger(
        'Oops! Network error. Please try it later...'
      )
    }
    setLoading(false)
  }

  return (
    <Pane className={styles['login-container']}
    >
      {
        initState ? 
          <Component
            initialState={{
              tabs: [['start', 'Start A Game'], ['join', 'Join A Game']]
            }}
          >
            {({ state, setState }) => (
              <Pane height={120}>
                <Tablist marginBottom={16} flexBasis={240} marginRight={24}>
                  {state.tabs.map((tab, index) => (
                    <Tab
                      fontSize={20}
                      key={tab[0]}
                      id={tab[0]}
                      onSelect={() => setSelectedIndex(index)}
                      isSelected={index === selectedIndex}
                      aria-controls={`panel-${tab[0]}`}
                    >
                      {tab[1]}
                    </Tab>
                  ))}
                </Tablist>

                <Pane padding={45} paddingBottom={30} paddingTop={30} background="tint1" flex="1">
                  {/* Start Game Panel */}
                  <Pane
                    id={`panel-${state.tabs[0][0]}`}
                    role="tabpanel"
                    aria-labelledby={state.tabs[0][0]}
                    aria-hidden={selectedIndex !== 0}
                    display={selectedIndex  === 0 ? 'block' : 'none'}
                  >
                    <Heading size={700} marginBottom={20}>Start A Game</Heading>
                    <form method="POST" action="#" onSubmit={formSubmit} name="start">
                      <TextInputField
                        isInvalid={usernameIsInvalid()}
                        name="username"
                        label="Username"
                        id="username"
                        placeholder="Enter username..."
                        width="100%"
                        maxLength={USERNAME_LEN}
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onClick={() => setUsernameClicked(true)}
                      />
                      <Pane alignItems="center" display="flex" height={48} justifyContent="space-between" marginBottom={16}>
                        <Text onClick={()=>setIsPrivate(!isPrivate)} cursor="pointer" >Private Room?</Text>
                        <Switch
                          height={20}
                          checked={isPrivate}
                          onChange={e => setIsPrivate(e.target.checked)}
                          marginLeft={16}
                        />
                      </Pane>
                      <Button type="submit" appearance="primary" height={40} fontSize={20} 
                        justifyContent="center" 
                        width="100%"
                      >Start! <CaretRightIcon /></Button>
                    </form>
                  </Pane>
                
                  {/* Join Game Panel */}
                  <Pane
                    id={`panel-${state.tabs[1][0]}`}
                    role="tabpanel"
                    aria-labelledby={state.tabs[1][0]}
                    aria-hidden={selectedIndex !== 1}
                    display={selectedIndex === 1 ? 'block' : 'none'}
                  >
                    <Heading size={700} marginBottom={20}>Join A Game</Heading>
                    <form method="POST" action="#" onSubmit={formSubmit} name="join">
                      <TextInputField
                        isInvalid={usernameIsInvalid()}
                        name="username"
                        label="Username"
                        id="username"
                        placeholder="Enter username..."
                        width="100%"
                        maxLength={USERNAME_LEN}
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onClick={() => setUsernameClicked(true)}
                      />
                      <TextInputField
                        name="inviteCode"
                        label={`${INVITE_CODE_LEN}-digit Room Code`}
                        id="inviteCode"
                        placeholder="e.g. 0000"
                        description="Optional"
                        width="100%"
                        maxLength={INVITE_CODE_LEN}
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value)}
                      />
                      <Button type="submit" appearance="primary" height={40} fontSize={20} 
                        justifyContent="center" 
                        width="100%"
                      >Join! <CaretRightIcon /></Button>
                    </form>
                  </Pane>   
                </Pane>  

              </Pane>
            )}
          </Component>

          : 

          <Pane display="flex" alignItems="center" justifyContent="center" height={600}>
            <Spinner />
          </Pane>
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
      
    </Pane>
  )
}