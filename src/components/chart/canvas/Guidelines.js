import { ARROW_HEIGHT } from "../../../constants";

class Guidelines {
  constructor(attrs) {
    const { mods } = attrs;
    const { speed, guidelines } = mods;

    this.speed = speed;
    this.finalBeat = attrs.finalBeat;
    this.showGuidelines = guidelines;
  }

  render(canvas, beatTick) {
    if (!this.showGuidelines) return;

    const c = canvas.getContext("2d");
    c.strokeStyle = "#fff";

    const topBoundary = 0;
    const bottomBoundary = canvas.height;

    for (let beat = 0; beat <= this.finalBeat; beat++) {
      let destY =
        (beat - beatTick) * ARROW_HEIGHT * this.speed + ARROW_HEIGHT / 2;

      destY = (destY + 0.5) | 0;

      // Render a thick line if the beat falls on the beginning of the measure.
      // Render a thin line otherwise
      const lineWidth = beat % 4 === 0 ? 2 : 1;

      if (destY > topBoundary && destY < bottomBoundary) {
        console.log(destY);
        c.beginPath();
        c.moveTo(0, destY);
        c.lineTo(canvas.width, destY);
        c.lineWidth = lineWidth;
        c.stroke();
      }
    }
  }
}

export default Guidelines;
