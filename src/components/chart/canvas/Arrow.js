import {
  DIRECTIONS,
  ARROW_WIDTH,
  ARROW_HEIGHT,
  FREEZE_BODY_HEIGHT,
} from "../../../constants";
import { getAssetPath } from "../../../utils";

const arrowImages = {};
DIRECTIONS.forEach(direction => {
  arrowImages[`note_${direction}`] = new Image();
  arrowImages[`note_${direction}`].src = getAssetPath(`note_${direction}.png`);
  arrowImages[`vivid_${direction}`] = new Image();
  arrowImages[`vivid_${direction}`].src = getAssetPath(
    `vivid_${direction}.png`
  );

  arrowImages[`freeze_tail_active_${direction}`] = new Image();
  arrowImages[`freeze_tail_active_${direction}`].src = getAssetPath(
    `freeze_tail_active_${direction}.png`
  );
  arrowImages[`freeze_tail_inactive_${direction}`] = new Image();
  arrowImages[`freeze_tail_inactive_${direction}`].src = getAssetPath(
    `freeze_tail_inactive_${direction}.png`
  );

  arrowImages[`freeze_body_active_${direction}`] = new Image();
  arrowImages[`freeze_body_active_${direction}`].src = getAssetPath(
    `freeze_body_active_${direction}.png`
  );
  arrowImages[`freeze_body_inactive_${direction}`] = new Image();
  arrowImages[`freeze_body_inactive_${direction}`].src = getAssetPath(
    `freeze_body_inactive_${direction}.png`
  );

  arrowImages[`shock_${direction}`] = new Image();
  arrowImages[`shock_${direction}`].src = getAssetPath(
    `shock_${direction}.png`
  );
});

arrowImages.freeze_head = new Image();
arrowImages.freeze_head.src = getAssetPath("freeze_head.png");

class Arrow {
  constructor(attrs) {
    const { key, mods } = attrs;
    const { speed, turn, noteskin } = mods;

    this.key = key; // arrow index
    this.speed = speed;
    this.turn = turn;
    this.note = attrs.note;
    this.noteskin = noteskin;
    this.measureIdx = attrs.measureIdx;
    this.measureN = attrs.measureN;
    this.measureD = attrs.measureD;
    this.currentBeatPosition = attrs.currentBeatPosition;
    this.holdBeats = attrs.holdBeats || null;
  }

