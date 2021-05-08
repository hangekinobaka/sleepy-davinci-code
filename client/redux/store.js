import { createStore, combineReducers } from 'redux'
import * as card from './card/actions'
import * as win from './win/actions'
import * as user from './user/actions'
import * as ui from './ui/actions'

const reducer = combineReducers({
  card: card.reducer,
  win: win.reducer,
  user: user.reducer,
  ui: ui.reducer
})

const store = createStore(reducer)

export default store
