import React, { useState, useEffect } from "react";
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

  // define canvas on mount
  useEffect(() => {
    if (!loadingAudio) {
      const chartArea = document.querySelector("#chartArea");
      setCanvas(chartArea);
    }
  }, [loadingAudio]);

  // reset chart if song, difficulty, or mods change
  useEffect(() => {
    if (!canvas) return;

    let ge = new GameEngine(canvas, sm);

    if (!selectedDifficulty) return;

    const simfile = ge.simfiles[`single_${selectedDifficulty}`];

    if (simfile) {
      ge.generateEventList(simfile);
      ge.generateArrows(simfile, mods);
      ge.initTimeline(mods);
      ge.restartTl();
      AudioPlayer.resync();
    }
    setGameEngine(ge);
  }, [canvas, sm, selectedDifficulty, mods]);

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
    mods,
    progress: props.audio.progress,
  };

  return (
    <div className="canvas-container">
      {loadingAudio && <div>Loading audio...</div>}
      {!loadingAudio && (
        <>
          <canvas id="chartArea" width="256" height="448" />
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
                    SP_DIFFICULTIES.indexOf(selectedDifficulty)
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
  const { audio, chart, mods } = state;
  return {
    audio: audio.chartAudio,
    chart,
    mods,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea);
