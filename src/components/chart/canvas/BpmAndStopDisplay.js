import { ARROW_HEIGHT } from '../../../constants'
import { getAssetPath } from '../../../utils'
import { getReverseCoord } from '../../../utils/engineUtils'

const image = new Image()
image.src = getAssetPath('bpm_stop_values.png')

const DIGIT_WIDTH = 9
const DOT_WIDTH = 3
const DIGIT_HEIGHT = 19

class BpmAndStopDisplay {
  renderBpm(bpmReel, bpm, { beatTick, timeTick, mBpm }, { mods }) {
    const c = bpmReel.getContext('2d')
    const pxPosition = getPxPosition(bpm, { beatTick, timeTick, mBpm }, mods, bpmReel)

    const topBoundary = -DIGIT_HEIGHT
    const bottomBoundary = bpmReel.height

    let destY = pxPosition - 10
    destY = (destY + 0.5) | 0
    const imageHeight = DIGIT_HEIGHT

    let value = bpm.value * (mods.rate || 1)
    value = Math.round(value * 1000) / 1000

    const digits = value.toString()
    const numDigits = digits.length
    const imageY = 0

    if (destY > topBoundary && destY < bottomBoundary) {
      let destX = bpmReel.width - 2
      for (let i = numDigits - 1; i >= 0; i--) {
        const digit = digits[i]
        let imageX, imageWidth
        if (digit === '.') {
          imageX = DIGIT_WIDTH * 10 + (DIGIT_WIDTH - DOT_WIDTH) / 2
          imageWidth = DOT_WIDTH
          destX -= DOT_WIDTH
        } else {
          imageX = DIGIT_WIDTH * parseInt(digit)
          imageWidth = DIGIT_WIDTH
          destX -= DIGIT_WIDTH
        }
        // console.log(
        //   `digit ${digit}: imageX ${imageX}, imageY ${imageY}, imageWidth ${imageWidth}, imageHeight ${imageHeight}`
        // );
        c.drawImage(image, imageX, imageY, imageWidth, imageHeight, destX, destY, imageWidth, imageHeight)
      }
    }
  }

  renderStop(stopReel, stop, { beatTick, timeTick, mBpm }, { mods }) {
    const c = stopReel.getContext('2d')
    const pxPosition = getPxPosition(stop, { beatTick, timeTick, mBpm }, mods, stopReel)

    const topBoundary = -DIGIT_HEIGHT
    const bottomBoundary = stopReel.height

    const destY = pxPosition - 10
    const imageHeight = DIGIT_HEIGHT

    let value = stop.value / (mods.rate || 1)
    value = Math.round(value * 1000) / 1000

    const digits = value.toString()
    const numDigits = digits.length
    const imageY = DIGIT_HEIGHT

    if (destY > topBoundary && destY < bottomBoundary) {
      let destX = 2
      for (let i = 0; i < numDigits; i++) {
        const digit = digits[i]
        let imageX, imageWidth
        if (digit === '.') {
          imageX = DIGIT_WIDTH * 10 + (DIGIT_WIDTH - DOT_WIDTH) / 2
          imageWidth = DOT_WIDTH
        } else {
          imageX = DIGIT_WIDTH * parseInt(digit)
          imageWidth = DIGIT_WIDTH
        }
        c.drawImage(image, imageX, imageY, imageWidth, imageHeight, destX, destY, imageWidth, imageHeight)

        destX += digit === '.' ? DOT_WIDTH : DIGIT_WIDTH
      }
    }
  }
}

const getPxPosition = (event, { beatTick, timeTick, mBpm }, mods, reel) => {
  let pxPosition
  if (mods.speed === 'cmod') {
    const timeDiff = event.timestamp - timeTick
    pxPosition = timeDiff * ARROW_HEIGHT * (mods.cmod / 60)
  } else {
    const beatDiff = event.beat - beatTick
    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }
    pxPosition = beatDiff * ARROW_HEIGHT * speedMod
  }
  pxPosition += ARROW_HEIGHT / 2

  if (mods.scroll === 'reverse') {
    pxPosition = getReverseCoord(pxPosition, 0, { height: reel.clientHeight })
  }
  return pxPosition
}

export default BpmAndStopDisplay