  render(canvas) {
    const c = canvas.getContext("2d");

    const topBoundary = 0; // used to simulate the arrows being hit and disappearing
    const bottomBoundary = canvas.height; // can be adjusted with SUDDEN+

    for (let i = 0; i < this.note.length; i++) {
      // nothing
      if (this.note[i] === "0") continue;

      let arrowImg;
      let frameX, frameY, destX, destY;
      const direction = DIRECTIONS[i];

      // regular note
      if (this.note[i] === "1") {
        arrowImg = arrowImages[`${this.noteskin}_${direction}`];

        // color as freeze head if it is hit simultaneously with a freeze arrow
        if (this.note.includes("2")) {
          arrowImg = arrowImages.freeze_head;
          frameX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
          frameY = 0;
        } else {
          if (this.noteskin === "note") {
            // frameX = frameIndex * ARROW_WIDTH;
            frameX = 0;

            /* 
              NOTE: In the future, if we want to support color codes for 12ths, 24ths, etc.
              We need to use more precise math to avoid rounding errors.
              Planned approach: Reduce the measure fraction by dividing both numerator and denominator
              by their greatest common factor.
              If GCF == 1, 2, or 4, use 4th note quantization.
              Otherwise, the resulting denominator is used for the quantization (3 and 6 may be treated as 12ths)
            */

            const measureFraction = this.measureN / this.measureD;
            if ([0, 1 / 4, 2 / 4, 3 / 4].includes(measureFraction)) {
              frameY = 0;
            } else if ([1 / 8, 3 / 8, 5 / 8, 7 / 8].includes(measureFraction)) {
              frameY = ARROW_HEIGHT;
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
              frameY = ARROW_HEIGHT * 3;
            } else {
              frameY = ARROW_HEIGHT * 2;
            }
          } else if (this.noteskin === "vivid") {
            // frameX = (frameIndex % 4) * ARROW_WIDTH;
            frameX = 0;
            frameY = 0;
          }
        }

        destX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        destY = this.currentBeatPosition * ARROW_HEIGHT * this.speed;

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

      // freeze note
      else if (this.note[i] === "2") {
        arrowImg = arrowImages.freeze_head;
        frameX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        frameY = 0;

        destX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        destY = this.currentBeatPosition * ARROW_HEIGHT * this.speed;

        // draw freeze head
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

      // freeze body and tail
      else if (this.note[i] === "3") {
        arrowImg = arrowImages[`freeze_tail_inactive_${direction}`];
        frameX = 0;
        frameY = 0;

        destX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        destY = this.currentBeatPosition * ARROW_HEIGHT * this.speed;

        // Bottom of freeze body must be the bottom of the body image (yellow part of gradient)
        // and line up with the top of the freeze tail.
        // Extend the freeze body upwards using as many repetitions of the 128px height image as needed.
        // Top of freeze body is cut off at the midpoint of the freeze head.
        const arrowBodyImg = arrowImages[`freeze_body_inactive_${direction}`];
        const totalBodyHeight =
          this.holdBeats[i] * ARROW_HEIGHT * this.speed - ARROW_HEIGHT / 2;
        const repetitions = Math.floor(totalBodyHeight / FREEZE_BODY_HEIGHT);
        let partialHeight = totalBodyHeight % FREEZE_BODY_HEIGHT;
        const originalPartialHeight = partialHeight;

        let partialDestY = destY - (totalBodyHeight + ARROW_HEIGHT / 2);

        // shrink in size once it reaches the target
        if (partialDestY < 0) {
          partialHeight += partialDestY;
          partialDestY = 0;
        }

        // draw partial
        if (partialDestY > -partialHeight && partialDestY < bottomBoundary) {
          c.drawImage(
            arrowBodyImg,
            0,
            FREEZE_BODY_HEIGHT - partialHeight,
            ARROW_WIDTH,
            partialHeight,
            destX,
            partialDestY + ARROW_HEIGHT / 2,
            ARROW_WIDTH,
            partialHeight
          );
        }

        // draw repetitions of freeze body
        for (let i = 1; i <= repetitions; i++) {
          let bodyHeight = FREEZE_BODY_HEIGHT;
          let bodyFrameY = 0;
          let bodyDestY =
            destY -
            (totalBodyHeight +
              ARROW_HEIGHT / 2 -
              originalPartialHeight -
              FREEZE_BODY_HEIGHT * (i - 1));

          if (bodyDestY < 0 && bodyDestY > -FREEZE_BODY_HEIGHT) {
            bodyHeight += bodyDestY;
            bodyFrameY -= bodyDestY;
            bodyDestY = 0;
          }

          if (bodyDestY > -bodyHeight && bodyDestY < bottomBoundary) {
            c.drawImage(
              arrowBodyImg,
              0,
              bodyFrameY,
              ARROW_WIDTH,
              bodyHeight,
              destX,
              bodyDestY + ARROW_HEIGHT / 2,
              ARROW_WIDTH,
              bodyHeight
            );
          }
        }

        let tailHeight = ARROW_HEIGHT;

        // if the freeze is shorter than the height of the tail sprite,
        // cut off the top of the sprite such that it starts at the midpoint of the freeze head
        if (this.holdBeats[i] * ARROW_HEIGHT * this.speed < ARROW_HEIGHT / 2) {
          const tailPartialHeight =
            this.holdBeats[i] * ARROW_HEIGHT * this.speed;
          frameY += ARROW_HEIGHT / 2 - tailPartialHeight;
          destY += ARROW_HEIGHT / 2 - tailPartialHeight;
          tailHeight = ARROW_HEIGHT - tailPartialHeight;
        }

        // shrink in size once it reaches the target
        if (destY < ARROW_HEIGHT / 2 && destY > topBoundary) {
          frameY += ARROW_HEIGHT / 2 - destY;
          destY = ARROW_HEIGHT / 2;
        }

        if (destY > topBoundary && destY < bottomBoundary) {
          c.drawImage(
            arrowImg,
            frameX,
            frameY,
            ARROW_WIDTH,
            tailHeight,
            destX,
            destY,
            ARROW_WIDTH,
            tailHeight
          );
        }
      }

      // shock
      else if (this.note[i] === "M") {
        arrowImg = arrowImages[`shock_${direction}`];
        frameX = 0;
        frameY = 0;
        destX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        destY = this.currentBeatPosition * ARROW_HEIGHT * this.speed;

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
}

export default Arrow;
