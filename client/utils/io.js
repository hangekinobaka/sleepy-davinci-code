/**
 * Socket.io client handler
 * @param socket: an initialized socket object
 */
export default function SocketClient(socket){
  this.socket = socket
  
  this.join = (username,room) => {
    socket.emit('join', {username, room}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.message = ()=>{
    socket.on('message', message => {
      console.log(message)
    })
  }
}