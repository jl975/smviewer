import { gsap } from "gsap";

import Arrow from "../components/chart/canvas/Arrow";
import StepZone from "../components/chart/canvas/StepZone";
import parseSimfile from "../utils/parseSimfile";
import { applyTurnMods } from "../utils/engineUtils";

class GameEngine {
  // c: canvas context
  constructor(canvas, sm) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.tl = gsap.timeline();
    this.sm = sm;
    this.simfiles = {};

    this.activeSimfile = null;
    this.eventList = [];
    this.arrows = [];

    this.currentBeat = 0;

    this.drawBackground();
    this.stepZone = new StepZone({ canvas });

    // init logic
    if (this.sm) {
      this.simfiles = parseSimfile(this.sm);
    }

    if (Object.keys(this.simfiles).length) {
      // console.log("GameEngineNew this.simfiles", this.simfiles);
    }

    this.mainLoop();

    // this.tl.pause();
  }

  // bpm changes and stops converted to timestamps
  generateEventList(simfile) {
    // console.log("generateEventList simfile", simfile);

    const { bpms, stops } = simfile;
    const eventList = [];
    let bpmPtr = 0,
      stopPtr = 0;
    let currentBpm = bpms[0].value;
    while (bpmPtr < bpms.length && stopPtr < stops.length) {
      const bpm = bpms[bpmPtr];
      const stop = stops[stopPtr];
      // add stop event, keeping track of the bpm at this point
      if (stop.beat <= bpm.beat) {
        eventList.push({ ...stop, bpm: currentBpm, type: "stop" });
        stopPtr++;
      }
      // add bpm event, replacing the currently tracked bpm
      else {
        eventList.push({ ...bpm, type: "bpm" });
        currentBpm = bpm.value;
        bpmPtr++;
      }
    }
    while (bpmPtr < bpms.length) {
      eventList.push({ ...bpms[bpmPtr], type: "bpm" });
      bpmPtr++;
    }
    while (stopPtr < stops.length) {
      eventList.push({ ...stops[stopPtr], type: "stop" });
      stopPtr++;
    }

    eventList[0].timestamp = 0;

    for (let i = 1; i < eventList.length; i++) {
      const prevEvent = eventList[i - 1];
      const currentEvent = eventList[i];
      const prevTimestamp = eventList[i - 1].timestamp;

      // Find the number of beats elapsed between the current and previous event,
      // then convert this into seconds using the bpm at the previous event.
      // If the previous event was a stop, add the length of the stop.
      // The timestamp of the current event is this number of seconds after the
      // timestamp of the previous event.
      const beatDiff = currentEvent.beat - prevEvent.beat;
      const prevBpm =
        prevEvent.type === "bpm" ? prevEvent.value : prevEvent.bpm;
      let timestampDiff = (beatDiff / prevBpm) * 60;
      if (prevEvent.type === "stop") timestampDiff += prevEvent.value;
      const currentTimestamp = prevTimestamp + timestampDiff;

      currentEvent.timestamp = currentTimestamp;
    }
    this.eventList = eventList;
    return eventList;
  }

  generateArrows(simfile, mods, eventList) {
    let { chart } = simfile;
    // console.log("generateArrows eventList", eventList);
    // console.log("generateArrows mods", mods);

    if (Array.isArray(chart[0])) {
      const newChart = [];
      chart.forEach(measure => {
        newChart.push(...measure);
      });
      chart = newChart;
    }

    chart = applyTurnMods(chart, mods);

    chart.forEach((note, key) => {
      // calculate starting position currentBeatPosition
      const { measureIdx, measureN, measureD } = note;
      note.currentBeatPosition = (measureIdx + measureN / measureD) * 4;

      // If the note is the tail of a freeze arrow, calculate the number of beats
      // from the head of the freeze arrow
      for (let i = 0; i < note.note.length; i++) {
        if (note.note[i] !== "3") continue;

        // Find the most recent freeze head on the same direction as the tail
        // and retroactively fill in the length of the hold in beats
        for (let j = key - 1; j >= 0; j--) {
          if (chart[j].note[i] === "2") {
            if (!chart[j].holdBeats) chart[j].holdBeats = [];
            if (!note.holdBeats) note.holdBeats = [];
            chart[j].holdBeats[i] =
              note.currentBeatPosition - chart[j].currentBeatPosition;
            note.holdBeats[i] =
              note.currentBeatPosition - chart[j].currentBeatPosition;
            break;
          }
        }
      }
    });

    chart.forEach((note, key) => {
      const arrow = new Arrow({ key, ...note, mods });
      this.arrows.push(arrow);
    });

    // console.log("this.arrows", this.arrows);

    // console.log(`chart for ${simfile.difficulty}`, chart);
  }

  initTimeline() {
    let tl = this.tl;

    let bpm = this.eventList[0].value;
    // console.log(this.eventList);

    this.arrows.forEach(arrow => {
      const duration = (arrow.currentBeatPosition / bpm) * 60;
      tl = tl.to(
        arrow,
        { currentBeatPosition: 0, duration, ease: "none" },
        "<"
      );
    });
  }

  mainLoop() {
    this.drawBackground();
    this.stepZone.render(0);

    // render arrows in the opposite order so the earlier arrows are layered over the later ones
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.render(this.canvas);
    }

    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  drawBackground() {
    this.c.fillStyle = "black";
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toggleTl() {
    this.tl.paused() ? this.tl.play() : this.tl.pause();
  }
  restartTl() {
    this.tl.restart().pause();
  }
  pauseTl() {
    this.tl.pause();
  }

  yeet() {
    // this.testArrow.y *= 2;
  }
}

export default GameEngine;
