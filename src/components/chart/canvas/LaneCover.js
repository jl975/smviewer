import { ARROW_WIDTH } from "../../../constants";
import { getAssetPath } from "../../../utils";
import { getReverseCoord } from "../../../utils/engineUtils";

const images = {};

images.upper = new Image();
images.upper.src = getAssetPath("upper_lanecover.png");
images.lower = new Image();
images.lower.src = getAssetPath("lower_lanecover.png");

const appearanceIdx = ["hidden", "sudden", "hiddensudden"];

class LaneCover {
  constructor(attrs) {
    const { mods, mode } = attrs;
    const { appearance, laneCoverHeight, scroll } = mods;

    this.appearance = appearance;
    this.laneCoverHeight = laneCoverHeight[appearanceIdx.indexOf(appearance)];
    this.scroll = scroll;
    this.mode = mode;
  }

  render(canvas) {
    const c = canvas.getContext("2d");

    if (
      (this.appearance.includes("hidden") && this.scroll === "normal") ||
      (this.appearance.includes("sudden") && this.scroll === "reverse")
    ) {
      let img = images.upper;
      c.drawImage(
        img,
        0,
        getReverseCoord(this.laneCoverHeight, 0, canvas),
        img.width,
        this.laneCoverHeight,
        0,
        0,
        img.width,
        this.laneCoverHeight
      );

      if (this.mode === "double") {
        c.drawImage(
          img,
          0,
          getReverseCoord(this.laneCoverHeight, 0, canvas),
          img.width,
          this.laneCoverHeight,
          ARROW_WIDTH * 4,
          0,
          img.width,
          this.laneCoverHeight
        );
      }
    }
    if (
      (this.appearance.includes("sudden") && this.scroll === "normal") ||
      (this.appearance.includes("hidden") && this.scroll === "reverse")
    ) {
      let img = images.lower;
      c.drawImage(
        img,
        0,
        0,
        img.width,
        this.laneCoverHeight,
        0,
        getReverseCoord(this.laneCoverHeight, 0, canvas),
        img.width,
        this.laneCoverHeight
      );

      if (this.mode === "double") {
        c.drawImage(
          img,
          0,
          0,
          img.width,
          this.laneCoverHeight,
          ARROW_WIDTH * 4,
          getReverseCoord(this.laneCoverHeight, 0, canvas),
          img.width,
          this.laneCoverHeight
        );
      }
    }
  }
}

export default LaneCover;
