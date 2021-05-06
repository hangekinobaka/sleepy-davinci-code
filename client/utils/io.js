/**
 * Socket.io client handler
 * @param socket: an initialized socket object
 */
export default function SocketClient(socket){
  this.socket = socket
  
  this.join = () => {
    socket.emit('join', (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.drawCard = ()=>{
    return Math.floor((Math.random()*11+1))
  }

  this.draw = color => {
    socket.emit('draw', {color}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }

  this.init = ({dispatch, setCardNumW, setCardNumB, setIsInteractive, setCanDrawCard, setMyLine})=>{
    socket.on('init', initData => {
      console.log(initData)
      dispatch(setCardNumW(initData.wNum))
      dispatch(setCardNumB(initData.bNum))
      dispatch(setMyLine(initData.line))
      dispatch(setIsInteractive(true))
      dispatch(setCanDrawCard(true))
    })
  }

  this.receiveCard = ({dispatch, setDrawingNum}) => {
    socket.on('receiveCard', ({number}) => {
      dispatch(setDrawingNum(number))
    })
  }

  this.updateLine = newLine => {
    socket.emit('updateLine', {newLine}, (error) => {
      if(error) {
        console.error(error)
      }
    })
  }
}