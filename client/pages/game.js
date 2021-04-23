import { useEffect } from 'react'
import io from "socket.io-client";
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const ENDPOINT = publicRuntimeConfig.REACT_APP_API_URL|| 'localhost:5000';
let socket

export default function Game() {

  useEffect(() => {
    socket = io(ENDPOINT)

  },[ENDPOINT]);

  return (
    <h1 className="heading">Game</h1>
  );
}