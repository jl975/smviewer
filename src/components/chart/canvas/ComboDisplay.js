import { getAssetPath } from '../../../utils'

const comboImages = {}

;['A20', 'A'].forEach((type) => {
  comboImages[type] = {
    num: new Image(),
    combo: new Image(),
  }
  comboImages[type].num.src = getAssetPath(`combo_numbers_${type}.png`)
  comboImages[type].combo.src = getAssetPath(`combo_${type}.png`)
})

comboImages['A20'].coords = {
  1: {
    combo: { destX: 104, destY: 195, width: 124.5, height: 41 },
    num: { destX: [51], destY: 170, width: 63, height: 70 },
  },
  2: {
    combo: { destX: 114, destY: 195, width: 124.5, height: 41 },
    num: { destX: [17, 61], destY: 170, width: 63, height: 70 },
  },
  3: {
    combo: { destX: 134, destY: 195, width: 124.5, height: 41 },
    num: { destX: [-7, 37, 81], destY: 170, width: 63, height: 70 },
  },
  4: {
    combo: { destX: 134, destY: 195, width: 124.5, height: 41 },
    num: { destX: [-51, -7, 37, 81], destY: 170, width: 63, height: 70 },
  },
}

comboImages['A'].coords = {
  1: {
    combo: { destX: 104, destY: 195, width: 124.5, height: 41 },
    num: { destX: [51], destY: 170, width: 63, height: 70 },
  },
  2: {
    combo: { destX: 114, destY: 195, width: 124.5, height: 41 },
    num: { destX: [17, 61], destY: 170, width: 63, height: 70 },
  },
  3: {
    combo: { destX: 134, destY: 195, width: 124.5, height: 41 },
    num: { destX: [-7, 37, 81], destY: 170, width: 63, height: 70 },
  },
  4: {
    combo: { destX: 134, destY: 195, width: 124.5, height: 41 },
    num: { destX: [-51, -7, 37, 81], destY: 170, width: 63, height: 70 },
  },
}

const doubleXOffset = 128

class ComboDisplay {
  render(canvas, comboNum = 0, attrs) {
    const c = canvas.getContext('2d')
    if (comboNum < 4) return

    const { mods, mode } = attrs
    const { comboFont } = mods

    let type = comboFont

    comboNum = comboNum.toString()
    const numDigits = comboNum.length

    const comboImg = comboImages[type].combo
    const numImg = comboImages[type].num

    const comboDestX = comboImages[type].coords[numDigits].combo.destX + (mode === 'double' ? doubleXOffset : 0)
    const comboDestY = comboImages[type].coords[numDigits].combo.destY
    const comboWidth = comboImages[type].coords[numDigits].combo.width
    const comboHeight = comboImages[type].coords[numDigits].combo.height

    // draw combo word
    c.drawImage(comboImg, 0, 0, comboImg.width, comboImg.height, comboDestX, comboDestY, comboWidth, comboHeight)

    // draw combo number
    for (let i = 0; i < numDigits; i++) {
      const digit = comboNum[i]

      const digitWidth = numImg.width / 4
      const digitHeight = numImg.height / 4
      const imageCol = digit % 4
      const imageRow = Math.floor(digit / 4)
      const imageX = imageCol * digitWidth
      const imageY = imageRow * digitHeight

      const numDestX = comboImages[type].coords[numDigits].num.destX[i] + (mode === 'double' ? doubleXOffset : 0)
      const numDestY = comboImages[type].coords[numDigits].num.destY
      const numWidth = comboImages[type].coords[numDigits].num.width
      const numHeight = comboImages[type].coords[numDigits].num.height

      c.drawImage(numImg, imageX, imageY, digitWidth, digitHeight, numDestX, numDestY, numWidth, numHeight)
    }
  }
}

export default ComboDisplay
