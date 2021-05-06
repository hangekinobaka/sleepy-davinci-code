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

  this.drawCard = ()=>{
    return Math.floor((Math.random()*11+1))
  }

  this.draw = color=>{
    socket.emit('draw', {color}, (error) => {
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

  this.receiveCard = ()=>{
    socket.on('receiveCard', number => {
      console.log(number)
    })
  }
}