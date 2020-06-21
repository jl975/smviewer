import React from "react";
import { connect } from "react-redux";

import { ARROW_HEIGHT } from "../../constants";

const StopDisplay = (props) => {
  const { mods, stopQueue } = props;

  // const renderStopValues = () => {
  //   return stopQueue.map((stop, i) => {
  //     const stopValuePosition =
  //       stop.beat * ARROW_HEIGHT * mods.speed + ARROW_HEIGHT / 2;

  //     return (
  //       <div
  //         className="stop-value"
  //         key={`stopValue_${i}`}
  //         style={{ top: `${stopValuePosition}px` }}
  //       >
  //         {stop.value}
  //       </div>
  //     );
  //   });
  // };

  return (
    <div className="stop-display">
      {mods.speed !== "cmod" && mods.bpmStopDisplay && (
        <div id="stopReel"></div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods } = state;
  return { mods };
};

export default connect(mapStateToProps, null)(StopDisplay);
