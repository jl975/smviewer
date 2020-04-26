import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { presetParams } from "../../utils";

const Progress = (props) => {
  const progressBar = useRef();
  const mouseDown = useRef();

  const [presetPosition, setPresetPosition] = useState(null);

  const { progress } = props;

  let presetStart = 0;
  if (presetParams.progress) {
    presetStart = presetParams.progress / 100000;
  }

  useEffect(() => {
    // mobile scrub behavior
    progressBar.current.addEventListener("touchstart", (e) => {
      e.preventDefault();
      jumpToProgress(e.touches[0]);
    });
    progressBar.current.addEventListener("touchmove", (e) => {
      e.preventDefault();
      jumpToProgress(e.touches[0]);
    });

    // desktop scrub behavior
    progressBar.current.addEventListener("mousedown", (e) => {
      e.preventDefault();
      jumpToProgress(e);
      mouseDown.current = true;
    });
    progressBar.current.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (mouseDown.current) {
        jumpToProgress(e);
      }
    });
    progressBar.current.addEventListener("mouseup", (e) => {
      e.preventDefault();
      mouseDown.current = false;
    });

    // set preset marker position and update on window resize
    if (presetStart && progressBar.current) {
      const totalWidth = progressBar.current.offsetWidth;
      setPresetPosition(totalWidth * presetStart);
    }
    window.addEventListener("resize", (e) => {
      if (presetStart && progressBar.current) {
        const totalWidth = progressBar.current.offsetWidth;
        setPresetPosition(totalWidth * presetStart);
      }
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

  return (
    <div id="progress-bar" ref={progressBar}>
      {presetStart ? (
        <div
          className="preset-marker"
          onClick={jumpToPresetStart}
          onTouchStart={jumpToPresetStart}
          style={{ left: `${presetPosition}px` }}
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
