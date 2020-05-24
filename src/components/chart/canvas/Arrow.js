import {
  DIRECTIONS,
  ARROW_WIDTH,
  ARROW_HEIGHT,
  FREEZE_BODY_HEIGHT,
} from "../../../constants";
import { getAssetPath } from "../../../utils";
import { getReverseCoord } from "../../../utils/engineUtils";

const arrowImages = {};
DIRECTIONS.forEach((direction) => {
  arrowImages[`rainbow_${direction}`] = new Image();
  arrowImages[`rainbow_${direction}`].src = getAssetPath(
    `rainbow_${direction}.png`
  );
  arrowImages[`note_${direction}`] = new Image();
  arrowImages[`note_${direction}`].src = getAssetPath(`note_${direction}.png`);
  arrowImages[`vivid_${direction}`] = new Image();
  arrowImages[`vivid_${direction}`].src = getAssetPath(
    `vivid_${direction}.png`
  );
  arrowImages[`flat_${direction}`] = new Image();
  arrowImages[`flat_${direction}`].src = getAssetPath(`vivid_${direction}.png`);

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

const miscImages = ["freeze_head", "tap_explosion"];
miscImages.forEach((imageName) => {
  arrowImages[imageName] = new Image();
  arrowImages[imageName].src = getAssetPath(`${imageName}.png`);
});

class Arrow {
  constructor(attrs) {
    const { key } = attrs;

    this.key = key; // arrow index
    this.note = attrs.note;
    this.measureIdx = attrs.measureIdx;
    this.measureN = attrs.measureN;
    this.measureD = attrs.measureD;

    this.originalBeatPosition = attrs.originalBeatPosition;
    this.holdBeats = attrs.holdBeats || null;
  }

  currentBeatPosition(beatTick) {
    return this.originalBeatPosition - beatTick;
  }

  renderFreezeBody(canvas, beatTick, directionIdx, attrs) {
    const c = canvas.getContext("2d");

    const { mods } = attrs;
    const { speed, scroll, appearance } = mods;

    const topBoundary = 0;
    const bottomBoundary = canvas.height;

    let arrowImg;
    let frameX, frameY, destX, destY;
    const direction = DIRECTIONS[directionIdx % 4];

    // freeze body and tail
    if (this.note[directionIdx] === "3") {
      arrowImg = arrowImages[`freeze_tail_inactive_${direction}`];
      frameX = 0;
      frameY = 0;

      destX = directionIdx * ARROW_WIDTH;
      destY = this.currentBeatPosition(beatTick) * ARROW_HEIGHT * speed;

      // Bottom of freeze body must be the bottom of the body image (yellow part of gradient)
      // and line up with the top of the freeze tail.
      // Extend the freeze body upwards using as many repetitions of the 128px height image as needed.
      // Top of freeze body is cut off at the midpoint of the freeze head.
      let arrowBodyImg = arrowImages[`freeze_body_inactive_${direction}`];
      const totalBodyHeight =
        this.holdBeats[directionIdx] * ARROW_HEIGHT * speed - ARROW_HEIGHT / 2;
      const repetitions = Math.floor(totalBodyHeight / FREEZE_BODY_HEIGHT);
      let partialHeight = totalBodyHeight % FREEZE_BODY_HEIGHT;
      const originalPartialHeight = partialHeight;

      let partialDestY = destY - (totalBodyHeight + ARROW_HEIGHT / 2);
      let freezeBeingHeld = false;

      // shrink in size once it reaches the target
      // this is also where the freeze starts to be held down
      if (partialDestY <= 0) {
        partialHeight += partialDestY;
        partialDestY = 0;
        arrowImg = arrowImages[`freeze_tail_active_${direction}`];
        arrowBodyImg = arrowImages[`freeze_body_active_${direction}`];

        if (destY >= 0) {
          freezeBeingHeld = true;
        }
      }

      // draw partial
      if (
        partialDestY > -partialHeight &&
        partialDestY < bottomBoundary &&
        appearance !== "stealth"
      ) {
        c.drawImage(
          arrowBodyImg,
          0,
          FREEZE_BODY_HEIGHT - partialHeight,
          ARROW_WIDTH,
          partialHeight,
          destX,
          scroll === "reverse"
            ? getReverseCoord(
                partialDestY + ARROW_HEIGHT / 2,
                partialHeight,
                canvas
              )
            : partialDestY + ARROW_HEIGHT / 2,
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
        if (
          bodyDestY > -bodyHeight &&
          bodyDestY < bottomBoundary &&
          appearance !== "stealth"
        ) {
          c.drawImage(
            arrowBodyImg,
            0,
            bodyFrameY,
            ARROW_WIDTH,
            bodyHeight,
            destX,
            scroll === "reverse"
              ? getReverseCoord(
                  bodyDestY + ARROW_HEIGHT / 2,
                  bodyHeight,
                  canvas
                )
              : bodyDestY + ARROW_HEIGHT / 2,
            ARROW_WIDTH,
            bodyHeight
          );
        }
      }

      let tailHeight = ARROW_HEIGHT;

      // if the freeze is shorter than the height of the tail sprite,
      // cut off the top of the sprite such that it starts at the midpoint of the freeze head

      // Because we need to overwrite destY for proper sprite placement in the event that the
      // top of the sprite needs to be cut off, store the actual Y position of the arrow
      // in a separate variable
      let actualDestY = destY;

      if (
        this.holdBeats[directionIdx] * ARROW_HEIGHT * speed <
        ARROW_HEIGHT / 2
      ) {
        const tailPartialHeight =
          this.holdBeats[directionIdx] * ARROW_HEIGHT * speed; // distance between head note and tail note
        frameY += ARROW_HEIGHT / 2 - tailPartialHeight;
        destY += ARROW_HEIGHT / 2 - tailPartialHeight;
        tailHeight = tailPartialHeight + ARROW_HEIGHT / 2;
      }

      // shrink in size once it reaches the target
      if (destY < ARROW_HEIGHT / 2 && destY > topBoundary) {
        frameY += ARROW_HEIGHT / 2 - destY;
        destY = ARROW_HEIGHT / 2;
      }

      if (
        actualDestY > topBoundary &&
        actualDestY < bottomBoundary &&
        appearance !== "stealth"
      ) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          ARROW_WIDTH,
          tailHeight,
          destX,
          scroll === "reverse"
            ? getReverseCoord(destY, tailHeight, canvas)
            : destY,
          ARROW_WIDTH,
          tailHeight
        );
      }

      // render head of held freeze arrow on top of the arrow body
      if (freezeBeingHeld) {
        const arrowHeadImg = arrowImages.freeze_head;
        c.drawImage(
          arrowHeadImg,
          DIRECTIONS.indexOf(direction) * ARROW_WIDTH,
          ARROW_HEIGHT * 2,
          ARROW_WIDTH,
          ARROW_HEIGHT,
          directionIdx * ARROW_WIDTH,
          scroll === "reverse" ? getReverseCoord(0, ARROW_HEIGHT, canvas) : 0,
          ARROW_WIDTH,
          ARROW_HEIGHT
        );
      }
    }
  }

  renderArrow(canvas, beatTick, directionIdx, attrs) {
    const c = canvas.getContext("2d");

    const { mods } = attrs;
    const { speed, noteskin, colorFreezes, scroll, appearance } = mods;

    const topBoundary = 0; // used to simulate the arrows being hit and disappearing
    const bottomBoundary = canvas.height; // can be adjusted with SUDDEN+

    // nothing
    if (this.note[directionIdx] === "0") return;

    // stealth
    if (appearance === "stealth") return;

    let arrowImg;
    let frameX, frameY, destX, destY;
    const direction = DIRECTIONS[directionIdx % 4];

    // regular note
    if (
      this.note[directionIdx] === "1" ||
      (this.note[directionIdx] === "2" && colorFreezes)
    ) {
      // console.log("arrow", directionIdx);
      arrowImg = arrowImages[`${noteskin}_${direction}`];

      // color as freeze head if it is hit simultaneously with a freeze arrow
      if (this.note.includes("2") && !colorFreezes) {
        arrowImg = arrowImages.freeze_head;
        frameX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
        frameY = 0;
      } else {
        if (noteskin === "rainbow") {
          frameX = (Math.floor(beatTick * 4) % 8) * ARROW_WIDTH;

          const beatD = this.measureD / 4;
          const beatN = this.measureN % beatD;
          if (beatN === 0) {
            frameY = 0;
          } else if (0 < beatN && beatN <= beatD / 4) {
            frameY = 1;
          } else if (beatD / 4 < beatN && beatN <= beatD / 2) {
            frameY = 2;
          } else if (beatD / 2 < beatN && beatN <= (3 * beatD) / 4) {
            frameY = 3;
          } else if ((3 * beatD) / 4 < beatN && beatN < beatD) {
            frameY = 0;
          }
          frameY *= ARROW_HEIGHT;
        } else if (noteskin === "note") {
          frameX = (Math.floor(beatTick * 4) % 8) * ARROW_WIDTH;

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
          frameY *= ARROW_HEIGHT;
        } else if (noteskin === "vivid") {
          frameX = (Math.floor(beatTick * 4) % 4) * ARROW_WIDTH;

          const beatD = this.measureD / 4;
          const beatN = this.measureN % beatD;
          const noteOffset = Math.floor(beatTick) % 4;

          if (beatN === 0) {
            frameY = 0;
          } else if (0 < beatN && beatN <= beatD / 4) {
            frameY = 1;
          } else if (beatD / 4 < beatN && beatN <= beatD / 2) {
            frameY = 2;
          } else if (beatD / 2 < beatN && beatN <= (3 * beatD) / 4) {
            frameY = 3;
          } else if ((3 * beatD) / 4 < beatN && beatN < beatD) {
            frameY = 0;
          }
          frameY = ((frameY + noteOffset) % 4) * ARROW_HEIGHT;
        } else if (noteskin === "flat") {
          arrowImg = arrowImages[`vivid_${direction}`];

          frameX = (Math.floor(beatTick * 4) % 4) * ARROW_WIDTH;
          frameY = (Math.floor(beatTick) % 4) * ARROW_HEIGHT;
        }
      }

      destX = directionIdx * ARROW_WIDTH;
      destY = this.currentBeatPosition(beatTick) * ARROW_HEIGHT * speed;
      destY = (destY + 0.5) | 0;

      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          ARROW_WIDTH,
          ARROW_HEIGHT,
          destX,
          scroll === "reverse"
            ? getReverseCoord(destY, ARROW_HEIGHT, canvas)
            : destY,
          ARROW_WIDTH,
          ARROW_HEIGHT
        );
        // console.log(destY);
      }
    }

    // freeze note
    else if (this.note[directionIdx] === "2") {
      arrowImg = arrowImages.freeze_head;
      frameX = DIRECTIONS.indexOf(direction) * ARROW_WIDTH;
      frameY = 0;

      destX = directionIdx * ARROW_WIDTH;
      destY = this.currentBeatPosition(beatTick) * ARROW_HEIGHT * speed;
      destY = (destY + 0.5) | 0;

      // draw freeze head
      if (destY > topBoundary && destY < bottomBoundary) {
        c.drawImage(
          arrowImg,
          frameX,
          frameY,
          ARROW_WIDTH,
          ARROW_HEIGHT,
          destX,
          scroll === "reverse"
            ? getReverseCoord(destY, ARROW_HEIGHT, canvas)
            : destY,
          ARROW_WIDTH,
          ARROW_HEIGHT
        );
        // console.log(destY);
      }
    }
  }
}

export default Arrow;
