import { Graphics, Container, Sprite } from '@inlet/react-pixi'
import { DESIGN_WIDTH,DESIGN_HEIGHT } from 'configs/variables'

const LINE_X = 200
const LINE_Y = DESIGN_HEIGHT - 250
const LINE_WIDTH = DESIGN_WIDTH - 600
const LINE_HEIGHT = 200

export default function CardLine(){

  // Methods
  const drawPlaceHolder= (g) => { 
    g.clear()
    g.lineStyle(2, 0xff00ff, 1)
    g.beginFill(0xff00bb, 0.25)
    g.moveTo(0, 0)
    g.lineTo(LINE_WIDTH, 0)
    g.lineTo(LINE_WIDTH, LINE_HEIGHT)
    g.lineTo(0, LINE_HEIGHT)
    g.lineTo(0, 0)
    g.endFill()
  }
  
  return (
    <Container
      position={[ LINE_X, LINE_Y] }
      width={LINE_WIDTH}
      height={LINE_HEIGHT}
    >
      <Graphics 
        draw={drawPlaceHolder}
      />
    </Container>
  )
}