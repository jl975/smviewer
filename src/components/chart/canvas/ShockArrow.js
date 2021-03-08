import { DIRECTIONS, ARROW_WIDTH, ARROW_HEIGHT } from '../../../constants'
import { getAssetPath } from '../../../utils'
import { getReverseCoord } from '../../../utils/engineUtils'

const arrowImages = {}
DIRECTIONS.forEach((direction) => {
  arrowImages[`shock_${direction}`] = new Image()
  arrowImages[`shock_${direction}`].src = getAssetPath(`shock_${direction}.png`)
})

class ShockArrow {
  constructor(attrs) {
    const { key } = attrs

    this.key = key
    this.note = attrs.note

    this.beatstamp = attrs.beatstamp
  }

  currentBeatPosition(beatTick) {
    return this.beatstamp - beatTick
  }
  currentTimePosition(timeTick) {
    return this.timestamp - timeTick
  }

  render(canvas, frame, { beatTick, timeTick, mBpm }, attrs) {
    const c = canvas.getContext('2d')

    const { mods } = attrs
    const { speed, cmod, scroll, appearance } = mods

    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    if (appearance === 'stealth') return

    const topBoundary = -ARROW_HEIGHT // used to simulate the arrows being hit and disappearing
    const bottomBoundary = canvas.height
    frame = Math.floor(frame / 3) % 8 // each sprite frame lasts 3 canvas animation frames

    for (let i = 0; i < this.note.length; i++) {
      if (this.note[i] !== 'M') continue
      const direction = DIRECTIONS[i % 4]
      const arrowImg = arrowImages[`shock_${direction}`]
      const frameX = (frame % 4) * ARROW_WIDTH
      const frameY = Math.floor(frame / 4) * ARROW_HEIGHT
      const destX = i * ARROW_WIDTH
      let destY
      if (speed === 'cmod') {
        destY = this.currentTimePosition(timeTick) * ARROW_HEIGHT * (cmod / 60)
      } else {
        destY = this.currentBeatPosition(beatTick) * ARROW_HEIGHT * speedMod
      }

      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          ARROW_WIDTH,
          ARROW_HEIGHT,
          destX,
          scroll === 'reverse' ? getReverseCoord(destY, ARROW_HEIGHT, canvas) : destY,
          ARROW_WIDTH,
          ARROW_HEIGHT
        )
      }
    }
  }
}

export default ShockArrow
