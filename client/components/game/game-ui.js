import { useState } from 'react'
import { useRouter } from 'next/router'
import { Pane, Spinner, Overlay,toaster} from 'evergreen-ui'

import api from 'utils/api'
import { API_CODE_SUCCESS, API_CODE_FAIL } from 'configs/variables'

export default function GameUI(initState) {
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
    <>
      {
        initState ? 
          <>
            <h1 className="heading">Game</h1>
            <button onClick={sendExit}>
            exit
            </button>
          </>
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
    </>
  )
}