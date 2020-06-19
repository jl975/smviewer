import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import "inobounce";

import { presetParams, getJacketPath } from "../../utils";
import { usePrevious } from "../../hooks";
import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";
import ShareModal from "./ShareModal";
import Progress from "./canvas/Progress";
import PlayControls from "./PlayControls";
import SongInfo from "./SongInfo";

import CabButtons from "./CabButtons";
import BpmDisplay from "./BpmDisplay";
import StopDisplay from "./StopDisplay";

const ChartArea = (props) => {
  const {
    selectedDifficulty,
    selectedMode,
    selectedSong,
    sm,
    mods,
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

  const prevState = usePrevious({
    canvas,
    sm,
    selectedDifficulty,
    selectedMode,
    mods,
  });

  console.log("ChartArea");

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
      chartArea.current.style.left = 0;
      chartArea.current.style.top = 0;

      // hack to resolve positioning issues
      chartArea.current.style.position = "static";
      setTimeout(() => {
        chartArea.current.style.position = "relative";
      });
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
        chartArea.current.style.left = 0;
        chartArea.current.style.top = 0;

        chartArea.current.style.position = "static";
        setTimeout(() => {
          chartArea.current.style.position = "relative";
        });
      }
    }

    if (gameEngine) {
      gameEngine.updateLoopOnce();
    }
  };

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
        } else if (thing === "mods") {
          Object.keys(prevState.mods).forEach((mod) => {
            const prev = JSON.stringify(prevState.mods[mod]);
            const curr = JSON.stringify(currentState.mods[mod]);
            const modChanged = prev !== curr;

            if (gameEngine && modChanged) {
              if (["turn", "shuffle"].includes(mod)) {
                gameEngine.resetChart(chartParams);
              } else {
                // console.log(prev, curr);
                if (gameEngine.isTlPaused()) {
                  gameEngine.updateLoopOnce();
                }
              }
            }
          });
        }
        // mode or difficulty
        else {
          // console.log(
          //   `${thing} changed from ${prevState[thing]} to ${currentState[thing]}`
          // );
          if (gameEngine) {
            gameEngine.resetChart(chartParams);
          }
        }
      }
    });

    if (gameEngine) {
      gameEngine.updateExternalGlobalParams({ mods });
    }
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
          <div className="chartArea-wrapper">
            {gameEngine && (
              <BpmDisplay
                bpmChangeQueue={gameEngine.globalParams.bpmChangeQueue}
              />
            )}
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
                ) && <CabButtons mods={mods} canvas={canvas} />}
            </div>
            {gameEngine && (
              <StopDisplay stopQueue={gameEngine.globalParams.stopQueue} />
            )}
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
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea);
