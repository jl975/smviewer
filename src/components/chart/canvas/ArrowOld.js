import { DIRECTIONS, ARROW_WIDTH, ARROW_HEIGHT } from "../../../constants";

const arrowImages = {};
DIRECTIONS.forEach(direction => {
  arrowImages[`note_${direction}`] = new Image();
  arrowImages[`note_${direction}`].src = `assets/note_${direction}.png`;
  arrowImages[`vivid_${direction}`] = new Image();
  arrowImages[`vivid_${direction}`].src = `assets/vivid_${direction}.png`;
});

class Arrow {
  constructor(attrs) {
    const { canvas, direction, quantization, noteskin, scrollY } = attrs;
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.direction = direction;
    this.quantization = quantization;
    this.noteskin = noteskin;

    this.scrollY = scrollY; // number of pixels from bottom of screen

    this._frameCount = 0; // number of times the animation frame has changed
    this._tickCount = 0; // number of render frames elapsed
    this._ticksPerFrame = 2; // number of render frames (aka ticks) needed to display next animation frame

    this._sizeScale = 1;

    this._numFrames = 8;
    if (noteskin === "note" || noteskin === "rainbow") {
      this._numFrames = 8;
    } else if (noteskin === "vivid" || noteskin === "flat") {
      this._numFrames = 16;
    }
  }

  // FIXME: all calculation logic should go in the game engine.
  // values should be pre-calculated and then passed into this method
  update(beat, bpm, mods = {}) {
    const { speedMod } = mods;

    this._tickCount++;

    const ticksPerFrame = 3600 / (4 * bpm); // ex: 7.5 for 120 bpm

    const updatedFrameIndex = Math.floor(this._tickCount / ticksPerFrame);
    if (updatedFrameIndex > this._frameCount) {
      this._frameCount = updatedFrameIndex;
    }

    // // if enough ticks have passed to move onto the next animation frame
    // if (this._tickCount > this._ticksPerFrame) {
    //   this._tickCount = 0;

    //   // if current frame index is in range, go to the next frame
    //   if (this._frameIndex < this._numFrames - 1) {
    //     this._frameIndex++;
    //   }
    //   // if out of range, loop back to first frame index
    //   else {
    //     this._frameIndex = 0;
    //   }
    // }

    // number of pixels the arrow moves per frame
    const scrollPerFrame = (64 * bpm * speedMod) / 3600;

    this.scrollY -= scrollPerFrame;

    // this.scrollY = 0;
  }

  render(beat, bpm, mods = {}) {
    const c = this.context;

    // calculate the actual animation frame index from the total elapsed frame count
    const frameIndex = this._frameCount % this._numFrames;

    const arrowImg = arrowImages[`${this.noteskin}_${this.direction}`];

    let frameX, frameY;
    if (this.noteskin === "note") {
      frameX = frameIndex * ARROW_WIDTH;

      if (this.quantization === 4) frameY = 0;
      else if (this.quantization === 8) frameY = ARROW_HEIGHT;
      else if (this.quantization === 16) frameY = ARROW_HEIGHT * 3;
      else frameY = ARROW_HEIGHT * 2;
    } else if (this.noteskin === "vivid") {
      frameX = (frameIndex % 4) * ARROW_WIDTH;
      frameY = Math.floor(frameIndex / 4) * ARROW_HEIGHT;
    }

    const destX = DIRECTIONS.indexOf(this.direction) * ARROW_WIDTH;
    const destY = this.scrollY;

    // console.log(canvas.height);
    // console.log(destY);

    const topBoundary = 0; // used to simulate the arrows being hit and disappearing
    const bottomBoundary = this.canvas.height; // can be adjusted with SUDDEN+

    if (destY > topBoundary && destY < bottomBoundary) {
      c.drawImage(
        arrowImg,
        frameX,
        frameY,
        ARROW_WIDTH,
        ARROW_HEIGHT,
        destX * this._sizeScale,
        destY * this._sizeScale,
        ARROW_WIDTH * this._sizeScale,
        ARROW_HEIGHT * this._sizeScale
      );
    }

    this.update(beat, bpm, mods);
  }
}

export default Arrow;
