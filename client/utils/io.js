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

  this.draw = color => {
    this.socket.emit('draw', {color}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.receiveCard = (callback) => {
    this.socket.on('receiveCard', ({number}) => {
      callback(number)
    })
  }

  this.drawFinish = (callback)=>{
    this.socket.emit('drawFinish', (error) => {
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

  this.exit = (callback)=>{
    this.socket.emit('exit', (error) => {
      if(error) {
        console.error(error)
      }
    })
  }
}