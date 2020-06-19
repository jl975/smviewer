import React from "react";
import { connect } from "react-redux";

import { ARROW_HEIGHT } from "../../constants";

const BpmDisplay = (props) => {
  const { chart, mods, bpmChangeQueue } = props;

  console.log("bpmChangeQueue", bpmChangeQueue);

  const renderBpmValues = () => {
    return bpmChangeQueue.map((bpm, i) => {
      const bpmValue = Math.round(bpm.value * 100) / 100;
      const bpmValuePosition =
        bpm.beat * ARROW_HEIGHT * mods.speed + ARROW_HEIGHT / 2;

      return (
        <div
          className="bpm-value"
          key={`bpmValue_${i}`}
          style={{ top: `${bpmValuePosition}px` }}
        >
          {bpmValue}
        </div>
      );
    });
  };

  return (
    <div className="bpm-display">
      {mods.speed !== "cmod" && mods.bpmStopDisplay && (
        <div id="bpmReel">{renderBpmValues()}</div>
      )}
      <div className="current-bpm-container">
        <div className="current-bpm-wrapper">
          <div className="current-bpm-header">BPM</div>
          <div className="current-bpm-value">{chart.activeBpm}</div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { chart, mods } = state;
  return { chart, mods };
};

export default connect(mapStateToProps, null)(BpmDisplay);
