import { DIRECTIONS, STATIC_ARROW_WIDTH, STATIC_ARROW_HEIGHT, STATIC_FREEZE_BODY_HEIGHT } from "../../../constants";

import { getAssetPath, noop } from "../../../utils";

const arrowImg = new Image();
arrowImg.src = getAssetPath("static_arrows.png");

const freezeTailImg = new Image();
freezeTailImg.src = getAssetPath("static_freeze_tails_1.png");
const freezeBodyImg = new Image();
freezeBodyImg.src = getAssetPath("static_freeze_body_1.png");

const TOP_PADDING = STATIC_ARROW_HEIGHT / 2;
const LEFT_PADDING = STATIC_ARROW_WIDTH * 2;
const COLUMN_WIDTH = STATIC_ARROW_WIDTH * 4;
const COLUMN_SPACING = STATIC_ARROW_WIDTH * 4;

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

    const { mods, columnIdx, columnHeight, measuresPerColumn } = attrs;
    const { speed } = mods;

    const topBoundary = -1;

    const beatsPerColumn = measuresPerColumn * 4;
    // noop(beatsPerColumn);

    if (this.note[directionIdx] !== "3") return;

    let frameX, frameY, destX, destY;

    const arrowWidth = STATIC_ARROW_WIDTH;
    const arrowHeight = STATIC_ARROW_HEIGHT;
    const freezeBodyHeight = STATIC_FREEZE_BODY_HEIGHT;

    frameX = (directionIdx % 4) * arrowWidth;
    frameY = 0;

    destX = directionIdx * arrowWidth;
    // calculate column offset
    destX += columnIdx * (arrowWidth * 4 * 2) + LEFT_PADDING;

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

    // draw partial
    // make sure it is rendered in the same column as the corresponding freeze *head*
    // (not necessarily the same column as the tail)
    const holdStartBeat = this.holdStartBeats[directionIdx];
    const partialColumnIdx = Math.floor(holdStartBeat / 4 / measuresPerColumn);
    const partialDestX = directionIdx * arrowWidth + partialColumnIdx * (COLUMN_WIDTH + COLUMN_SPACING) + LEFT_PADDING;

    noop(partialDestX);

    c.drawImage(
      freezeBodyImg,
      0,
      freezeBodyHeight - partialHeight,
      arrowWidth,
      partialHeight,
      partialDestX,
      (partialDestY + arrowHeight / 2) % columnHeight,
      arrowWidth,
      partialHeight
    );

    // freeze body may span more than one column, so make sure each repetition
    // is offset by the correct amount and rendered in the correct column

    // draw repetitions of freeze body
    for (let i = 0; i < repetitions; i++) {
      let bodyHeight = freezeBodyHeight;
      let bodyFrameY = 0;

      // bodyDestY: topDestY of freeze body assuming no wraparound
      let bodyDestY = destY - (totalBodyHeight + arrowHeight / 2 - originalPartialHeight - freezeBodyHeight * i);
      if (bodyDestY < 0 && bodyDestY > -freezeBodyHeight) {
        bodyHeight += bodyDestY;
        bodyFrameY -= bodyDestY;
        bodyDestY = 0;
      }
      const bodyColumnIdx = Math.floor(bodyDestY / columnHeight);
      const bodyDestX = directionIdx * arrowWidth + bodyColumnIdx * (COLUMN_WIDTH + COLUMN_SPACING) + LEFT_PADDING;

      // if the freeze head and tail are on different columns, the freeze body must wrap around
      if (partialColumnIdx < columnIdx) {
        const bodyTopDestY = bodyDestY;
        const bodyBottomDestY = bodyDestY + freezeBodyHeight;
        const bodyBottomColumnIdx = Math.floor(bodyBottomDestY / columnHeight);
        const bodyTopDestX = bodyDestX;
        const bodyBottomDestX =
          directionIdx * arrowWidth + bodyBottomColumnIdx * (COLUMN_WIDTH + COLUMN_SPACING) + LEFT_PADDING;

        // if freeze body does not wrap, draw as normal
        if (bodyTopDestX === bodyBottomDestX) {
          c.drawImage(
            freezeBodyImg,
            0,
            0,
            arrowWidth,
            bodyHeight,
            bodyTopDestX,
            (bodyTopDestY % columnHeight) + arrowHeight / 2,
            arrowWidth,
            bodyHeight
          );
        }

        // if freeze body wraps around a column
        else if (bodyTopDestX < bodyBottomDestX) {
          // draw one copy of wrapping freeze body at top edge of bottomIdx column
          c.drawImage(
            freezeBodyImg,
            0,
            0,
            arrowWidth,
            bodyHeight,
            bodyBottomDestX,
            (bodyBottomDestY % columnHeight) - freezeBodyHeight + arrowHeight / 2,
            arrowWidth,
            bodyHeight
          );

          // draw another copy of wrapping freeze body at bottom edge of topIdx column
          c.drawImage(
            freezeBodyImg,
            0,
            bodyFrameY,
            arrowWidth,
            bodyHeight,
            bodyTopDestX,
            (bodyTopDestY % columnHeight) + arrowHeight / 2,
            arrowWidth,
            bodyHeight
          );
        }
      } else {
        // normal freeze body that spans a single column
        c.drawImage(
          freezeBodyImg,
          0,
          0,
          arrowWidth,
          bodyHeight,
          bodyDestX,
          (bodyDestY % columnHeight) + arrowHeight / 2,
          arrowWidth,
          bodyHeight
        );
      }
    }

    // if the freeze is short enough that there are no repetitions of the freeze body,
    // check the remaining edge case where the partial and the tail are on different columns
    if (repetitions === 0 && partialColumnIdx < columnIdx) {
      const bodyTopDestY = (holdStartBeat % beatsPerColumn) * arrowHeight * speed + TOP_PADDING;

      // draw one copy of wrapping freeze body at the bottom edge of the partial column
      c.drawImage(
        freezeBodyImg,
        0,
        0,
        arrowWidth,
        freezeBodyHeight,
        partialDestX,
        bodyTopDestY + partialHeight,
        arrowWidth,
        freezeBodyHeight
      );
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

    noop(tailHeight, frameX, frameY, destX);

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
    destX += columnIdx * (COLUMN_WIDTH + COLUMN_SPACING) + LEFT_PADDING;

    destY = this.currentBeatPosition(beatTick) * arrowHeight * speed;
    // calculate row wraparound
    destY = destY % columnHeight;

    c.drawImage(arrowImg, frameX, frameY, arrowWidth, arrowHeight, destX, destY, arrowWidth, arrowHeight);
  }
}

export default StaticArrow;
