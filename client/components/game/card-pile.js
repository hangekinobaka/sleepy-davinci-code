import { Text } from 'pixi.js'
import { PixiComponent } from '@inlet/react-pixi'

export default PixiComponent('CardPile', {
  create: ({ count }) => {
    return new Text(count.toString())
  },
})