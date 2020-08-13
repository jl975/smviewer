import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import { Modal, Button } from "semantic-ui-react";

import Guidelines from "./canvas/Guidelines";
import { scaleCanvas } from "../../utils/canvasUtils";
import { ARROW_HEIGHT, ARROW_WIDTH } from "../../constants";

const tempCanvas = document.createElement("canvas");
const tctx = tempCanvas.getContext("2d");

const canvasScaleFactor = 0.5;

const StaticModal = props => {
  const { modalOpen, setModalOpen, gameEngine, sm } = props;

  const canvasRef = useRef(null);

  const [canvasHeight, setCanvasHeight] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");

    console.log(gameEngine.globalParams);

    const { allArrows } = gameEngine;

    // c.fillStyle = "black";
    // c.fillRect(0, 0, 256, canvas.height);

    const { arrows, freezes, shocks, mods, frame } = gameEngine.globalParams;
    const tick = { beatTick: 0, timeTick: 0 };
    console.log("mods", mods);

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
    console.log("numMeasures", numMeasures);

    // temp hardcode
    const measuresPerColumn = 8;

    const columnWidth = ARROW_WIDTH * 4 * 2;

    let calcCanvasHeight = ARROW_HEIGHT * 4 * mods.speed * measuresPerColumn;
    calcCanvasHeight += ARROW_HEIGHT; // one arrow height worth of padding on bottom
    setCanvasHeight(calcCanvasHeight);
    console.log("canvasHeight", calcCanvasHeight);

    const numColumns = Math.ceil(numMeasures / measuresPerColumn);

    const calcCanvasWidth = columnWidth * numColumns;
    setCanvasWidth(calcCanvasWidth);
    console.log("canvasWidth", calcCanvasWidth);

    // draw each column
    for (let i = 0; i < numColumns; i++) {
      c.fillStyle = "black";
      c.fillRect(
        i * columnWidth + ARROW_WIDTH * 2,
        0,
        ARROW_WIDTH * 4,
        calcCanvasHeight
      );
    }

    const guidelines = new Guidelines(gameEngine.globalParams.finalBeat);
    guidelines.render(canvas, tick, { mods });

    for (let i = 0; i < shocks.length; i++) {
      const shock = shocks[i];
      shock.render(canvas, frame, tick, {
        mods,
        staticAttrs: {
          columnIdx: Math.floor(shock.measureIdx / measuresPerColumn),
          columnHeight: ARROW_HEIGHT * 4 * mods.speed * measuresPerColumn
        }
      });
    }

    for (let i = 0; i < freezes.length; i++) {
      const freeze = freezes[i];
      [0, 1, 2, 3].forEach(directionIdx => {
        freeze.renderFreezeBody(canvas, tick, directionIdx, {
          mods,
          staticAttrs: {
            columnIdx: Math.floor(freeze.measureIdx / measuresPerColumn),
            columnHeight: ARROW_HEIGHT * 4 * mods.speed * measuresPerColumn
          }
        });
      });
    }

    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i];
      [0, 1, 2, 3].forEach(directionIdx => {
        arrow.renderArrow(canvas, tick, directionIdx, {
          mods,
          staticAttrs: {
            columnIdx: Math.floor(arrow.measureIdx / measuresPerColumn),
            columnHeight: ARROW_HEIGHT * 4 * mods.speed * measuresPerColumn
          }
          // static: {
          //   row: arrow.measureIdx % measuresPerColumn,
          //   column: Math.floor(arrow.measureIdx / measuresPerColumn)
          // }
        });
      });
    }

    scaleCanvas(canvas, canvasScaleFactor);

    console.log("canvas height:", canvas.height);
    console.log("canvas width", canvas.width);
  }, [modalOpen, canvasHeight, canvasWidth]);

  return (
    <Modal
      className="staticModal"
      open={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      <div className="staticChart-container">
        <canvas
          id="staticChart"
          ref={canvasRef}
          height={canvasHeight}
          width={canvasWidth}
          // height={50000}
          // width={64 * 4}
        ></canvas>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => {
  const { mods, songSelect, screen, simfiles } = state;
  const { song, difficulty, mode } = songSelect;
  return {
    mods,
    sm: simfiles.sm,
    song,
    difficulty,
    mode,
    screen
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(StaticModal);
