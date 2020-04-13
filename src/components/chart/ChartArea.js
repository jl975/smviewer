import React, { useState, useEffect } from "react";
import { Button, Icon } from "semantic-ui-react";
import { connect } from "react-redux";
import Hammer from "hammerjs";
import "inobounce";

import "./ChartArea.scss";

import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";
import Progress from "./Progress";
import { audio } from "../../reducers/AudioReducer";

const ChartArea = (props) => {
  const {
    selectedDifficulty,
    selectedSong,
    sm,
    mods,
    selectedAudio,
    loadingAudio,
    gameEngine,
    setGameEngine,
  } = props;

  const [canvas, setCanvas] = useState(null);
  const [playing, setPlaying] = useState(false);

  // define canvas on mount
  useEffect(() => {
    if (!loadingAudio) {
      const chartArea = document.querySelector("#chartArea");
      setCanvas(chartArea);

      const mc = new Hammer(chartArea);

      mc.on("panup", (e) => {
        AudioPlayer.goForward(20);
      });
      mc.on("pandown", (e) => {
        AudioPlayer.goBack(20);
      });
    }
  }, [loadingAudio]);

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
    }
    setGameEngine(ge);
  }, [canvas, sm, selectedDifficulty, mods]);

  const togglePlay = () => {
    if (!gameEngine) return;
    // gameEngine.toggleTl();

    if (AudioPlayer.isPlaying()) {
      AudioPlayer.pause();
      setPlaying(false);
    } else {
      AudioPlayer.play();
      setPlaying(true);
    }
  };
  const restart = () => {
    if (!gameEngine) return;
    // gameEngine.restartTl();

    AudioPlayer.stop();
    setPlaying(false);
  };

  const isPlayDisabled = () => {
    if (!gameEngine || loadingAudio) return true;
    return false;
  };

  return (
    <div className="canvas-container">
      {loadingAudio && <div>Loading audio...</div>}
      {!loadingAudio && (
        <>
          <canvas id="chartArea" width="256" height="448" />
          <div className="progress-container">
            <Progress progress={props.audio.progress} />
          </div>
        </>
      )}
      {/* <canvas id="chartArea" width="256" height="18000" /> */}
      <div className="row">
        <div className="play-controls">
          <Button
            onClick={() => AudioPlayer.goBack(100)}
            disabled={props.audio.progress === 0}
            className="play-control"
          >
            <Icon name="backward" />
          </Button>
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
          <Button
            onClick={() => AudioPlayer.goForward(100)}
            className="play-control"
          >
            <Icon name="forward" />
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
          {/* <div className="bpm-header">BPM</div> */}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio } = state;
  return {
    audio: audio.chartAudio,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea);
