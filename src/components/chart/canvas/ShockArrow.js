import { DIRECTIONS, ARROW_WIDTH, ARROW_HEIGHT } from "../../../constants";
import { getAssetPath } from "../../../utils";

const arrowImages = {};
DIRECTIONS.forEach(direction => {
  arrowImages[`shock_${direction}`] = new Image();
  arrowImages[`shock_${direction}`].src = getAssetPath(
    `shock_${direction}.png`
  );
});

class ShockArrow {
  constructor(attrs) {
    const { key, mods } = attrs;
    const { speed, noteskin } = mods;

    this.key = key;
    this.speed = speed;
    this.note = attrs.note;
    this.noteskin = noteskin;

    // this.currentBeatPosition = attrs.currentBeatPosition;
    this.originalBeatPosition = attrs.originalBeatPosition;
  }

  currentBeatPosition(beatTick) {
    return this.originalBeatPosition - beatTick;
  }

  render(canvas, frame, beatTick) {
    const c = canvas.getContext("2d");

    const topBoundary = -ARROW_HEIGHT; // used to simulate the arrows being hit and disappearing
    const bottomBoundary = canvas.height;
    frame = Math.floor(frame / 3) % 8; // each sprite frame lasts 3 canvas animation frames

    for (let i = 0; i < this.note.length; i++) {
      const direction = DIRECTIONS[i];
      const arrowImg = arrowImages[`shock_${direction}`];
      const frameX = (frame % 4) * ARROW_WIDTH;
      const frameY = Math.floor(frame / 4) * ARROW_HEIGHT;
      const destX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
      const destY =
        this.currentBeatPosition(beatTick) * ARROW_HEIGHT * this.speed;

      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          ARROW_WIDTH,
          ARROW_HEIGHT,
          destX,
          destY,
          ARROW_WIDTH,
          ARROW_HEIGHT
        );
      }
    }
  }
}

export default ShockArrow;