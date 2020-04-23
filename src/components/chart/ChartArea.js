import React, { useState, useEffect, useRef } from "react";
import { Button, Icon, Modal } from "semantic-ui-react";
import { connect } from "react-redux";
import "inobounce";

import "./ChartArea.scss";

import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";
import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";
import Progress from "./Progress";
import HoldButton from "../ui/HoldButton";
import ShareModal from "./ShareModal";

const ChartArea = (props) => {
  const {
    selectedDifficulty,
    selectedMode,
    selectedSong,
    sm,
    chart,
    mods,
    selectedAudio,
    loadingAudio,
    gameEngine,
    setGameEngine,
  } = props;

  const [canvas, setCanvas] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const chartArea = useRef();

  // define canvas on mount
  useEffect(() => {
    if (!loadingAudio) {
      chartArea.current = document.querySelector("#chartArea");
      setCanvas(chartArea.current);
    }
  }, [loadingAudio]);

  // change chart dimensions depending on single or double
  // Hardcoded widths for now. Variable widths may be possible in the future
  useEffect(() => {
    if (!canvas) return;

    if (selectedMode === "single") {
      chartArea.current.width = 256;
      chartArea.current.style.transform = "none";
      chartArea.current.style.position = "relative";
      chartArea.current.style.left = 0;
      chartArea.current.style.top = 0;
    } else if (selectedMode === "double") {
      chartArea.current.width = 512;
      const scaleFactor = window.innerWidth / chartArea.current.width;
      const xOffset = (chartArea.current.width - window.innerWidth) / 2;
      const yOffset = xOffset * (7 / 8);
      chartArea.current.style.transform = `scale(${scaleFactor})`;
      chartArea.current.style.position = "absolute";
      chartArea.current.style.left = `-${xOffset}px`;
      chartArea.current.style.top = `-${yOffset}px`;
    }
  }, [canvas, selectedMode]);

  // reset chart if song, difficulty, or mods change
  useEffect(() => {
    if (!canvas) return;

    let ge = new GameEngine(canvas, sm);

    if (!selectedDifficulty) return;

    const simfile = ge.simfiles[`${selectedMode}_${selectedDifficulty}`];

    if (simfile) {
      console.log(simfile);
      ge.generateEventList(simfile);
      ge.generateArrows(simfile, mods);
      ge.initTimeline(mods);
      ge.restartTl();
      AudioPlayer.resync();
    }
    setGameEngine(ge);
  }, [canvas, sm, selectedDifficulty, selectedMode, mods]);

  const togglePlay = () => {
    if (!gameEngine) return;
    if (props.audio.status === "playing") {
      AudioPlayer.pause();
    } else {
      AudioPlayer.play();
    }
  };
  const restart = () => {
    if (!gameEngine) return;
    AudioPlayer.stop();
  };

  const isPlayDisabled = () => {
    if (!gameEngine || loadingAudio) return true;
    return false;
  };

  const shareParams = {
    song: selectedSong,
    difficulty: selectedDifficulty,
    mode: selectedMode,
    mods,
    progress: props.audio.progress,
  };

  return (
    <div className="canvas-container">
      {loadingAudio && <div>Loading audio...</div>}
      {!loadingAudio && (
        <>
          <div className={`canvas-wrapper ${selectedMode}`}>
            <canvas id="chartArea" width="256" height="448" />
            <div className="combo-temp">
              <div>Combo</div>
              <div className="combo-num">{chart.combo}</div>
            </div>
          </div>
          <div className="progress-container">
            <Progress progress={props.audio.progress} gameEngine={gameEngine} />
          </div>
        </>
      )}
      {/* <canvas id="chartArea" width="256" height="18000" /> */}
      <div className="row">
        <div className="play-controls">
          <HoldButton
            onClick={() => AudioPlayer.goBack(20)}
            // disabled={props.audio.progress === 0}
            className="play-control"
          >
            <Icon name="backward" />
          </HoldButton>
          <Button
            onClick={togglePlay}
            disabled={isPlayDisabled()}
            className="play-control"
          >
            <Icon name={props.audio.status === "playing" ? "pause" : "play"} />
          </Button>
          <Button onClick={restart} className="play-control">
            <Icon name="stop" />
          </Button>
          <HoldButton
            onClick={() => AudioPlayer.goForward(20)}
            className="play-control"
          >
            <Icon name="forward" />
          </HoldButton>

          <Button
            onClick={() => setShareModalOpen(true)}
            className="play-control share-btn"
            disabled={props.audio.status === "playing"}
          >
            <Icon name="share square" />
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="song-information">
          {selectedSong && (
            <>
              <div className="song-title">{selectedSong.title}</div>
              <div className="song-artist">{selectedSong.artist}</div>
            </>
          )}
        </div>
        <div className="bpm-information">
          <div className="bpm-header">BPM</div>
          <div className="bpm-value">{chart.activeBpm}</div>
        </div>
        <div className="level-information">
          {selectedSong && (
            <>
              <div className="song-difficulty">{selectedDifficulty}</div>
              <div className="song-level">
                {
                  selectedSong.levels[
                    selectedMode === "double"
                      ? DP_DIFFICULTIES.indexOf(selectedDifficulty) + 5
                      : SP_DIFFICULTIES.indexOf(selectedDifficulty)
                  ]
                }
              </div>
            </>
          )}
        </div>
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
  const { audio, chart, mods, songSelect } = state;
  return {
    audio: audio.chartAudio,
    chart,
    mods,
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea);
