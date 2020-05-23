import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";

import { LANE_COVER_INCREMENT } from "../../constants";
import HoldButton from "../ui/HoldButton";
import { updateMods } from "../../actions/ModsActions";
import { getAssetPath } from "../../utils";

const CabButtons = (props) => {
  const { canvas, mods, updateMods } = props;

  const laneCoverFn = useRef();

  const adjustLaneCoverHeight = (e) => {
    // if key pressed is up or down, prevent default behavior
    // ignore if key pressed is not up or down
    if (e.keyCode !== 38 && e.keyCode !== 40) return;
    else {
      e.preventDefault();
    }

    // after preventing default behavior, ignore if no lane cover mod is being used
    if (!["hidden", "sudden", "hiddensudden"].includes(mods.appearance)) {
      return;
    }

    // the following code will only run if a lane cover mod is being used
    // and if the key pressed was either up or down

    const { scroll } = mods;
    const laneCoverHeight = [...mods.laneCoverHeight];

    const reverseFactor = scroll === "reverse" ? -1 : 1;

    // up key
    if (e.keyCode === 38) {
      switch (mods.appearance) {
        case "hidden":
          laneCoverHeight[0] -= LANE_COVER_INCREMENT * reverseFactor;
          break;
        case "sudden":
          laneCoverHeight[1] += LANE_COVER_INCREMENT * reverseFactor;
          break;
        case "hiddensudden":
          laneCoverHeight[2] += LANE_COVER_INCREMENT;
          break;
        default:
          break;
      }
    }
    // down key
    else if (e.keyCode === 40) {
      switch (mods.appearance) {
        case "hidden":
          laneCoverHeight[0] += LANE_COVER_INCREMENT * reverseFactor;
          break;
        case "sudden":
          laneCoverHeight[1] -= LANE_COVER_INCREMENT * reverseFactor;
          break;
        case "hiddensudden":
          laneCoverHeight[2] -= LANE_COVER_INCREMENT;
          break;
        default:
          break;
      }
    }

    // don't let lane covers go beyond the chart area boundary
    const lowerBoundary = 0,
      upperBoundary = canvas.height;
    for (let i = 0; i < laneCoverHeight.length; i++) {
      const height = laneCoverHeight[i];
      if (height < lowerBoundary) laneCoverHeight[i] = lowerBoundary;
      else if (height > upperBoundary) laneCoverHeight[i] = upperBoundary;
    }

    updateMods({ laneCoverHeight });
  };

  const toggleLaneCover = (e) => {
    e.preventDefault();
    const { laneCoverVisible } = mods;
    updateMods({ laneCoverVisible: !laneCoverVisible });
  };

  useEffect(() => {
    document.removeEventListener("keydown", laneCoverFn.current);
    laneCoverFn.current = adjustLaneCoverHeight;
    document.addEventListener("keydown", laneCoverFn.current);
  }, [mods.appearance, mods.scroll, mods.laneCoverHeight, canvas]);

  return (
    <div className="cab-buttons-container">
      <HoldButton
        className="directional-button"
        onClick={(e) => {
          e.keyCode = 38;
          adjustLaneCoverHeight(e);
        }}
      >
        <img src={getAssetPath(`directional_button.png`)} />
      </HoldButton>
      <Button
        className="center-button"
        onClick={(e) => {
          toggleLaneCover(e);
        }}
      >
        <img src={getAssetPath(`center_button.png`)} />
      </Button>
      <HoldButton
        className="directional-button"
        onClick={(e) => {
          e.keyCode = 40;
          adjustLaneCoverHeight(e);
        }}
      >
        <img src={getAssetPath(`directional_button.png`)} />
      </HoldButton>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
  };
};

export default connect(null, mapDispatchToProps)(CabButtons);
