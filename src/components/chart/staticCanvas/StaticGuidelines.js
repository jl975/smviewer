import { STATIC_ARROW_HEIGHT, STATIC_ARROW_WIDTH } from '../../../constants'
import { noop } from '../../../utils'

class StaticGuidelines {
  constructor(finalBeat) {
    this.finalBeat = finalBeat
  }

  render(canvas, { beatTick }, attrs) {
    const { mods, mode, columnIdx, columnWidth, measuresPerColumn, bpmQueue = [], stopQueue = [] } = attrs
    const { speed } = mods

    const c = canvas.getContext('2d')
    c.strokeStyle = '#fff'

    const beatsPerColumn = measuresPerColumn * 4

    const columnStart = columnIdx * (columnWidth + STATIC_ARROW_WIDTH * 4) + STATIC_ARROW_WIDTH * 2
    const columnEnd = columnStart + STATIC_ARROW_WIDTH * (mode === 'double' ? 8 : 4)
    const beatZero = measuresPerColumn * 4 * columnIdx
    const nextBeatZero = measuresPerColumn * 4 * (columnIdx + 1)
    noop(columnEnd)

    c.font = '16px Arial'
    c.fillStyle = '#aaa'
    c.textAlign = 'right'
    c.textBaseline = 'middle'
    for (let beat = 0; beat < 4 * measuresPerColumn; beat++) {
      const overallBeat = beatZero + beat
      if (overallBeat >= this.finalBeat) break

      let destY = (beat - beatTick) * STATIC_ARROW_HEIGHT * speed + STATIC_ARROW_HEIGHT / 2
      destY = (destY + 0.5) | 0

      // Render a thick line if the beat falls on the beginning of the measure.
      // Render a thin line otherwise
      const lineWidth = beat % 4 === 0 ? 2 : 1

      // guidelines
      c.beginPath()
      c.moveTo(columnStart, destY)
      c.lineTo(columnStart + columnWidth, destY)
      c.lineWidth = lineWidth
      c.stroke()

      // measure beats
      // c.fillText(overallBeat, columnStart - STATIC_ARROW_WIDTH + 15, destY);

      // measure numbers (1 measure is every 4 beats)
      if (beat % 4 === 0) {
        const measureNum = overallBeat / 4 + 1
        c.fillText(measureNum, columnStart - STATIC_ARROW_WIDTH + 15, destY)
      }
    }

    // bpm values
    c.textAlign = 'right'
    c.textBaseline = 'middle'
    c.fillStyle = 'cyan'
    c.strokeStyle = 'cyan'

    for (let bpm of bpmQueue) {
      if (beatZero <= bpm.beat && bpm.beat < nextBeatZero) {
        const columnBeat = bpm.beat % beatsPerColumn
        let destY = (columnBeat - beatTick) * STATIC_ARROW_HEIGHT * speed + STATIC_ARROW_HEIGHT / 2
        destY = (destY + 0.5) | 0

        c.font = '800 20px Arial'
        c.fillText(Math.round(bpm.value), columnStart - STATIC_ARROW_WIDTH + 15, destY)

        // // bpm beat line
        // c.beginPath();
        // c.moveTo(columnStart, destY);
        // c.lineTo(columnStart + columnWidth / 2, destY);
        // c.lineWidth = 2;
        // c.stroke();
      }
    }

    // stop values
    c.textAlign = 'left'
    c.textBaseline = 'middle'
    c.fillStyle = 'red'
    c.strokeStyle = 'red'
    for (let stop of stopQueue) {
      if (beatZero <= stop.beat && stop.beat < nextBeatZero) {
        const columnBeat = stop.beat % beatsPerColumn
        let destY = (columnBeat - beatTick) * STATIC_ARROW_HEIGHT * speed + STATIC_ARROW_HEIGHT / 2
        destY = (destY + 0.5) | 0

        c.font = '800 18px Arial'
        c.fillText(stop.value, columnEnd + 3, destY)

        // stop beat line
        c.beginPath()
        c.moveTo(columnStart, destY)
        c.lineTo(columnStart + columnWidth, destY)
        c.lineWidth = 2
        c.stroke()
      }
    }
  }
}

export default StaticGuidelines
