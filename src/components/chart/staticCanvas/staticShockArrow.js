import { DIRECTIONS, STATIC_ARROW_WIDTH, STATIC_ARROW_HEIGHT } from '../../../constants'
import { getAssetPath, noop } from '../../../utils'

const arrowImg = new Image()
arrowImg.src = getAssetPath('static_arrows.png')

// const TOP_PADDING = STATIC_ARROW_HEIGHT / 2;
const LEFT_PADDING = STATIC_ARROW_WIDTH * 2
const COLUMN_WIDTH = STATIC_ARROW_WIDTH * 4
const COLUMN_SPACING = STATIC_ARROW_WIDTH * 4

class StaticShockArrow {
  constructor(shock) {
    this.key = shock.key
    this.note = shock.note
    this.beatstamp = shock.beatstamp
  }

  currentBeatPosition(beatTick) {
    return this.beatstamp - beatTick
  }

  render(canvas, { beatTick }, attrs) {
    const c = canvas.getContext('2d')

    const { mods, columnIdx, columnHeight } = attrs
    const { speed } = mods

    for (let i = 0; i < this.note.length; i++) {
      if (this.note[i] !== 'M') continue
      let frameX, frameY, destX, destY
      const direction = DIRECTIONS[i % 4]
      const arrowWidth = STATIC_ARROW_WIDTH
      const arrowHeight = STATIC_ARROW_HEIGHT

      frameX = DIRECTIONS.indexOf(direction) * arrowWidth
      frameY = arrowHeight * 4

      destX = i * arrowWidth
      // calculate column offset
      destX += columnIdx * (COLUMN_WIDTH + COLUMN_SPACING) + LEFT_PADDING

      destY = this.currentBeatPosition(beatTick) * arrowHeight * speed
      // calculate row wraparound
      destY = destY % columnHeight

      noop()

      c.drawImage(arrowImg, frameX, frameY, arrowWidth, arrowHeight, destX, destY, arrowWidth, arrowHeight)
    }
  }
}

export default StaticShockArrow
