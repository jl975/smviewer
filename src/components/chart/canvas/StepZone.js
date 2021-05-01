import { ARROW_HEIGHT, ARROW_WIDTH, ARROW_SHAPES } from '../../../constants'
import { getAssetPath } from '../../../utils'
import { getReverseCoord } from '../../../utils/engineUtils'

const receptorImages = {}
ARROW_SHAPES.forEach((shape) => {
  receptorImages[shape] = new Image()
  receptorImages[shape].src = getAssetPath(`arrow_${shape}_receptor.png`)
})

class StepZone {
  render(canvas, { beatTick }, attrs) {
    const c = canvas.getContext('2d')

    const { mode, mods } = attrs
    const { scroll, noteShape } = mods

    // flash starts at the beginning of the quarter beat and lasts for 1/16 beat
    const isFlash = beatTick % 1 > 0 && beatTick % 1 < 0.25

    let imageY = isFlash ? ARROW_HEIGHT : 0

    c.drawImage(
      receptorImages[noteShape],
      0,
      imageY,
      ARROW_WIDTH * 4,
      ARROW_HEIGHT,
      0,
      scroll === 'reverse' ? getReverseCoord(0, ARROW_HEIGHT, canvas) : 0,
      ARROW_WIDTH * 4,
      ARROW_HEIGHT
    )

    if (mode === 'double') {
      c.drawImage(
        receptorImages[noteShape],
        0,
        imageY,
        ARROW_WIDTH * 4,
        ARROW_HEIGHT,
        ARROW_WIDTH * 4,
        scroll === 'reverse' ? getReverseCoord(0, ARROW_HEIGHT, canvas) : 0,
        ARROW_WIDTH * 4,
        ARROW_HEIGHT
      )
    }
  }
}

export default StepZone
