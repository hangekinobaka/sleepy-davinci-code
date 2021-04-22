import { useState } from "react";
import styles from 'styles/login.module.scss'
import Component from "@reach/component-component";
import { Pane, Tablist, Tab, TextInputField, Switch, Button, CaretRightIcon, Text, Heading} from 'evergreen-ui'

export default function Join({ENDPOINT}) {
  const [username, setUsername] = useState('');
  const [usernameClicked, setUsernameClicked] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteCodeClicked, setInviteCodeClicked] = useState(false);
  // Check if the username is valid
  const usernameIsInvalid = () => usernameClicked && username === ''
  const inviteCodeIsInvalid = () => inviteCodeClicked && inviteCode === ''
  
  // Methods
  const formSubmit = (e)=>{
    e.preventDefault()
    
    switch(e.target.name){
      case 'start':
        console.log(username)
        console.log(isPrivate)
        break;
      case 'join':
        console.log(username)
        console.log(inviteCode)
        break;
      default:
        break;
    }
  } 
  return (
    <Pane className={styles["login-container"]}
      >
      <Component
        initialState={{
          selectedIndex: 0,
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
                  onSelect={() => setState({ selectedIndex: index })}
                  isSelected={index === state.selectedIndex}
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
                aria-hidden={state.selectedIndex !== 0}
                display={state.selectedIndex  === 0 ? 'block' : 'none'}
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
                    maxLength="10"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onClick={() => setUsernameClicked(true)}
                  />
                  <Pane alignItems="center" display="flex" height={48} justifyContent="space-between" >
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
                aria-hidden={state.selectedIndex !== 1}
                display={state.selectedIndex === 1 ? 'block' : 'none'}
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
                    maxLength="10"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onClick={() => setUsernameClicked(true)}
                  />
                  <TextInputField
                    isInvalid={inviteCodeIsInvalid()}
                    name="inviteCode"
                    label="Invite Code"
                    id="inviteCode"
                    placeholder="Enter invite code..."
                    width="100%"
                    maxLength="4"
                    required
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    onClick={() => setInviteCodeClicked(true)}
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
    </Pane>
  );
}