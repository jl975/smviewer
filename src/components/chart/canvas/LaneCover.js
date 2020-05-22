import { getAssetPath } from "../../../utils";
import { getReverseCoord } from "../../../utils/engineUtils";

const images = {};

images.hidden = new Image();
images.hidden.src = getAssetPath("hidden_cover.png");
images.sudden = new Image();
images.sudden.src = getAssetPath("sudden_cover.png");

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

    if (this.appearance.includes("hidden")) {
      const img = images.hidden;
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
    }
    if (this.appearance.includes("sudden")) {
      const img = images.sudden;
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
    }
  }
}

export default LaneCover;
