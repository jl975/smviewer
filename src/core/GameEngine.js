import { gsap } from "gsap";

import Arrow from "../components/chart/canvas/Arrow";
import ShockArrow from "../components/chart/canvas/ShockArrow";
import StepZone from "../components/chart/canvas/StepZone";
import Guidelines from "../components/chart/canvas/Guidelines";
import parseSimfile from "../utils/parseSimfile";
import { applyTurnMods } from "../utils/engineUtils";
import { GLOBAL_OFFSET, END_EXTRA_BEATS } from "../constants";
import AudioPlayer from "./AudioPlayer";
import store from "../store";
import * as actions from "../actions/ChartActions";

class GameEngine {
  constructor(canvas, sm) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    this.tl = gsap.timeline();
    this.sm = sm;
    this.simfiles = {};

    this.eventList = [];
    this.arrows = [];
    this.shockArrows = [];

    this.mainLoopRequestRef = null;

    this.drawBackground();

    this.globalParams = {
      /*
        Use this parameter to keep track of which beat the chart is on at any given point.
        Animate this one property in the timeline, then reference its value to calculate frames
        for step zone and arrow animations without having to create separate tweens for them.
      */
      beatTick: 0,

      /*
        Use this parameter for animations based on absolute frame and not a function of the beat.
      */
      frame: 0,

      bpmChangeQueue: [],
    };

    // init logic
    if (this.sm) {
      this.simfiles = parseSimfile(this.sm);
    }

