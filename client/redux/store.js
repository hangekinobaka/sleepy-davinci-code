import { createStore, combineReducers } from 'redux'
import * as card from './card/actions'
import * as win from './win/actions'

const reducer = combineReducers({
  card: card.reducer,
  win: win.reducer
})

const store = createStore(reducer)

export default store
