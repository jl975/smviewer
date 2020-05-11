import React from "react";
import { connect } from "react-redux";
import { Button, Icon } from "semantic-ui-react";

import AudioPlayer from "../../core/AudioPlayer";
import HoldButton from "../ui/HoldButton";

const PlayControls = (props) => {
  const { audio, controlsDisabled, setShareModalOpen } = props;

  const togglePlay = () => {
    if (controlsDisabled) return;
    if (props.audio.status === "playing") {
      AudioPlayer.pause();
    } else {
      AudioPlayer.play();
    }
  };

  const restart = () => {
    if (controlsDisabled) return;
    AudioPlayer.stop();
  };

  return (
    <div className="play-controls">
      <HoldButton
        onClick={() => AudioPlayer.goBack(20)}
        className="play-control"
      >
        <Icon name="backward" />
      </HoldButton>
      <Button
        onClick={togglePlay}
        disabled={controlsDisabled}
        className="play-control"
      >
        <Icon name={audio.status === "playing" ? "pause" : "play"} />
      </Button>
      <Button onClick={restart} className="play-control">
        <Icon name="stop" />
      </Button>
      <HoldButton
        onClick={() => AudioPlayer.goForward(20)}
        className="play-control"
      >
        <Icon name="forward" />
      </HoldButton>

      <Button
        onClick={() => setShareModalOpen(true)}
        className="play-control share-btn"
        disabled={audio.status === "playing"}
      >
        <Icon name="share square" />
      </Button>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio } = state;
  return { audio: audio.chartAudio };
};

export default connect(mapStateToProps, null)(PlayControls);
