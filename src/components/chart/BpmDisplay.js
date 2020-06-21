import React from "react";
import { connect } from "react-redux";

const BpmDisplay = (props) => {
  const { mods, songSelect } = props;

  return (
    <div className={`bpm-display`}>
      {mods.bpmStopDisplay && <div id="bpmReel"></div>}
      <div className={`current-bpm-container `}>
        <div className="current-bpm-wrapper">
          <div className="current-bpm-header">BPM</div>
          <div className="current-bpm-value"></div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods, songSelect } = state;
  return { mods, songSelect };
};

export default connect(mapStateToProps, null)(BpmDisplay);
