/**
 * Socket.io client handler
 * @param socket: an initialized socket object
 */
export default function SocketClient(socket){
  this.socket = socket
  
  this.join = () => {
    this.socket.emit('join', (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.drawCard = ()=>{
    return Math.floor((Math.random()*11+1))
  }

  this.draw = color => {
    this.socket.emit('draw', {color}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.init = (callback)=>{
    this.socket.on('init', initData => {
      callback(initData)
    })
  }

  this.receiveCard = (callback) => {
    this.socket.on('receiveCard', ({number}) => {
      callback(number)
    })
  }

  this.updateLine = newLine => {
    this.socket.emit('updateLine', {newLine}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.status = (callback)=>{
    this.socket.on('status', ({status}) => {
      callback(status)
    })
  }
}