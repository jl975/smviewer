import { STATIC_ARROW_HEIGHT, STATIC_ARROW_WIDTH } from "../../../constants";

class StaticGuidelines {
  constructor(finalBeat) {
    this.finalBeat = finalBeat;
  }

  render(canvas, { beatTick }, attrs) {
    const { mods, columnIdx, columnWidth, measuresPerColumn } = attrs;
    const { speed } = mods;

    const showGuidelines = mods.guidelines;
    if (!showGuidelines) return;

    const c = canvas.getContext("2d");
    c.strokeStyle = "#fff";

    const topBoundary = 0;
    const bottomBoundary = canvas.height;

    const columnStart = columnIdx * columnWidth + STATIC_ARROW_WIDTH * 2;

    for (let beat = 0; beat < 4 * measuresPerColumn; beat++) {
      const overallBeat = measuresPerColumn * 4 * columnIdx + beat;
      if (overallBeat >= this.finalBeat) return;

      let destY = (beat - beatTick) * STATIC_ARROW_HEIGHT * speed + STATIC_ARROW_HEIGHT / 2;
      destY = (destY + 0.5) | 0;

      // Render a thick line if the beat falls on the beginning of the measure.
      // Render a thin line otherwise
      const lineWidth = beat % 4 === 0 ? 2 : 1;

      if (destY > topBoundary && destY < bottomBoundary) {
        c.beginPath();
        c.moveTo(columnStart, destY);
        c.lineTo(columnStart + columnWidth / 2, destY);
        c.lineWidth = lineWidth;
        c.stroke();
      }
    }
  }
}

export default StaticGuidelines;
