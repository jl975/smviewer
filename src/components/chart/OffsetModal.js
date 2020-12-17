import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button, Icon } from "semantic-ui-react";

import { OffsetAdjustAudioPlayer } from "../../core/AudioPlayer";
import { updateMods, trackPreconfirmOffset } from "../../actions/ModsActions";
import { setModalOpen } from "../../actions/ScreenActions";
import { getOriginPath, fetchDocument } from "../../utils";
// import { DEFAULT_OFFSET } from "../../constants";
import parseSimfile from "../../utils/parseSimfile";
import GameEngine from "../../core/GameEngine";

const OffsetModal = (props) => {
  const { modalOpen, setModalOpen, mods, updateMods } = props;
  const [gameEngine, setGameEngine] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  const [canvas, setCanvas] = useState(null);
  const canvasRef = useRef(null);

  const adjustedGlobalOffset = window.localStorage.getItem("adjustedGlobalOffset");

  const originalOffsetValue = useRef(mods.globalOffset);

  useEffect(() => {
    if (!modalOpen) return;

    canvasRef.current = document.querySelector("#offsetChart");
    setCanvas(canvasRef.current);

    if (!canvas) return;

    loadSimfile();

    // if a value for preconfirmOffset exists, it means the user did not confirm
    // whatever value is currently stored as the global offset.
    // reset the global offset to the preconfirmOffset value and delete preconfirmOffset
    if (typeof mods.preconfirmOffset === "number") {
      console.log(`user did not confirm the globalOffset value of ${mods.globalOffset},
      switching to preconfirmOffset value of ${mods.preconfirmOffset}`);
      originalOffsetValue.current = mods.preconfirmOffset;
      updateMods({ globalOffset: mods.preconfirmOffset, preconfirmOffset: null });
    }
  }, [canvas, modalOpen]);

  const loadSimfile = async () => {
    // prepare audio
    const song = {
      title: "",
      audioUrl: "offset_adjust.mp3",
      hash: "OFFSET_ADJUST_AUDIO",
    };
    OffsetAdjustAudioPlayer.setLoadingAudio = setLoadingAudio;
    OffsetAdjustAudioPlayer.selectSong(song);

    // prepare chart
    const sm = await fetchDocument(`${getOriginPath()}simfiles/offset_adjust.sm`);
    const simfileObj = parseSimfile(sm, "sm");
    const chartParams = {
      difficulty: "Basic",
      mode: "single",
      mods,
    };

    let ge = new GameEngine(canvas, simfileObj, chartParams, {
      mainEngine: false,
      AudioPlayer: OffsetAdjustAudioPlayer,
    });
    setGameEngine(ge);

    OffsetAdjustAudioPlayer.play();
  };

  const handleClose = () => {
    setModalOpen("offset", false);
    OffsetAdjustAudioPlayer.stop();
    if (gameEngine) {
      gameEngine.killed = true;
    }
  };

  const handleOffsetChange = async (newOffset) => {
    await updateMods({
      globalOffset: newOffset,
      preconfirmOffset: originalOffsetValue.current,
    });
    // trackPreconfirmOffset(originalOffsetValue.current);
    OffsetAdjustAudioPlayer.resync();
  };

  const incrementOffset = () => {
    const newOffset = Math.round((mods.globalOffset + 0.01) * 100) / 100;
    handleOffsetChange(newOffset);
  };
  const decrementOffset = () => {
    const newOffset = Math.round((mods.globalOffset - 0.01) * 100) / 100;
    handleOffsetChange(newOffset);
  };

  const renderOffsetValue = (offsetValue) => {
    let sign = "";
    if (offsetValue < 0) sign = "–";
    else if (offsetValue > 0) sign = "+";
    return `${sign}${Math.abs(offsetValue)}`;
  };

  const handleCancel = async () => {
    await updateMods({
      globalOffset: originalOffsetValue.current,
      preconfirmOffset: null,
    });
    // trackPreconfirmOffset(null);
    handleClose();
  };

  const confirmOffset = async () => {
    window.localStorage.setItem("adjustedGlobalOffset", true);
    originalOffsetValue.current = mods.globalOffset;
    await updateMods({ preconfirmOffset: null });
    handleClose();
  };

  return (
    <Modal open={modalOpen} className="offsetModal">
      <h3>Set global offset</h3>
      <div className="offsetChart-container">
        <canvas id="offsetChart" width="256" height="448" />
        {loadingAudio && <div></div>}
      </div>
      <div className="slider-container">
        <Button className="offset-adjust-btn" onClick={decrementOffset}>
          <div className="adjust-sign">
            <Icon name="minus" />
          </div>
          <div className="adjust-label">Later</div>
        </Button>
        <div className="slider-wrapper">
          <Input
            type="range"
            name="globalOffset"
            min="-0.20"
            max="0.20"
            step="0.01"
            value={mods.globalOffset}
            onChange={(_, data) => {
              handleOffsetChange(parseFloat(data.value));
            }}
          />
          <div className="offset-value">
            <span>{renderOffsetValue(mods.globalOffset)}</span>
            <span>&nbsp;(previous: {renderOffsetValue(originalOffsetValue.current)})</span>
          </div>
        </div>
        <Button className="offset-adjust-btn" onClick={incrementOffset}>
          <div className="adjust-sign">
            <Icon name="plus" />
          </div>
          <div className="adjust-label">Earlier</div>
        </Button>
      </div>
      <div className="modal-actions">
        {adjustedGlobalOffset && <Button onClick={handleCancel}>Cancel</Button>}
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
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
    trackPreconfirmOffset: (preconfirmOffset) => dispatch(trackPreconfirmOffset(preconfirmOffset)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetModal);
