import {
  DIRECTIONS,
  ARROW_SHAPES,
  ARROW_WIDTH,
  ARROW_HEIGHT,
  STATIC_ARROW_WIDTH,
  STATIC_ARROW_HEIGHT,
  FREEZE_BODY_HEIGHT,
} from '../../../constants'
import { getAssetPath } from '../../../utils'
import { getReverseCoord } from '../../../utils/engineUtils'

const arrowImages = {}
DIRECTIONS.forEach((direction) => {
  ARROW_SHAPES.forEach((shape) => {
    arrowImages[`${shape}_rainbow_${direction}`] = new Image()
    arrowImages[`${shape}_rainbow_${direction}`].src = getAssetPath(`arrow_${shape}_rainbow_${direction}.png`)
    arrowImages[`${shape}_note_${direction}`] = new Image()
    arrowImages[`${shape}_note_${direction}`].src = getAssetPath(`arrow_${shape}_note_${direction}.png`)
    arrowImages[`${shape}_vivid_${direction}`] = new Image()
    arrowImages[`${shape}_vivid_${direction}`].src = getAssetPath(`arrow_${shape}_vivid_${direction}.png`)
    arrowImages[`${shape}_flat_${direction}`] = new Image()
    arrowImages[`${shape}_flat_${direction}`].src = getAssetPath(`arrow_${shape}_vivid_${direction}.png`)
  })
})

const freezeImages = ['tap_explosion']
freezeImages.forEach((imageName) => {
  arrowImages[imageName] = new Image()
  arrowImages[imageName].src = getAssetPath(`${imageName}.png`)
})

ARROW_SHAPES.forEach((shape) => {
  arrowImages[`freeze_${shape}_head`] = new Image()
  arrowImages[`freeze_${shape}_head`].src = getAssetPath(`freeze_${shape}_head.png`)
  arrowImages[`freeze_${shape}_body_active`] = new Image()
  arrowImages[`freeze_${shape}_body_active`].src = getAssetPath(`freeze_${shape}_body_active.png`)
  arrowImages[`freeze_${shape}_body_inactive`] = new Image()
  arrowImages[`freeze_${shape}_body_inactive`].src = getAssetPath(`freeze_${shape}_body_inactive.png`)
  arrowImages[`freeze_${shape}_tail_active`] = new Image()
  arrowImages[`freeze_${shape}_tail_active`].src = getAssetPath(`freeze_${shape}_tail_active.png`)
  arrowImages[`freeze_${shape}_tail_inactive`] = new Image()
  arrowImages[`freeze_${shape}_tail_inactive`].src = getAssetPath(`freeze_${shape}_tail_inactive.png`)
})

class Arrow {
  constructor(attrs) {
    const { key } = attrs

    this.key = key // arrow index
    this.note = attrs.note
    this.measureIdx = attrs.measureIdx
    this.measureN = attrs.measureN
    this.measureD = attrs.measureD

    this.beatstamp = attrs.beatstamp
  }

  currentBeatPosition(beatTick) {
    return this.beatstamp - beatTick
  }
  currentTimePosition(timeTick) {
    return this.timestamp - timeTick
  }

