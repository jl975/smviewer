import { DIRECTIONS, ARROW_HEIGHT, ARROW_WIDTH } from "../../../constants";
import { getAssetPath } from "../../../utils";

const flashImages = {};
DIRECTIONS.forEach(direction => {
  flashImages[direction] = new Image();
  flashImages[direction].src = getAssetPath(`${direction}_tap_flash.png`);
  flashImages[direction] = new Image();
  flashImages[direction].src = getAssetPath(`${direction}_tap_flash.png`);
});

const receptorImages = {};
DIRECTIONS.forEach(direction => {
  receptorImages[direction] = new Image();
  receptorImages[direction].src = getAssetPath(`${direction}_tap_receptor.png`);
  receptorImages[direction] = new Image();
  receptorImages[direction].src = getAssetPath(`${direction}_tap_receptor.png`);
});

class StepZone {
  constructor() {
    this.beatTick = 0;
  }

  update() {}

  render(canvas) {
    const c = canvas.getContext("2d");

    // if (this.beatTick) {
    //   console.log(this.beatTick);
    // }
    // flash starts at the beginning of the quarter beat and lasts for 1/16 beat

    const isFlash = this.beatTick % 1 >= 0 && this.beatTick % 1 < 0.25;

    DIRECTIONS.forEach((direction, i) => {
      c.drawImage(
        isFlash ? flashImages[direction] : receptorImages[direction],
        0,
        0,
        ARROW_WIDTH,
        ARROW_HEIGHT,
        i * ARROW_WIDTH,
        0,
        ARROW_WIDTH,
        ARROW_HEIGHT
      );
    });
  }
}

export default StepZone;
