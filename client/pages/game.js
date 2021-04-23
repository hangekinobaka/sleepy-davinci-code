import { useEffect } from 'react'
import io from 'socket.io-client'

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL|| 'localhost:5000'

let socket

export default function Game() {

  useEffect(() => {
    socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api' : ''
    })

  },[ENDPOINT])

  return (
    <h1 className="heading">Game</h1>
  )
}