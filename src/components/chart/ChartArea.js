import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import "inobounce";

import { presetParams, getJacketPath, getAssetPath } from "../../utils";
import { usePrevious } from "../../hooks";
import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";
import ShareModal from "./ShareModal";
import Progress from "./canvas/Progress";
import PlayControls from "./PlayControls";
import SongInfo from "./SongInfo";
import { updateMods } from "../../actions/ModsActions";
import { LANE_COVER_INCREMENT } from "../../constants";
import HoldButton from "../ui/HoldButton";

const ChartArea = (props) => {
  const {
    selectedDifficulty,
    selectedMode,
    selectedSong,
    sm,
    mods,
    updateMods,
    screen,
    loadingAudio,
    gameEngine,
    setGameEngine,
  } = props;

  const [canvas, setCanvas] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const chartArea = useRef();
  const canvasContainer = useRef();
  const chartLoadingScreen = useRef();
  const laneCoverFn = useRef();

  const prevState = usePrevious({
    canvas,
    sm,
    selectedDifficulty,
    selectedMode,
    mods,
  });

  // define canvas and resize listener on mount
  useEffect(() => {
    chartArea.current = document.querySelector("#chartArea");
    setCanvas(chartArea.current);

    Progress.initCanvas();
  }, []);

  // change chart dimensions depending on single or double
  // Hardcoded heights for now. Variable heights may be possible in the future
  useEffect(() => {
    if (!canvas || !canvasContainer.current) return;
    resizeChartArea();
  }, [canvas, selectedMode, screen]);

  const resizeChartArea = () => {
    if (selectedMode === "single") {
      chartArea.current.width = 256;
      chartArea.current.style.transform = "none";
      chartArea.current.style.position = "relative";
      chartArea.current.style.left = 0;
      chartArea.current.style.top = 0;
    } else if (selectedMode === "double") {
      chartArea.current.width = 512;

      const wrapper = canvasContainer.current.getBoundingClientRect();

      if (wrapper.width < 512) {
        const scaleFactor = wrapper.width / chartArea.current.width;
        const xOffset = (chartArea.current.width - wrapper.width) / 2;
        const yOffset = xOffset * (7 / 8);
        chartArea.current.style.transform = `scale(${scaleFactor}) translate(-50%)`;
        chartArea.current.style.position = "absolute";
        chartArea.current.style.left = `-${xOffset}px`;
        chartArea.current.style.top = `-${yOffset}px`;
      } else {
        chartArea.current.style.transform = "none";
        chartArea.current.style.position = "relative";
        chartArea.current.style.left = 0;
        chartArea.current.style.top = 0;
      }
    }

    if (gameEngine) {
      gameEngine.updateLoopOnce();
    }
  };

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

    const { laneCoverHeight, scroll } = mods;

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
  }, [mods.appearance, mods.scroll, canvas]);

  // reset chart if mode, difficulty, or mods change
  useEffect(() => {
    const currentState = { canvas, sm, selectedDifficulty, selectedMode, mods };

    if (!canvas) return;

    const chartParams = {
      mode: selectedMode,
      difficulty: selectedDifficulty,
      mods,
    };

    Object.keys(currentState).forEach((thing) => {
      if (prevState[thing] !== currentState[thing]) {
        // initial setup of game engine when canvas is mounted
        if (thing === "canvas") {
        } else if (thing === "sm") {
          // console.log(
          //   `${thing} changed from ${
          //     prevState[thing]
          //       ? prevState[thing].slice(0, 30)
          //       : prevState[thing]
          //   } \n\nto ${currentState[thing].slice(0, 30)}`
          // );
          const simfileType = selectedSong.useSsc ? "ssc" : "sm";
          let ge = new GameEngine(canvas, sm, simfileType, chartParams);
          ge.pauseTl();
          setGameEngine(ge);
        }
        // mode, difficulty, or mods
        else {
          // console.log(`${thing} changed`);
          // console.log(
          //   `${thing} changed from ${prevState[thing]} to ${currentState[thing]}`
          // );

          if (gameEngine) {
            gameEngine.resetChart(chartParams);
          }
        }
      }
    });
  }, [canvas, sm, selectedDifficulty, selectedMode, mods]);

  const shareParams = {
    song: selectedSong,
    difficulty: selectedDifficulty,
    mode: selectedMode,
    mods,
  };

  return (
    <div
      className={`view-section chartView ${
        screen.activeView === "chart" ? "active" : ""
      }`}
    >
      <div className="view-wrapper chartArea-container">
        <div
          className={`canvas-container ${selectedMode}`}
          ref={canvasContainer}
        >
          <div className="canvas-wrapper">
            <canvas id="chartArea" width="256" height="448" />
            <div
              className={`chart-loading-screen ${selectedMode} ${
                loadingAudio ? "loading" : ""
              } `}
              ref={chartLoadingScreen}
            >
              {selectedSong && (
                <img
                  className="chart-loading-jacket"
                  src={getJacketPath(`${selectedSong.hash}.png`)}
                />
              )}
              <div className="chart-loading-message">Loading chart...</div>
            </div>
            {selectedSong &&
              !loadingAudio &&
              ["hidden", "sudden", "hiddensudden"].includes(
                mods.appearance
              ) && (
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
              )}
          </div>
          <div id="combo-temp">
            <div>Combo</div>
            <div className="combo-num"></div>
          </div>
        </div>
        <div className="progress-container">
          <div className="progress-wrapper">
            <canvas id="progress" />
            {presetParams.progress ? (
              <div
                className="preset-marker-wrapper"
                onClick={Progress.jumpToPresetStart.bind(Progress)}
                onTouchStart={Progress.jumpToPresetStart.bind(Progress)}
              >
                <div className="preset-marker" />
              </div>
            ) : null}
          </div>
        </div>
        {/* <canvas id="chartArea" width="256" height="18000" /> */}
        <div className="row">
          <PlayControls
            controlsDisabled={!gameEngine || loadingAudio}
            setShareModalOpen={setShareModalOpen}
          />
        </div>
        <div className="row">
          <SongInfo />
        </div>
        <ShareModal
          modalOpen={shareModalOpen}
          setModalOpen={setShareModalOpen}
          data={shareParams}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods, songSelect, screen } = state;
  return {
    mods,
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
    screen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea);
