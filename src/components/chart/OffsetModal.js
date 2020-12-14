import React, { useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button } from "semantic-ui-react";

// import AudioPlayer from "../../core/AudioPlayer";
import { updateMods } from "../../actions/ModsActions";

const OffsetModal = (props) => {
  const { mods, updateMods } = props;

  const canvasRef = useRef(null);

  useEffect(() => {
    console.log(canvasRef);
  }, []);

  return (
    <Modal open className="offsetModal">
      <h3>Set global offset</h3>
      <div className="offsetChart-container">
        <canvas id="offsetChart" width="256" height="448" />
      </div>
      <div className="slider-container">
        <div className="slider-wrapper">
          <span>Later</span>
          <Input
            type="range"
            name="globalOffset"
            min="-0.20"
            max="0.20"
            step="0.01"
            value={mods.globalOffset}
            onChange={(_, data) => updateMods({ globalOffset: parseFloat(data.value) })}
          />
          <span>Earlier</span>
        </div>
        <div className="offset-value">{mods.globalOffset}</div>
      </div>
      <div className="modal-actions">
        <Button>Not now</Button>
        <Button>Confirm</Button>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { mods } = state;
  return {
    mods,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetModal);
