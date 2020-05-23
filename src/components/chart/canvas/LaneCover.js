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
  constructor(attrs) {}

  render(canvas, attrs) {
    const c = canvas.getContext("2d");

    const { mods, mode } = attrs;
    const { appearance, scroll } = mods;
    const laneCoverHeight =
      mods.laneCoverHeight[appearanceIdx.indexOf(appearance)];

    if (
      (appearance.includes("hidden") && scroll === "normal") ||
      (appearance.includes("sudden") && scroll === "reverse")
    ) {
      let img = images.upper;
      c.drawImage(
        img,
        0,
        getReverseCoord(laneCoverHeight, 0, canvas),
        img.width,
        laneCoverHeight,
        0,
        0,
        img.width,
        laneCoverHeight
      );

      if (mode === "double") {
        c.drawImage(
          img,
          0,
          getReverseCoord(laneCoverHeight, 0, canvas),
          img.width,
          laneCoverHeight,
          ARROW_WIDTH * 4,
          0,
          img.width,
          laneCoverHeight
        );
      }
    }
    if (
      (appearance.includes("sudden") && scroll === "normal") ||
      (appearance.includes("hidden") && scroll === "reverse")
    ) {
      let img = images.lower;
      c.drawImage(
        img,
        0,
        0,
        img.width,
        laneCoverHeight,
        0,
        getReverseCoord(laneCoverHeight, 0, canvas),
        img.width,
        laneCoverHeight
      );

      if (mode === "double") {
        c.drawImage(
          img,
          0,
          0,
          img.width,
          laneCoverHeight,
          ARROW_WIDTH * 4,
          getReverseCoord(laneCoverHeight, 0, canvas),
          img.width,
          laneCoverHeight
        );
      }
    }
  }
}

export default LaneCover;
