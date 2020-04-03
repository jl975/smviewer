import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";

import "./ChartArea.scss";

import GameEngine from "../../core/GameEngine";
import AudioPlayer from "../../core/AudioPlayer";

const ChartArea = props => {
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
      setCanvas(document.querySelector("#chartArea"));
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
      {!loadingAudio && <canvas id="chartArea" width="256" height="512" />}
      {/* <canvas id="chartArea" width="256" height="18000" /> */}
      <div className="play-controls">
        <Button onClick={togglePlay} disabled={isPlayDisabled()}>
          {playing ? "Pause" : "Play"}
        </Button>
        <Button onClick={restart}>Restart</Button>
      </div>
    </div>
  );
};

export default ChartArea;
