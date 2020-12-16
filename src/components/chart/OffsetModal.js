import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Input, Button } from "semantic-ui-react";

import { OffsetAdjustAudioPlayer } from "../../core/AudioPlayer";
import { updateMods } from "../../actions/ModsActions";
import { setOffsetModalOpen } from "../../actions/ScreenActions";
import { getOriginPath, fetchDocument } from "../../utils";
import { DEFAULT_OFFSET } from "../../constants";
import parseSimfile from "../../utils/parseSimfile";
import GameEngine from "../../core/GameEngine";

const OffsetModal = (props) => {
  const { modalOpen, setOffsetModalOpen, mods, updateMods } = props;
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

    if (!adjustedGlobalOffset) {
      updateMods({ globalOffset: DEFAULT_OFFSET });
      originalOffsetValue.current = DEFAULT_OFFSET;
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
    setOffsetModalOpen(false);
    OffsetAdjustAudioPlayer.stop();
    if (gameEngine) {
      gameEngine.killed = true;
    }
  };

  const handleOffsetChange = async (newOffset) => {
    await updateMods({ globalOffset: newOffset });
    OffsetAdjustAudioPlayer.resync();
  };

  const handleCancel = async () => {
    await updateMods({ globalOffset: originalOffsetValue.current });
    handleClose();
  };

  const confirmOffset = async () => {
    window.localStorage.setItem("adjustedGlobalOffset", true);
    originalOffsetValue.current = mods.globalOffset;
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
        <div className="slider-wrapper">
          <span>Later</span>
          <Input
            type="range"
            name="globalOffset"
            min="-0.20"
            max="0.20"
            step="0.01"
            value={mods.globalOffset}
            onChange={(_, data) => {
              // updateMods({ globalOffset: parseFloat(data.value) });
              handleOffsetChange(parseFloat(data.value));
            }}
          />
          <span>Earlier</span>
        </div>
        <div className="offset-value">{mods.globalOffset}</div>
        <div>Original: {originalOffsetValue.current}</div>
      </div>
      <div className="modal-actions">
        <Button onClick={handleCancel}>{adjustedGlobalOffset ? "Cancel" : "Not now"}</Button>
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
