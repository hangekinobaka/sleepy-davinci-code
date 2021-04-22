import { useEffect } from 'react'
import io from "socket.io-client";

let socket

export default function Game({ENDPOINT}) {

  useEffect(() => {
    socket = io(ENDPOINT)

  },[ENDPOINT]);

  return (
    <h1 className="heading">Game</h1>
  );
}

export async function getStaticProps() {
  const ENDPOINT = process.env.REACT_APP_ENDPOINT || 'localhost:5000'

  return {
    props: {ENDPOINT}, // will be passed to the page component as props
  }
}
