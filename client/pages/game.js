import { useEffect } from 'react'
import io from "socket.io-client"

const ENDPOINT = process.env.REACT_APP_ENDPOINT|| 'localhost:5000';

let socket

export default function Game() {

  useEffect(() => {
    socket = io(ENDPOINT)

  },[ENDPOINT]);

  return (
    <h1 className="heading">Game</h1>
  );
}