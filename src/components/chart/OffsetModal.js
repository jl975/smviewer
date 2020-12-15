import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button } from "semantic-ui-react";

// import AudioPlayer from "../../core/AudioPlayer";
import { updateMods } from "../../actions/ModsActions";
import { setOffsetModalOpen } from "../../actions/ScreenActions";

const OffsetModal = (props) => {
  const { modalOpen, setOffsetModalOpen, mods, updateMods } = props;
  const [offsetValue, setOffsetValue] = useState(mods.globalOffset);

  const canvasRef = useRef(null);

  const adjustedGlobalOffset = window.localStorage.getItem("adjustedGlobalOffset");

  useEffect(() => {
    console.log(canvasRef);
  }, []);

  const handleClose = () => {
    setOffsetModalOpen(false);
    setOffsetValue(mods.globalOffset);
  };

  const confirmOffset = async () => {
    await updateMods({ globalOffset: offsetValue });
    window.localStorage.setItem("adjustedGlobalOffset", true);
    handleClose();
  };

  return (
    <Modal open={modalOpen} className="offsetModal">
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
            value={offsetValue}
            onChange={(_, data) => {
              setOffsetValue(parseFloat(data.value));
            }}
          />
          <span>Earlier</span>
        </div>
        <div className="offset-value">{offsetValue}</div>
      </div>
      <div className="modal-actions">
        <Button onClick={handleClose}>{adjustedGlobalOffset ? "Cancel" : "Not now"}</Button>
        <Button onClick={confirmOffset}>Confirm</Button>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { mods, screen } = state;
  return {
    mods,
    screen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
    setOffsetModalOpen: (isOpen) => dispatch(setOffsetModalOpen(isOpen)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetModal);
