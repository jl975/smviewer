import { getAssetPath } from "../../../utils";

const comboImages = {};

["A20", "A"].forEach((type) => {
  comboImages[`num_${type}`] = new Image();
  comboImages[`num_${type}`].src = getAssetPath(`combo_numbers_${type}.png`);
  comboImages[`combo_${type}`] = new Image();
  comboImages[`combo_${type}`].src = getAssetPath(`combo_${type}.png`);
});

class ComboDisplay {
  constructor() {
    this.combo = 0;
  }

  render(canvas, comboNum = 0) {
    const c = canvas.getContext("2d");
    if (comboNum < 4) return;

    let type = "A";

    const comboImg = comboImages[`combo_${type}`];
    const numImg = comboImages[`num_${type}`];

    // draw combo word
    c.drawImage(
      comboImg,
      0,
      0,
      comboImg.width,
      comboImg.height,
      136,
      180,
      comboImg.width / 2,
      comboImg.height / 2
    );

    // draw combo number
    comboNum = comboNum.toString();
    // console.log("comboNum", comboNum, "comboNum.length", comboNum.length);
    for (let i = comboNum.length - 1; i >= 0; i--) {
      const digit = comboNum[i];

      const digitWidth = numImg.width / 4;
      const digitHeight = numImg.height / 4;
      const imageCol = digit % 4;
      const imageRow = Math.floor(digit / 4);
      const imageX = imageCol * digitWidth;
      const imageY = imageRow * digitHeight;

      let destX = 83 - (comboNum.length - (i + 1)) * 44;
      let destY = 155;

      // console.log(
      //   `digit ${digit}, i ${i}, imageX ${imageX}, imageY ${imageY}, destX ${destX}, destY ${destY}`
      // );

      c.drawImage(
        numImg,
        imageX,
        imageY,
        digitWidth,
        digitHeight,
        destX,
        destY,
        63,
        70
      );
    }
  }
}

export default ComboDisplay;
