import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay, toaster} from 'evergreen-ui'

import api from 'utils/api'
import styles from 'styles/game.module.scss'
import { API_CODE_SUCCESS, API_CODE_FAIL } from 'configs/variables'

export default function GameUI() {
  // Stores
  const username = useSelector(state => state.user.username)
  const room_code = useSelector(state => state.user.room_code)

  // States
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  // APIs
  const sendExit = async () => {
    setLoading(true)
    const res = await api('post', '/exit')
    switch (res.code) {
    case API_CODE_SUCCESS:
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
    <div className={styles['game-ui']}>
      <button onClick={sendExit}>
            exit
      </button>
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
    </div>
  )
}