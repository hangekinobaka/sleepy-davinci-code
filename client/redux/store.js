import { createStore, combineReducers } from 'redux'
import * as card from './card/actions'

const reducer = combineReducers({
  card: card.reducer
})

const store = createStore(reducer)

export default store
