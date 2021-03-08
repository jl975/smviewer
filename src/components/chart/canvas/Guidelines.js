import { ARROW_HEIGHT } from '../../../constants'
import { getReverseCoord } from '../../../utils/engineUtils'

class Guidelines {
  constructor(finalBeat) {
    this.finalBeat = finalBeat
  }

  render(canvas, { beatTick, mBpm }, attrs) {
    const { mods } = attrs
    const { speed, scroll } = mods

    const showGuidelines = mods.guidelines
    if (!showGuidelines) return

    // FIXME: do an actual spacing calculation for cmod
    if (speed === 'cmod') return

    const c = canvas.getContext('2d')
    c.strokeStyle = '#fff'

    const topBoundary = 0
    const bottomBoundary = canvas.height

    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    for (let beat = 0; beat <= this.finalBeat; beat++) {
      let destY = (beat - beatTick) * ARROW_HEIGHT * speedMod + ARROW_HEIGHT / 2
      // let destY = (beat - beatTick) * ARROW_HEIGHT * speed;

      destY = (destY + 0.5) | 0

      // Render a thick line if the beat falls on the beginning of the measure.
      // Render a thin line otherwise
      const lineWidth = beat % 4 === 0 ? 2 : 1

      if (destY > topBoundary && destY < bottomBoundary) {
        if (scroll === 'reverse') {
          destY = getReverseCoord(destY, 0, canvas)
        }
        c.beginPath()
        c.moveTo(0, destY)
        c.lineTo(canvas.width, destY)
        c.lineWidth = lineWidth
        c.stroke()
      }
    }
  }
}

export default Guidelines