  renderFreezeBody(canvas, { beatTick, timeTick, mBpm }, directionIdx, attrs) {
    const c = canvas.getContext('2d')

    const { mods, staticAttrs } = attrs
    const { speed, noteShape, cmod, scroll, appearance } = mods

    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    const topBoundary = 0
    const bottomBoundary = canvas.height

    let arrowImg
    let frameX, frameY, destX, destY
    const direction = DIRECTIONS[directionIdx % 4]

    const arrowWidth = staticAttrs ? STATIC_ARROW_WIDTH : ARROW_WIDTH
    const arrowHeight = staticAttrs ? STATIC_ARROW_HEIGHT : ARROW_HEIGHT
    const freezeBodyHeight = FREEZE_BODY_HEIGHT

    // freeze body and tail
    if (this.note[directionIdx] === '3') {
      arrowImg = arrowImages[`freeze_${noteShape}_tail_inactive`]

      frameX = ((directionIdx % 4) + (scroll === 'reverse' ? 4 : 0)) * arrowWidth
      frameY = 0

      destX = directionIdx * arrowWidth

      if (speed === 'cmod') {
        destY = this.currentTimePosition(timeTick) * arrowHeight * (cmod / 60)
      } else {
        destY = this.currentBeatPosition(beatTick) * arrowHeight * speedMod
        // prevent edge case rounding errors that leave destY a tiny fraction above 0
        destY = Math.floor(destY * 10000) / 10000
      }

      // Bottom of freeze body must be the bottom of the body image (yellow part of gradient)
      // and line up with the top of the freeze tail.
      // Extend the freeze body upwards using as many repetitions of the 128px height image as needed.
      // Top of freeze body is cut off at the midpoint of the freeze head.
      let arrowBodyImg = arrowImages[`freeze_${noteShape}_body_inactive`]

      let totalBodyHeight
      if (speed === 'cmod') {
        totalBodyHeight =
          (this.holdEndTimes[directionIdx] - this.holdStartTimes[directionIdx]) * arrowHeight * (cmod / 60) -
          arrowHeight / 2
      } else {
        totalBodyHeight =
          (this.holdEndBeats[directionIdx] - this.holdStartBeats[directionIdx]) * arrowHeight * speedMod -
          arrowHeight / 2
      }
      const repetitions = Math.floor(totalBodyHeight / freezeBodyHeight)
      let partialHeight = totalBodyHeight % freezeBodyHeight
      const originalPartialHeight = partialHeight

      let partialDestY = destY - (totalBodyHeight + arrowHeight / 2)
      let freezeBeingHeld = false

      // shrink in size once it reaches the target
      // this is also where the freeze starts to be held down
      if (partialDestY <= 0) {
        partialHeight += partialDestY
        partialDestY = 0
        arrowImg = arrowImages[`freeze_${noteShape}_tail_active`]
        arrowBodyImg = arrowImages[`freeze_${noteShape}_body_active`]

        if (destY > 0) {
          freezeBeingHeld = true
        }
      }

      // draw partial
      if (partialDestY > -partialHeight && partialDestY < bottomBoundary && appearance !== 'stealth') {
        c.drawImage(
          arrowBodyImg,
          frameX,
          scroll === 'reverse' ? 0 : freezeBodyHeight - partialHeight,
          arrowWidth,
          partialHeight,
          destX,
          scroll === 'reverse'
            ? getReverseCoord(partialDestY + arrowHeight / 2, partialHeight, canvas)
            : partialDestY + arrowHeight / 2,
          arrowWidth,
          partialHeight
        )
      }

      // draw repetitions of freeze body
      for (let i = 1; i <= repetitions; i++) {
        let bodyHeight = freezeBodyHeight
        let bodyFrameY = 0
        let bodyDestY = destY - (totalBodyHeight + arrowHeight / 2 - originalPartialHeight - freezeBodyHeight * (i - 1))
        if (bodyDestY < 0 && bodyDestY > -freezeBodyHeight) {
          bodyHeight += bodyDestY
          bodyFrameY -= bodyDestY
          bodyDestY = 0
        }
        if (bodyDestY > -bodyHeight && bodyDestY < bottomBoundary && appearance !== 'stealth') {
          c.drawImage(
            arrowBodyImg,
            frameX,
            scroll === 'reverse' ? 0 : bodyFrameY,
            arrowWidth,
            bodyHeight,
            destX,
            scroll === 'reverse'
              ? getReverseCoord(bodyDestY + arrowHeight / 2, bodyHeight, canvas)
              : bodyDestY + arrowHeight / 2,
            arrowWidth,
            bodyHeight
          )
        }
      }

      let tailHeight = arrowHeight

      // if the freeze is shorter than the height of the tail sprite,
      // cut off the top of the sprite such that it starts at the midpoint of the freeze head

      // Because we need to overwrite destY for proper sprite placement in the event that the
      // top of the sprite needs to be cut off, store the actual Y position of the arrow
      // in a separate variable
      let actualDestY = destY

      let bodyDistance
      if (speed === 'cmod') {
        bodyDistance = (this.holdEndTimes[directionIdx] - this.holdStartTimes[directionIdx]) * arrowHeight * (cmod / 60)
      } else {
        bodyDistance = (this.holdEndBeats[directionIdx] - this.holdStartBeats[directionIdx]) * arrowHeight * speedMod
      }

      if (bodyDistance < arrowHeight / 2) {
        const tailPartialHeight = bodyDistance // distance between head note and tail note, less than half arrow height
        frameY += arrowHeight / 2 - tailPartialHeight
        destY += arrowHeight / 2 - tailPartialHeight
        tailHeight = tailPartialHeight + arrowHeight / 2
      }

      // shrink in size once it reaches the target
      if (destY < arrowHeight / 2 && destY > topBoundary) {
        frameY += arrowHeight / 2 - destY
        destY = arrowHeight / 2
      }

      if (actualDestY > topBoundary && actualDestY < bottomBoundary && appearance !== 'stealth') {
        c.drawImage(
          arrowImg,
          frameX,
          scroll === 'reverse' ? 0 : frameY,
          arrowWidth,
          scroll === 'reverse' ? arrowHeight - frameY : tailHeight,
          destX,
          scroll === 'reverse' ? getReverseCoord(actualDestY, arrowHeight, canvas) : destY,
          arrowWidth,
          scroll === 'reverse' ? arrowHeight - frameY : tailHeight
        )
      }

      // render head of held freeze arrow on top of the arrow body
      if (freezeBeingHeld) {
        const arrowHeadImg = arrowImages[`freeze_${noteShape}_head`]
        c.drawImage(
          arrowHeadImg,
          DIRECTIONS.indexOf(direction) * arrowWidth,
          arrowHeight * 2,
          arrowWidth,
          arrowHeight,
          directionIdx * arrowWidth,
          scroll === 'reverse' ? getReverseCoord(0, arrowHeight, canvas) : 0,
          arrowWidth,
          arrowHeight
        )
      }
    }
  }

