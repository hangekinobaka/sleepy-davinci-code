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


  this.init = (callback)=>{
    this.socket.on('init', initData => {
      callback(initData)
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
    this.socket.on('receiveCard', ({num}) => {
      callback({num})
    })
  }

  this.cardNumChange = (callback) => {
    this.socket.on('cardNumChange', ({ wNum, bNum}) => {
      callback({ wNum, bNum})
    })
  }

  this.drawFinish = ({color, num, drawId})=>{
    this.socket.emit('drawFinish', {color, num, drawId}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.opReceiveCard = (callback)=>{
    this.socket.on('opReceiveCard', ({color}) => {
      callback({color})
    })
  }

  this.opUpdateLine = (callback)=>{
    this.socket.on('opUpdateLine', ({newLine}) => {
      callback({newLine})
    })
  }

  this.updateLine = newLine => {
    this.socket.emit('updateLine', {newLine}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.updateLineRes = (callback) => {
    this.socket.on('updateLineRes', ({res}) => {
      callback(res)
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