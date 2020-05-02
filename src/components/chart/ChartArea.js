import React, { useState, useEffect, useRef } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { connect } from "react-redux";
import "inobounce";

import { presetParams, getJacketPath } from "../../utils";
import { usePrevious } from "../../hooks";
// import loadStore from '../../utils/loadStore';
import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";
import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";
import HoldButton from "../ui/HoldButton";
import ShareModal from "./ShareModal";
import Progress from "./canvas/Progress";
import PlayControls from "./PlayControls";
import SongInfo from "./SongInfo";

const ChartArea = (props) => {
  const {
    selectedDifficulty,
    selectedMode,
    selectedSong,
    sm,
    chart,
    mods,
    screen,
    loadingAudio,
    gameEngine,
    setGameEngine,
  } = props;

  const [canvas, setCanvas] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const chartArea = useRef();
  const canvasWrapper = useRef();
  const chartLoadingScreen = useRef();

  const prevState = usePrevious({
    canvas,
    sm,
    selectedDifficulty,
    selectedMode,
    mods,
  });

  // define canvas and resize listener on mount
  useEffect(() => {
    if (!loadingAudio) {
      chartArea.current = document.querySelector("#chartArea");
      setCanvas(chartArea.current);

      Progress.initCanvas();
    }
  }, [loadingAudio]);

  // change chart dimensions depending on single or double
  // Hardcoded heights for now. Variable heights may be possible in the future
  useEffect(() => {
    if (!canvas || !canvasWrapper.current) return;
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

      const wrapper = canvasWrapper.current.getBoundingClientRect();

      if (wrapper.width < 512) {
        const scaleFactor = wrapper.width / chartArea.current.width;
        const xOffset = (chartArea.current.width - wrapper.width) / 2;
        const yOffset = xOffset * (7 / 8);
        chartArea.current.style.transform = `scale(${scaleFactor})`;
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

  // reset chart if song, difficulty, or mods change
  useEffect(() => {
    const currentState = { canvas, sm, selectedDifficulty, selectedMode, mods };
    Object.keys(currentState).forEach((thing) => {
      if (prevState[thing] !== currentState[thing]) {
        if (thing === "sm") {
          // console.log(
          //   `${thing} changed from ${
          //     prevState[thing]
          //       ? prevState[thing].slice(0, 100)
          //       : prevState[thing]
          //   } \n\nto ${currentState[thing].slice(0, 100)}`
          // );
        } else {
          // console.log(`${thing} changed`);
          // console.log(
          //   `${thing} changed from ${prevState[thing]} to ${currentState[thing]}`
          // );
        }

        // console.log(
        //   `${thing} changed from ${prevState[thing]} to ${currentState[thing]}`
        // );
      }
    });

    if (!canvas) return;

    const simfileType = selectedSong.useSsc ? "ssc" : "sm";

    let ge = new GameEngine(canvas, sm, simfileType);

    if (!selectedDifficulty) return;

    const simfile = ge.simfiles[`${selectedMode}_${selectedDifficulty}`];

    if (simfile) {
      ge.generateEventList(simfile);
      ge.generateArrows(simfile, mods);
      ge.initTimeline(mods);
      ge.restartTl();
      AudioPlayer.resync();
    }
    setGameEngine(ge);
  }, [canvas, sm, selectedDifficulty, selectedMode, mods]);

  const shareParams = {
    song: selectedSong,
    difficulty: selectedDifficulty,
    mode: selectedMode,
    mods,
  };

  console.log("rerender ChartArea");

  return (
    <div className="canvas-container">
      {loadingAudio && (
        <div className={`canvas-wrapper`} ref={chartLoadingScreen}>
          <div className={`chart-loading-screen ${selectedMode}`}>
            <img
              className="chart-loading-jacket"
              src={getJacketPath(`${selectedSong.hash}.png`)}
            />
            <div className="chart-loading-message">Loading chart...</div>
          </div>
        </div>
      )}
      {!loadingAudio && (
        <>
          <div className={`canvas-wrapper ${selectedMode}`} ref={canvasWrapper}>
            <canvas id="chartArea" width="256" height="448" />
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
        </>
      )}
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
