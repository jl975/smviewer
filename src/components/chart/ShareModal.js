import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Input } from "semantic-ui-react";
import copy from "copy-to-clipboard";

import { getOriginPath } from "../../utils";
import Progress from "./canvas/Progress";

const difficulties = {
  Beginner: "b",
  Basic: "B",
  Difficult: "D",
  Expert: "E",
  Challenge: "C",
};

const modes = {
  single: "S",
  double: "D",
};

const ShareModal = (props) => {
  const { modalOpen, setModalOpen, data } = props;
  const { song, difficulty, mode, mods } = data;

  const shareUrl = useRef();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (modalOpen === false) {
      setMessage("");
    }
  }, [modalOpen]);

  if (!song) return null;

  // console.log("ShareModal data", data);

  const generateShareUrl = () => {
    const progress = Progress.getProgress();

    const params = {
      song: song.hash,
      difficulty: difficulties[difficulty] + modes[mode] + "P",
      turn: mods.turn !== "off" ? mods.turn : "",
      speed: mods.speed.toString().replace(".", ""),
      progress: parseInt(progress * 100000),
    };

    const queryStr = Object.keys(params)
      .map((param) => {
        if (params[param] === null || typeof params[param] === "undefined") {
          return null;
        }
        return `${param}=${params[param]}`;
      })
      .filter((param) => param !== null)
      .join("&");

    return getOriginPath() + "?" + queryStr;
  };
  shareUrl.current = generateShareUrl();

  const copyShareUrl = () => {
    copy(shareUrl.current);
    setMessage("Copied link to clipboard");
  };

  return (
    <Modal
      className="shareModal"
      size="fullscreen"
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <Modal.Header>Share link to chart</Modal.Header>
      <Modal.Content>
        <Input
          type="text"
          className="share-url-input"
          value={shareUrl.current}
          action
        >
          <input />
          <Button onClick={copyShareUrl}>Copy</Button>
        </Input>
        <p>{message}</p>
      </Modal.Content>
    </Modal>
  );
};

export default ShareModal;
