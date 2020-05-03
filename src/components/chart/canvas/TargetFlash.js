import {
  DIRECTIONS,
  ARROW_WIDTH,
  ARROW_HEIGHT,
  MARVELOUS_FLASH_FRAMES,
} from "../../../constants";
import { getAssetPath } from "../../../utils";

const image = new Image();
image.src = getAssetPath("tap_explosion.png");

class TargetFlash {
  constructor(arrow) {
    this.frame = -1;

    this.directions = [];
    arrow.note.forEach((note, directionIdx) => {
      if (note === "1" || note === "2" || note === "3") {
        this.directions.push(directionIdx);
      }
    });
  }

  render(canvas) {
    const c = canvas.getContext("2d");
    this.directions.forEach((directionIdx) => {
      if (this.frame < 0 || this.frame >= MARVELOUS_FLASH_FRAMES) return;
      const destX = directionIdx * ARROW_WIDTH;

      c.save();
      c.globalAlpha = 1 - Math.pow(this.frame / MARVELOUS_FLASH_FRAMES, 3);
      c.drawImage(
        image,
        0,
        0,
        ARROW_WIDTH,
        ARROW_HEIGHT,
        destX - this.frame,
        0 - this.frame,
        ARROW_WIDTH + this.frame * 2,
        ARROW_HEIGHT + this.frame * 2
      );
      c.restore();
    });
  }
}

export default TargetFlash;
