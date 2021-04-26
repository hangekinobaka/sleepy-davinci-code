import { useEffect } from 'react'
import { useRouter } from 'next/router'
import {io} from 'socket.io-client'

import api from 'utils/api'
import {API_CODE_SUCCESS, API_CODE_FAIL, API_CODE_NO_DATA} from 'configs/variables'

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL|| 'localhost:5000'

let socket

export default function Game() {
  const router = useRouter()

  useEffect(() => {
    sendInit()
    // Connect the web socket
    socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io',
      withCredentials: true
    })

    socket.emit('join', { user:'irene', room:'room1' }, (error) => {
      if(error) {
        alert(error)
      }
    })

  },[ENDPOINT])

  useEffect(() => {

    socket.on('message', message => {
      console.log(message)
    })

  }, [])

  // APIs
  const sendExit = async () => {
    const res = await api('post', '/exit')
    switch (res.code) {
    case API_CODE_SUCCESS:
      router.push('/')
      break
    case API_CODE_FAIL:
      break
    default:
      break
    }
  }
  const sendInit = async () => {
    const res = await api('post', '/init')
    switch (res.code) {
    case API_CODE_FAIL:
    case API_CODE_NO_DATA:
      router.push('/')
      break
    case API_CODE_SUCCESS:
    default:
      break
    }
  }


  return (
    <>
      <h1 className="heading">Game</h1>
      <button onClick={sendExit}>
        exit
      </button>
    </>
  )
}