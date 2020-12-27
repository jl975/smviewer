import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal } from "semantic-ui-react";

import { scaleCanvas } from "../../utils/canvasUtils";
import { STATIC_ARROW_HEIGHT, STATIC_ARROW_WIDTH } from "../../constants";
import StaticArrow from "./staticCanvas/StaticArrow";
import StaticGuidelines from "./staticCanvas/StaticGuidelines";
import AudioPlayer from "../../core/AudioPlayer";

const canvasScaleFactor = 0.5;

// temp hardcode
const measuresPerColumn = 8;

const columnWidth = STATIC_ARROW_WIDTH * 4 * 2;

const StaticModal = (props) => {
  const { modalOpen, setModalOpen, gameEngine } = props;

  const canvasRef = useRef(null);

  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasReady, setCanvasReady] = useState(false);

  useEffect(() => {
    if (!modalOpen) return;
    console.log(gameEngine.globalParams);

    const { shocks, frame, bpmQueue, stopQueue } = gameEngine.globalParams;

    const arrows = gameEngine.globalParams.arrows.map((arrow) => {
      return new StaticArrow(arrow);
    });

    const freezes = gameEngine.globalParams.freezes.map((freeze) => {
      return new StaticArrow(freeze);
    });

    let mods = gameEngine.globalParams.mods;
    mods = JSON.parse(JSON.stringify(mods));

    const tick = { beatTick: 0, timeTick: 0 };

    mods.speed = 1;

    const speedMod = mods.speed;

    /*
      Use a temporarily hardcoded number of measures per column to figure out the
      height of the canvas. (1 measure @ 1x = 256px)
      Then calculate the number of columns required to draw every measure to figure out
      the width of the canvas. (The arrows take up 256px width for each column, and the
      space between each column takes up another 256px. So every column effectively takes
      up 512px width)
    */

    const finalBeat = gameEngine.globalParams.finalBeat;
    const numMeasures = finalBeat / 4;

    let calcCanvasHeight = STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn;
    calcCanvasHeight += STATIC_ARROW_HEIGHT; // one arrow height worth of padding on bottom
    setCanvasHeight(calcCanvasHeight);

    const numColumns = Math.ceil(numMeasures / measuresPerColumn);

    const calcCanvasWidth = columnWidth * numColumns;
    setCanvasWidth(calcCanvasWidth);

    setCanvasReady(true);

    // render the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");

    // black background
    c.fillStyle = "black";
    c.fillRect(0, 0, calcCanvasWidth, calcCanvasHeight);

    // draw each column
    for (let i = 0; i < numColumns; i++) {
      const columnStart = i * columnWidth + STATIC_ARROW_WIDTH * 2;
      c.fillStyle = "black";
      c.fillRect(columnStart, 0, STATIC_ARROW_WIDTH * 4, calcCanvasHeight);
      const guidelines = new StaticGuidelines(gameEngine.globalParams.finalBeat);
      guidelines.render(canvas, tick, {
        mods,
        columnIdx: i,
        columnWidth,
        measuresPerColumn,
        bpmQueue,
        stopQueue,
      });
    }

    for (let i = 0; i < shocks.length; i++) {
      const shock = shocks[i];
      shock.render(canvas, frame, tick, {
        mods,
        staticAttrs: {
          columnIdx: Math.floor(shock.measureIdx / measuresPerColumn),
          columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
        },
      });
    }

    for (let i = 0; i < freezes.length; i++) {
      const freeze = freezes[i];
      [0, 1, 2, 3].forEach((directionIdx) => {
        freeze.renderFreezeBody(canvas, tick, directionIdx, {
          mods,
          columnIdx: Math.floor(freeze.measureIdx / measuresPerColumn),
          columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
          measuresPerColumn,
        });
      });
    }

    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      [0, 1, 2, 3].forEach((directionIdx) => {
        arrow.renderArrow(canvas, tick, directionIdx, {
          mods,
          columnIdx: Math.floor(arrow.measureIdx / measuresPerColumn),
          columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
          measuresPerColumn,
        });
      });
    }

    scaleCanvas(canvas, canvasScaleFactor);
  }, [modalOpen, canvasHeight, canvasWidth]);

  const onCanvasClick = (e) => {
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const leftEdge = STATIC_ARROW_WIDTH * 2 * canvasScaleFactor + canvasRect.x;

    if (e.clientX < leftEdge) return;

    const scaledColumnWidth = columnWidth * canvasScaleFactor;

    const cx = (e.clientX - leftEdge) % scaledColumnWidth;
    if (cx > scaledColumnWidth / 2) return;

    const columnIdx = Math.floor((e.clientX - leftEdge) / scaledColumnWidth);

    const topEdge = (STATIC_ARROW_HEIGHT / 2) * canvasScaleFactor + canvasRect.y;
    if (e.clientY < topEdge) return;

    const cy = e.clientY - topEdge;

    const beatIdx = Math.floor(cy / (STATIC_ARROW_HEIGHT * canvasScaleFactor));

    if (beatIdx >= measuresPerColumn * 4) return;

    const beatNum = columnIdx * measuresPerColumn * 4 + beatIdx;

    // Figure out how to use the beat number to skip to the corresponding chart progress.
    const progressTs = seekProgress(beatNum);
    AudioPlayer.seekTime(progressTs);

    handleClose();
  };

  // Given a beat index, iterate through the arrows until the last arrow with a beatstamp earlier or
  // equal to the beat number is found. Then use that arrow's timestamp to skip to some chart
  // progress based on that timestamp.
  const seekProgress = (beatNum) => {
    const arrows = gameEngine.globalParams.allArrows;
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      if (arrow.beatstamp > beatNum) {
        if (i - 1 >= 0) {
          return arrows[i - 1].timestamp;
        } else {
          return arrow.timestamp;
        }
      }
    }
    return arrows[arrows.length - 1].timestamp;
  };

  const handleOpen = () => {
    setModalOpen(true);
  };
  const handleClose = () => {
    setModalOpen(false);
    setCanvasReady(false);
    setCanvasHeight(0);
  };

  if (canvasReady) {
    return (
      <Modal className="staticModal" open={modalOpen} onOpen={handleOpen} onClose={handleClose}>
        <div className="staticChart-container">
          <canvas
            id="staticChart"
            ref={canvasRef}
            height={canvasHeight}
            width={canvasWidth}
            onClick={onCanvasClick}
          ></canvas>
        </div>
      </Modal>
    );
  }

  return null;
};

const mapStateToProps = (state) => {
  const { mods, songSelect, screen, simfiles } = state;
  const { song, difficulty, mode } = songSelect;
  return {
    mods,
    sm: simfiles.sm,
    song,
    difficulty,
    mode,
    screen,
  };
};

const mapDispatchToProps = () => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(StaticModal);