  renderArrow(canvas, { beatTick, timeTick, mBpm }, directionIdx, attrs) {
    const c = canvas.getContext('2d')

    const { mods, staticAttrs } = attrs
    const { speed, cmod, noteColor, noteShape, colorFreezes, scroll, appearance } = mods

    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    let topBoundary = 0 // used to simulate the arrows being hit and disappearing
    if (staticAttrs) topBoundary = -1 // if rendering on static chart, arrow on the first measure should be visible

    const bottomBoundary = canvas.height // can be adjusted with SUDDEN+

    // nothing
    if (this.note[directionIdx] === '0') return

    // stealth
    if (appearance === 'stealth') return

    let arrowImg
    let frameX, frameY, destX, destY
    const direction = DIRECTIONS[directionIdx % 4]

    const arrowWidth = staticAttrs ? STATIC_ARROW_WIDTH : ARROW_WIDTH
    const arrowHeight = staticAttrs ? STATIC_ARROW_HEIGHT : ARROW_HEIGHT

    // regular note
    if (this.note[directionIdx] === '1' || (this.note[directionIdx] === '2' && colorFreezes)) {
      arrowImg = arrowImages[`${noteShape}_${noteColor}_${direction}`]

      // color as freeze head if it is hit simultaneously with a freeze arrow
      if (this.note.includes('2') && !colorFreezes) {
        arrowImg = arrowImages[`freeze_${noteShape}_head`]
        frameX = DIRECTIONS.indexOf(direction) * arrowWidth
        frameY = 0
      } else {
        if (noteColor === 'rainbow') {
          frameX = (Math.floor(beatTick * 4) % 8) * arrowWidth

          const beatD = this.measureD / 4
          const beatN = this.measureN % beatD
          if (beatN === 0) {
            frameY = 0
          } else if (0 < beatN && beatN <= beatD / 4) {
            frameY = 1
          } else if (beatD / 4 < beatN && beatN <= beatD / 2) {
            frameY = 2
          } else if (beatD / 2 < beatN && beatN <= (3 * beatD) / 4) {
            frameY = 3
          } else if ((3 * beatD) / 4 < beatN && beatN < beatD) {
            frameY = 0
          }
          frameY *= arrowHeight
        } else if (noteColor === 'note') {
          frameX = (Math.floor(beatTick * 4) % 8) * arrowWidth

          /* 
              NOTE: In the future, if we want to support color codes for 12ths, 24ths, etc.
              We need to use more precise math to avoid rounding errors.
              Planned approach: Reduce the measure fraction by dividing both numerator and denominator
              by their greatest common factor.
              If GCF == 1, 2, or 4, use 4th note quantization.
              Otherwise, the resulting denominator is used for the quantization (3 and 6 may be treated as 12ths)
            */
          const measureFraction = this.measureN / this.measureD
          if ([0, 1 / 4, 2 / 4, 3 / 4].includes(measureFraction)) {
            frameY = 0
          } else if ([1 / 8, 3 / 8, 5 / 8, 7 / 8].includes(measureFraction)) {
            frameY = 1
          } else if ([1 / 16, 3 / 16, 5 / 16, 7 / 16, 9 / 16, 11 / 16, 13 / 16, 15 / 16].includes(measureFraction)) {
            frameY = 3
          } else {
            frameY = 2
          }
          frameY *= arrowHeight
        } else if (noteColor === 'vivid') {
          frameX = (Math.floor(beatTick * 4) % 4) * arrowWidth

          const beatD = this.measureD / 4
          const beatN = this.measureN % beatD
          const noteOffset = Math.floor(beatTick) % 4

          if (beatN === 0) {
            frameY = 0
          } else if (0 < beatN && beatN <= beatD / 4) {
            frameY = 1
          } else if (beatD / 4 < beatN && beatN <= beatD / 2) {
            frameY = 2
          } else if (beatD / 2 < beatN && beatN <= (3 * beatD) / 4) {
            frameY = 3
          } else if ((3 * beatD) / 4 < beatN && beatN < beatD) {
            frameY = 0
          }
          frameY = ((frameY + noteOffset) % 4) * arrowHeight
        } else if (noteColor === 'flat') {
          arrowImg = arrowImages[`${noteShape}_vivid_${direction}`]

          frameX = (Math.floor(beatTick * 4) % 4) * arrowWidth
          frameY = (Math.floor(beatTick) % 4) * arrowHeight
        }
      }

      destX = directionIdx * arrowWidth
      if (staticAttrs) {
        destX += staticAttrs.columnIdx * (arrowWidth * 4 * 2) + arrowWidth * 2
      }

      if (speed === 'cmod') {
        destY = this.currentTimePosition(timeTick) * arrowHeight * (cmod / 60)
      } else {
        destY = this.currentBeatPosition(beatTick) * arrowHeight * speedMod

        if (staticAttrs) {
          destY = destY % staticAttrs.columnHeight
        }
      }

      destY = (destY + 0.5) | 0

      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          arrowWidth,
          arrowHeight,
          destX,
          scroll === 'reverse' ? getReverseCoord(destY, arrowHeight, canvas) : destY,
          arrowWidth,
          arrowHeight
        )
      }
    }

    // freeze note
    else if (this.note[directionIdx] === '2') {
      arrowImg = arrowImages[`freeze_${noteShape}_head`]
      frameX = DIRECTIONS.indexOf(direction) * arrowWidth
      frameY = 0

      destX = directionIdx * arrowWidth
      if (speed === 'cmod') {
        destY = this.currentTimePosition(timeTick) * arrowHeight * (cmod / 60)
      } else {
        destY = this.currentBeatPosition(beatTick) * arrowHeight * speedMod
      }
      destY = (destY + 0.5) | 0

      // draw freeze head
      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          arrowWidth,
          arrowHeight,
          destX,
          scroll === 'reverse' ? getReverseCoord(destY, arrowHeight, canvas) : destY,
          arrowWidth,
          arrowHeight
        )
      }
    }
  }
}

export default Arrow
