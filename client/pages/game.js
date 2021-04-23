import { useEffect } from 'react'
import io from "socket.io-client"

const ENDPOINT = process.env.RNEXT_PUBLIC_ENDPOINT|| 'localhost:5000';

let socket

export default function Game() {

  useEffect(() => {
    socket = io(ENDPOINT)

  },[ENDPOINT]);

  return (
    <h1 className="heading">Game</h1>
  );
}