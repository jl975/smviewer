import React, { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";

import "./ChartArea.scss";

import GameEngine from "../../core/GameEngineNew";

const ChartArea = props => {
  const { selectedSong, selectedDifficulty, sm, mods, selectedAudio } = props;

  const [canvas, setCanvas] = useState(null);
  const [gameEngine, setGameEngine] = useState(null);

  // define canvas on mount
  useEffect(() => {
    setCanvas(document.querySelector("#chartArea"));
  }, []);

  useEffect(() => {
    if (!canvas) return;

    let ge = new GameEngine(canvas, sm);

    if (!selectedDifficulty) return;

    const simfile = ge.simfiles[`single_${selectedDifficulty}`];

    if (simfile) {
      const eventList = ge.generateEventList(simfile);
      ge.generateArrows(simfile, mods, eventList);
      ge.initTimeline();
      ge.pauseTl();
    }
    if (selectedAudio) {
      selectedAudio.load();
    }

    setGameEngine(ge);
  }, [canvas, sm, selectedDifficulty, mods]);

  const togglePlay = () => {
    if (!gameEngine) return;
    gameEngine.toggleTl();

    if (selectedAudio) {
      if (selectedAudio.paused) selectedAudio.play();
      else selectedAudio.pause();
    }
  };
  const restart = () => {
    if (!gameEngine) return;
    gameEngine.restartTl();
    if (selectedAudio) {
      selectedAudio.load();
    }
  };

  return (
    <div className="canvas-container">
      <canvas id="chartArea" width="256" height="512" />
      {/* <canvas id="chartArea" width="256" height="18000" /> */}
      <Button onClick={togglePlay}>Play/Pause</Button>
      <Button onClick={restart}>Restart</Button>
    </div>
  );
};

export default ChartArea;
