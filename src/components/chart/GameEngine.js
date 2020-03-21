import React, { useState, useEffect } from "react";

import Arrow from "./canvas/ArrowOld";
import StepZone from "./canvas/StepZone";
import { DIRECTIONS, ARROW_HEIGHT, ARROW_WIDTH } from "../../constants";

import TEMP_SIMFILE from "../../simfiles/sample_orca";

const GameEngine = props => {
  const { canvas } = props;

  const [stepZone] = useState(new StepZone({ canvas }));

  const [music, setMusic] = useState(null);

  let bpm;
  let speedMod = 2.5;

  let noteskin = "note";

  let beginningBeatOffset = 0;

  let beat = 0;

  let arrows = [];

  const bpmChangeValues = [];
  let bpmChangeIdx = -1;
  let nextBpmChangeBeat = -1;

  const stopValues = [];
  let stopIdx = -1;
  let nextStopBeat = Infinity;
  let stoppedBeats = -1; // starts counting number of beats from the start of a stop; -1 if not stopped

  let paused = false;

  // useEffect(() => {
  //   init();
  // }, []);

  const getCanvas = () => {
    return props.canvas;
  };

  const parseSimfile = simfile => {
    arrows.length = 0;

    const { bpms, stops, chart } = simfile;
    const canvas = getCanvas();

    // parse bpm changes and stops
    bpms.split(",").forEach(bpmChange => {
      const [bpmChangeBeat, bpmValue] = bpmChange.split("=");
      bpmChangeValues.push([parseFloat(bpmChangeBeat), parseFloat(bpmValue)]);
    });
    console.log("bpmChangeValues", bpmChangeValues);

    stops.split(",").forEach(stop => {
      const [stopBeat, stopValue] = stop.split("=");
      stopValues.push([parseFloat(stopBeat), parseFloat(stopValue)]);
    });

    console.log("stopValues", stopValues);

    // parse notes
    const measures = chart.split(",");
    measures.forEach((measure, measureIdx) => {
      measure = measure.trim();
      const measureDivisions = measure.split("\n");
      const measureLength = measureDivisions.length;

      measureDivisions.forEach((division, divisionIdx) => {
        const notes = division.split("");

        notes.forEach((note, directionIdx) => {
          if (note == 1 || note == 2) {
            const direction = DIRECTIONS[directionIdx];

            const beatScrollValue =
              measureIdx * 4 + (divisionIdx / measureLength) * 4;
            const scrollY =
              0 +
              ARROW_HEIGHT * speedMod * (beginningBeatOffset + beatScrollValue);

            // FIXME: change logic to accommodate for vivid and rainbow

            let beatQuantValue = ((divisionIdx / measureLength) * 4) % 1;

            // console.log(
            //   `${direction} (measure ${measureIdx}, division ${divisionIdx} of ${measureLength}, beatQuantValue ${beatQuantValue})`
            // );

            let quantization;
            if (beatQuantValue === 0) quantization = 4;
            else if (beatQuantValue === 0.5) quantization = 8;
            else if (beatQuantValue === 0.25 || beatQuantValue === 0.75)
              quantization = 16;
            else quantization = 12;

            const arrowAttrs = {
              canvas,
              direction,
              noteskin,
              quantization,
              divisionIdx,
              measureLength,
              scrollY,
            };
            arrows.push(new Arrow(arrowAttrs));
          }
        });
      });

      // console.log(JSON.stringify(measure));
    });
  };

  // console.log("arrows", arrows);

  const mainLoop = () => {
    const canvas = getCanvas();
    const c = canvas.getContext("2d");
    const mods = { speedMod };

    drawBackground(c);

    checkForStop(beat);
    checkForBpmChange(beat);

    if (stepZone) {
      stepZone.render(beat, bpm, mods);
    }

    arrows.forEach(arrow => {
      arrow.render(beat, bpm, mods);
    });
  };

  const drawBackground = c => {
    const canvas = getCanvas();
    c.fillStyle = "black";
    c.fillRect(0, 0, canvas.width, canvas.height);
  };

  const checkForBpmChange = currentBeat => {
    // console.log(currentBeat);
    if (currentBeat > nextBpmChangeBeat) {
      bpmChangeIdx++;
      bpm = bpmChangeValues[bpmChangeIdx][1];

      console.log("bpm changed to", bpm);

      if (bpmChangeValues[bpmChangeIdx + 1]) {
        nextBpmChangeBeat = bpmChangeValues[bpmChangeIdx + 1][0];
      } else {
        nextBpmChangeBeat = Infinity;
      }
    }
  };

  const checkForStop = currentBeat => {
    // first frame that a stop is detected, not currently mid-stop
    if (currentBeat > nextStopBeat) {
      stopIdx++;
      const stopValue = stopValues[stopIdx][1];

      console.log("stop for", stopValue, "seconds");

      if (stopValues[stopIdx + 1]) {
        nextStopBeat = stopValues[stopIdx + 1][0];
      } else {
        nextStopBeat = Infinity;
      }

      paused = true;
      setTimeout(() => {
        paused = false;
        console.log("resume chart");
      }, stopValue * 1000);
    }
  };

  const init = () => {
    const canvas = getCanvas();
    paused = false;

    parseSimfile(TEMP_SIMFILE);

    if (stopValues.length) {
      nextStopBeat = stopValues[0][0];
    }

    let audio = new Audio(`audio/ORCA.ogg`);
    setMusic(audio);
    audio.play();

    setInterval(() => {
      if (!paused) {
        mainLoop();
        beat += bpm / 3600;
      }
    }, 1000 / 60);
  };

  return null;
};

export default GameEngine;
