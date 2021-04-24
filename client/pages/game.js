import { useEffect } from 'react'
import io from 'socket.io-client'

const ENDPOINT = process.env.NEXT_PUBLIC_API_URL|| 'localhost:5000'

let socket

export default function Game() {

  useEffect(() => {
    // Connect the web socket
    socket = io(ENDPOINT,{
      path: process.env.NODE_ENV === 'production' ? '/api/socket.io' : '/socket.io'
    })

    socket.emit('join', { user:'irene', room:'room1' }, (error) => {
      if(error) {
        alert(error)
      }
    })

    return () => {
      socket.emit('disconnect')
      socket.off()
    }

  },[ENDPOINT])

  useEffect(() => {
    socket.on('message', message => {
      console.log(message)
    })

  }, [])

  return (
    <h1 className="heading">Game</h1>
  )
}