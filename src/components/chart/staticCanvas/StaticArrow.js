import { DIRECTIONS, STATIC_ARROW_WIDTH, STATIC_ARROW_HEIGHT, STATIC_FREEZE_BODY_HEIGHT } from "../../../constants";

import { getAssetPath } from "../../../utils";

const arrowImg = new Image();
arrowImg.src = getAssetPath("static_arrows.png");

const freezeTailImg = new Image();
freezeTailImg.src = getAssetPath("static_freeze_tails_1.png");
const freezeBodyImg = new Image();
freezeBodyImg.src = getAssetPath("static_freeze_body_1.png");

class StaticArrow {
  constructor(arrow) {
    this.key = arrow.key; // arrow index
    this.note = arrow.note;
    this.measureIdx = arrow.measureIdx;
    this.measureN = arrow.measureN;
    this.measureD = arrow.measureD;
    this.beatstamp = arrow.beatstamp;
    this.holdStartBeats = arrow.holdStartBeats;
    this.holdEndBeats = arrow.holdEndBeats;
    this.combo = arrow.combo;
  }

  currentBeatPosition(beatTick) {
    return this.beatstamp - beatTick;
  }

  renderFreezeBody(canvas, { beatTick }, directionIdx, attrs) {
    const c = canvas.getContext("2d");

    const { mods, columnIdx, columnHeight } = attrs;
    const { speed } = mods;

    const topBoundary = -1;

    if (this.note[directionIdx] !== "3") return;

    let frameX, frameY, destX, destY;

    const arrowWidth = STATIC_ARROW_WIDTH;
    const arrowHeight = STATIC_ARROW_HEIGHT;
    const freezeBodyHeight = STATIC_FREEZE_BODY_HEIGHT;

    frameX = (directionIdx % 4) * arrowWidth;
    frameY = 0;

    destX = directionIdx * arrowWidth;
    // calculate column offset
    destX += columnIdx * (arrowWidth * 4 * 2) + arrowWidth * 2;

    destY = this.currentBeatPosition(beatTick) * arrowHeight * speed;

    const totalBodyHeight =
      (this.holdEndBeats[directionIdx] - this.holdStartBeats[directionIdx]) * arrowHeight * speed - arrowHeight / 2;

    const repetitions = Math.floor(totalBodyHeight / freezeBodyHeight);
    let partialHeight = totalBodyHeight % freezeBodyHeight;
    const originalPartialHeight = partialHeight;

    let partialDestY = destY - (totalBodyHeight + arrowHeight / 2);

    // shrink in size once it reaches the top
    if (partialDestY <= 0) {
      partialHeight += partialDestY;
      partialDestY = 0;
    }

    // // calculate column offset
    // destX += columnIdx * (arrowWidth * 4 * 2) + arrowWidth * 2;

    // draw partial
    // if (partialDestY > -partialHeight && partialDestY < bottomBoundary) {
    c.drawImage(
      freezeBodyImg,
      0,
      freezeBodyHeight - partialHeight,
      arrowWidth,
      partialHeight,
      destX,
      // partialDestY + arrowHeight / 2,
      (partialDestY + arrowHeight / 2) % columnHeight,
      arrowWidth,
      partialHeight
    );
    // }

    // draw repetitions of freeze body
    for (let i = 1; i <= repetitions; i++) {
      let bodyHeight = freezeBodyHeight;
      let bodyFrameY = 0;
      let bodyDestY = destY - (totalBodyHeight + arrowHeight / 2 - originalPartialHeight - freezeBodyHeight * (i - 1));
      if (bodyDestY < 0 && bodyDestY > -freezeBodyHeight) {
        bodyHeight += bodyDestY;
        bodyFrameY -= bodyDestY;
        bodyDestY = 0;
      }
      // if (bodyDestY > -bodyHeight && bodyDestY < bottomBoundary) {
      c.drawImage(
        freezeBodyImg,
        0,
        bodyFrameY,
        arrowWidth,
        bodyHeight,
        destX,
        // bodyDestY + arrowHeight / 2,
        (bodyDestY + arrowHeight / 2) % columnHeight,
        arrowWidth,
        bodyHeight
      );
      // }
    }

    let tailHeight = arrowHeight;

    const bodyDistance = (this.holdEndBeats[directionIdx] - this.holdStartBeats[directionIdx]) * arrowHeight * speed;

    if (bodyDistance < arrowHeight / 2) {
      const tailPartialHeight = bodyDistance; // distance between head note and tail note, less than half arrow height
      frameY += arrowHeight / 2 - tailPartialHeight;
      destY += arrowHeight / 2 - tailPartialHeight;
      tailHeight = tailPartialHeight + arrowHeight / 2;
    }

    // shrink in size once it reaches the top
    if (destY < arrowHeight / 2 && destY > topBoundary) {
      frameY += arrowHeight / 2 - destY;
      destY = arrowHeight / 2;
    }

    c.drawImage(
      freezeTailImg,
      frameX,
      frameY,
      arrowWidth,
      tailHeight,
      destX,
      destY % columnHeight,
      arrowWidth,
      tailHeight
    );
  }

  renderArrow(canvas, { beatTick }, directionIdx, attrs) {
    const c = canvas.getContext("2d");

    const { mods, columnIdx, columnHeight } = attrs;
    const { speed } = mods;

    if (this.note[directionIdx] !== "1" && this.note[directionIdx] !== "2") return;

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
    } else if ([1 / 16, 3 / 16, 5 / 16, 7 / 16, 9 / 16, 11 / 16, 13 / 16, 15 / 16].includes(measureFraction)) {
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

    // if (destY > topBoundary && destY < bottomBoundary) {
    c.drawImage(arrowImg, frameX, frameY, arrowWidth, arrowHeight, destX, destY, arrowWidth, arrowHeight);
    // }
  }
}

export default StaticArrow;
