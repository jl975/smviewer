import React from "react";
import { connect } from "react-redux";

const StopDisplay = (props) => {
  const { mods, songSelect } = props;

  return (
    <div className={`stop-display`}>
      {/* {mods.bpmStopDisplay && <div id="stopReel"></div>} */}
      <canvas id="stopReel" />
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods, songSelect } = state;
  return { mods, songSelect };
};

export default connect(mapStateToProps, null)(StopDisplay);