    AudioPlayer.startAnimationLoop = this.startLoop.bind(this);
    AudioPlayer.stopAnimationLoop = this.stopLoop.bind(this);
    AudioPlayer.updateAnimationLoopOnce = this.updateLoopOnce.bind(this);
  }

  startLoop() {
    this.mainLoopRequestRef = window.requestAnimationFrame(
      this.mainLoop.bind(this)
    );
  }
  stopLoop() {
    window.cancelAnimationFrame(this.mainLoopRequestRef);
  }
  updateLoopOnce() {
    window.requestAnimationFrame(this.mainLoop.bind(this, false));
  }

  // bpm changes and stops converted to timestamps
  generateEventList(simfile) {
    const { bpms, stops } = simfile;
    const eventList = [];
    let bpmPtr = 0,
      stopPtr = 0;
    let currentBpm = bpms[0].value;

    // console.log("generateEventList bpms", bpms);
    // console.log("generateEventList stops", stops);

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

        this.globalParams.bpmChangeQueue.push(bpm);

        bpmPtr++;
      }
    }
    while (bpmPtr < bpms.length) {
      eventList.push({ ...bpms[bpmPtr], type: "bpm" });
      this.globalParams.bpmChangeQueue.push(bpms[bpmPtr]);
      bpmPtr++;
    }
    while (stopPtr < stops.length) {
      eventList.push({ ...stops[stopPtr], bpm: currentBpm, type: "stop" });
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

    // store.dispatch(actions.setBpmChangeQueue(this.globalParams.bpmChangeQueue));

    this.eventList = eventList;
    return eventList;
  }

  generateArrows(simfile, mods) {
    let { chart } = simfile;

    if (Array.isArray(chart[0])) {
      const newChart = [];
      chart.forEach((measure) => {
        newChart.push(...measure);
      });
      chart = newChart;
    }

    chart = applyTurnMods(chart, mods);

    chart.forEach((note, key) => {
      // calculate starting position currentBeatPosition
      const { measureIdx, measureN, measureD } = note;
      note.currentBeatPosition = (measureIdx + measureN / measureD) * 4;

      // save its original position for later reference
      note.originalBeatPosition = note.currentBeatPosition;

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
      if (note.note[0] === "M" || note.note[4] === "M") {
        const shockArrow = new ShockArrow({ key, ...note, mods });
        this.shockArrows.push(shockArrow);
      } else {
        const arrow = new Arrow({ key, ...note, mods });
        this.arrows.push(arrow);
      }
    });

    this.stepZone = new StepZone();

    // console.log("this.arrows", this.arrows);

    // console.log("this.shockArrows", this.shockArrows);

    // console.log(`chart for ${simfile.difficulty}`, chart);
  }

  // Calculate the gsap tweens before playing the chart
  initTimeline(mods) {
    // console.log("this.eventList", this.eventList);

    this.resetArrows();

    /*
      The space in between each event (i.e. a bpm change or stop) denotes a continous section of constant bpm.
      Create a tween to animate the global beat tick for each of these sections and chain them together.
      The position and/or frame animation of each canvas object (e.g. arrows, step zone, guidelines) can be
      determined as a function of the beat tick value at any given point.
    */
    let bpm;

    let accumulatedBeatTick = 0;

    // Designate the "end" of the chart as an arbitrary number of beats (8?) after either the last arrow
    // or the last event in the chart, whichever comes later
    const lastArrow = this.arrows[this.arrows.length - 1];
    const lastEvent = this.eventList[this.eventList.length - 1];

    let finalBeat = 0;
    if (lastArrow && lastEvent) {
      finalBeat = Math.max(lastArrow.originalBeatPosition, lastEvent.beat);
    } else if (lastArrow) {
      finalBeat = lastArrow.originalBeatPosition;
    } else if (lastEvent) {
      finalBeat = lastEvent.beat;
    }
    finalBeat += END_EXTRA_BEATS;

    // hack to implement global offset of -12 ms
    this.tl = this.tl.to({}, { duration: 0 }, GLOBAL_OFFSET);

    for (let i = 0; i < this.eventList.length; i++) {
      let startEvent = this.eventList[i],
        endEvent = this.eventList[i + 1];

      // delay the animations by the length of the stop, if applicable
      let delay = startEvent.type === "stop" ? startEvent.value : 0;

      // the bpm of this section
      if (startEvent.type === "bpm") bpm = startEvent.value;
      else if (startEvent.type === "stop") bpm = startEvent.bpm;

      // if there is a bpm change or stop event somewhere ahead of this one
      if (endEvent) {
        // number of beats between startEvent and endEvent, i.e. how long this constant bpm section is
        const sectionBeatLength = endEvent.beat - startEvent.beat;

        // the duration of this constant bpm section in seconds
        const sectionDuration = (sectionBeatLength / bpm) * 60;

        this.tl = this.tl.to(
          this.globalParams,
          {
            beatTick: accumulatedBeatTick + sectionBeatLength,
            duration: sectionDuration,
            ease: "none",
            onStart: () => {
              if (startEvent.type === "bpm") {
                store.dispatch(actions.changeActiveBpm(startEvent.value));
              }
            },
          },
          `+=${delay}`
        );
        accumulatedBeatTick += sectionBeatLength;
      }
      // if this is the last bpm change/stop event, animate remaining objects to end
      else {
        this.tl = this.tl.to(
          this.globalParams,
          {
            beatTick: finalBeat,
            duration: ((finalBeat - accumulatedBeatTick) / bpm) * 60,
            ease: "none",
            onStart: () => {
              if (startEvent.type === "bpm") {
                store.dispatch(actions.changeActiveBpm(startEvent.value));
              }
            },
          },
          `+=${delay}`
        );
      }
    }

    this.guidelines = new Guidelines({ mods, finalBeat });
    AudioPlayer.setTimeline(this.tl);
    AudioPlayer.setGlobalParams(this.globalParams);

    this.updateLoopOnce();
    // hack
  }

  resetArrows() {
    this.arrows.forEach((arrow) => arrow.reset());
  }

  mainLoop(loop = true) {
    // console.log("mainLoop running");
    this.drawBackground();

    if (this.stepZone) {
      this.stepZone.render(this.canvas, this.globalParams.beatTick);
    }
    if (this.guidelines) {
      this.guidelines.render(this.canvas, this.globalParams.beatTick);
    }

    for (let i = this.shockArrows.length - 1; i >= 0; i--) {
      const shockArrow = this.shockArrows[i];
      shockArrow.render(
        this.canvas,
        this.globalParams.frame,
        this.globalParams.beatTick
      );
    }

    // render arrows in the opposite order so the earlier arrows are layered over the later ones
    for (let i = this.arrows.length - 1; i >= 0; i--) {
      const arrow = this.arrows[i];
      arrow.render(this.canvas, this.globalParams.beatTick);
    }

    // if (this.globalParams.beatTick) {
    //   console.log(this.globalParams.beatTick);
    // }
    this.globalParams.frame++;

    if (loop) {
      this.mainLoopRequestRef = window.requestAnimationFrame(
        this.mainLoop.bind(this)
      );
    }
  }

  drawBackground() {
    this.c.fillStyle = "black";
    this.c.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toggleTl() {
    if (this.tl.paused()) {
      console.log("tl.play()");
      this.tl.play();
    } else {
      console.log("tl.pause()");
      this.tl.pause();
    }
  }
  restartTl() {
    // console.log("call restart");
    this.tl.restart().pause();
    this.resetArrows();
  }
  pauseTl() {
    this.tl.pause();
  }
}

export default GameEngine;
