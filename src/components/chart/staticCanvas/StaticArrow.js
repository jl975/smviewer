import {
  DIRECTIONS,
  STATIC_ARROW_WIDTH,
  STATIC_ARROW_HEIGHT,
  FREEZE_BODY_HEIGHT,
} from "../../../constants";

import { getAssetPath } from "../../../utils";

const arrowImg = new Image();
// arrowImg.src = getAssetPath("fat_arrows.png");
arrowImg.src = getAssetPath("skinny_arrows.png");

class StaticArrow {
  constructor(arrow) {
    this.key = arrow.key; // arrow index
    this.note = arrow.note;
    this.measureIdx = arrow.measureIdx;
    this.measureN = arrow.measureN;
    this.measureD = arrow.measureD;
    this.beatstamp = arrow.beatstamp;
    this.combo = arrow.combo;
  }

  currentBeatPosition(beatTick) {
    return this.beatstamp - beatTick;
  }

  renderArrow(canvas, { beatTick }, directionIdx, attrs) {
    const c = canvas.getContext("2d");
    console.log("canvas", canvas);
    console.log("c", c);

    const { mods, columnIdx, columnHeight } = attrs;
    const { speed } = mods;

    const topBoundary = -1;
    const bottomBoundary = canvas.height;

    // nothing
    if (this.note[directionIdx] !== "1" && this.note[directionIdx] !== "2")
      return;

    let frameX, frameY, destX, destY;
    const direction = DIRECTIONS[directionIdx % 4];
    const arrowWidth = STATIC_ARROW_WIDTH;
    const arrowHeight = STATIC_ARROW_HEIGHT;

    frameX = DIRECTIONS.indexOf(direction) * arrowWidth;

    // only support Note colors for now
    const measureFraction = this.measureN / this.measureD;
    if ([0, 1 / 4, 2 / 4, 3 / 4].includes(measureFraction)) {
      frameY = 0;
    } else if ([1 / 8, 3 / 8, 5 / 8, 7 / 8].includes(measureFraction)) {
      frameY = 1;
    } else if (
      [
        1 / 16,
        3 / 16,
        5 / 16,
        7 / 16,
        9 / 16,
        11 / 16,
        13 / 16,
        15 / 16,
      ].includes(measureFraction)
    ) {
      frameY = 3;
    } else {
      frameY = 2;
    }
    frameY *= arrowHeight;

    destX = directionIdx * arrowWidth;
    // calculate column offset
    destX += columnIdx * (arrowWidth * 4 * 2) + arrowWidth * 2;

    destY = this.currentBeatPosition(beatTick) * arrowHeight * speed;
    // calculate row wraparound
    destY = destY % columnHeight;

    if (destY > topBoundary && destY < bottomBoundary) {
      c.drawImage(
        arrowImg,
        frameX,
        frameY,
        arrowWidth,
        arrowHeight,
        destX,
        destY,
        arrowWidth,
        arrowHeight
      );
      // console.log(destY);
    }
  }
}

export default StaticArrow;
