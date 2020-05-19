import { getAssetPath } from "../../../utils";

const comboImages = {};
comboImages.numA20 = new Image();
comboImages.numA20.src = getAssetPath(`combo_numbers.png`);
comboImages.comboA20 = new Image();
comboImages.comboA20.src = getAssetPath(`combo.png`);

class ComboDisplay {
  constructor() {
    this.combo = 0;
  }

  render(canvas, comboNum) {
    const c = canvas.getContext("2d");
    if (comboNum < 4) return;

    const comboImg = comboImages[`comboA20`];
    const numImg = comboImages[`numA20`];

    // draw combo word
    c.drawImage(
      comboImg,
      0,
      0,
      comboImg.width,
      comboImg.height,
      128,
      200,
      comboImg.width / 2,
      comboImg.height / 2
    );

    // draw combo number
    comboNum = comboNum.toString();
    for (let i = comboNum.length - 1; i >= 0; i--) {
      const digit = comboNum[i];

      const digitWidth = numImg.width / 4;
      const digitHeight = numImg.height / 4;
      const imageCol = digit % 4;
      const imageRow = Math.floor(digit / 4);
      const imageX = imageCol * digitWidth;
      const imageY = imageRow * digitHeight;

      c.drawImage(
        numImg,
        imageX,
        imageY,
        digitWidth,
        digitHeight,
        128 - (comboNum.length - i) * (digitWidth / 3),
        200,
        digitWidth / 2,
        digitHeight / 2
      );
    }
  }
}

export default ComboDisplay;
