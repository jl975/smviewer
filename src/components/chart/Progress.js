import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { presetParams } from "../../utils";

const Progress = (props) => {
  const progressBar = useRef();
  const { progress } = props;

  let presetStart = 0;
  if (presetParams.progress) {
    presetStart = presetParams.progress / 100000;
  }

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
  }, []);

  const jumpToProgress = (event, presetProgress) => {
    let progressPercent;

    if (presetProgress) {
      progressPercent = presetProgress;
    } else {
      const totalWidth = progressBar.current.offsetWidth;
      const x = event.clientX - progressBar.current.offsetLeft;
      progressPercent = x / totalWidth;
    }

    if (progressPercent < 0 || progressPercent > 1) return;

    AudioPlayer.seekProgress(progressPercent);
  };

  const jumpToPresetStart = (e) => {
    jumpToProgress(e, presetStart);
    e.stopPropagation();
  };

  const getPresetMarkerPosition = () => {
    let totalWidth = 0;
    if (progressBar.current) {
      totalWidth = progressBar.current.offsetWidth;
    }
    return totalWidth * presetStart;
  };

  return (
    <div id="progress-bar" ref={progressBar}>
      {presetStart ? (
        <div
          className="preset-marker"
          onClick={jumpToPresetStart}
          style={{ left: `${getPresetMarkerPosition()}px` }}
        ></div>
      ) : null}
      <div
        className="progress-value"
        style={{ width: `${progress * 100}%` }}
      ></div>
    </div>
  );
};

export default Progress;
