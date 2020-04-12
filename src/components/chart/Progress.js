import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";

const Progress = (props) => {
  const progressBar = useRef();
  // const [progress, setProgress] = useState(0);

  const { progress } = props;

  useEffect(() => {
    progressBar.current.addEventListener("touchstart", (e) => {
      jumpToProgress(e.touches[0]);
    });

    progressBar.current.addEventListener("touchmove", (e) => {
      jumpToProgress(e.touches[0]);
    });

    progressBar.current.addEventListener("touchend", (e) => {
      // jumpToProgress(e.touches[0]);
    });

    // AudioPlayer.setStateProgress = setProgress;
  }, []);

  const jumpToProgress = (event) => {
    const totalWidth = progressBar.current.offsetWidth;
    const x = event.clientX - progressBar.current.offsetLeft;
    const progressPercent = x / totalWidth;

    if (progressPercent < 0 || progressPercent > 1) return;

    // setProgress(progressPercent);
    AudioPlayer.seekProgress(progressPercent);
  };

  return (
    <div id="progress-bar" ref={progressBar}>
      <div
        className="progress-value"
        style={{ width: `${progress * 100}%` }}
      ></div>
    </div>
  );
};

export default Progress;
