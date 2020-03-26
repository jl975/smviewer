import { gsap } from "gsap";

import Arrow from "../components/chart/canvas/Arrow";
import ShockArrow from "../components/chart/canvas/ShockArrow";
import StepZone from "../components/chart/canvas/StepZone";
import parseSimfile from "../utils/parseSimfile";
import { applyTurnMods } from "../utils/engineUtils";
import { GLOBAL_OFFSET, ARROW_HEIGHT } from "../constants";

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
    this.shockArrows = [];

    this.currentBeat = 0;

    this.drawBackground();
    this.stepZone = new StepZone();

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
    };

    // init logic
    if (this.sm) {
      this.simfiles = parseSimfile(this.sm);
    }

    this.mainLoop();
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
        bpmPtr++;
      }
    }
    while (bpmPtr < bpms.length) {
      eventList.push({ ...bpms[bpmPtr], type: "bpm" });
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
    this.eventList = eventList;
    return eventList;
  }

  generateArrows(simfile, mods) {
    let { chart } = simfile;

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

    // console.log("this.arrows", this.arrows);

    // console.log("this.shockArrows", this.shockArrows);

    // console.log(`chart for ${simfile.difficulty}`, chart);
  }

  // Calculate the gsap tweens before playing the chart
  initTimeline() {
    // console.log("this.eventList", this.eventList);

    this.resetArrows();

    /*
      The space in between each event (i.e. a bpm change or stop) denotes a continous section of constant bpm.
      For each section, create a sequence of chained tweens including all the notes that have not yet been
      hit prior to the beginning of the section.
      For each note in any given section:
      - If this section contains the note, animate its currentBeatPosition to 0. Set its duration to the
        length of time between its beat value and the starting beat of the section.
      - If the note comes after this section is over, set its duration to the length of the section. Animate
        its currentBeatPosition to its beatValue minus the ending beat of the section.
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
    finalBeat += 8;

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

      let firstArrowChained = false;

      // if there is a bpm change or stop event somewhere ahead of this one
      if (endEvent) {
        // number of beats between startEvent and endEvent, i.e. how long this constant bpm section is
        const sectionBeatLength = endEvent.beat - startEvent.beat;

        // the duration of this constant bpm section in seconds
        const sectionDuration = (sectionBeatLength / bpm) * 60;

        this.tl = this.tl.to(this.globalParams, {
          beatTick: accumulatedBeatTick + sectionBeatLength,
          duration: sectionDuration,
          ease: "none",
        });
        accumulatedBeatTick += sectionBeatLength;

        this.arrows.forEach(arrow => {
          let beatsFromStart = arrow.originalBeatPosition - startEvent.beat;
          // ignore arrows that have already passed
          if (beatsFromStart < 0) return;

          // if arrow exists within this section
          if (endEvent.beat > arrow.originalBeatPosition) {
            const duration = (beatsFromStart / bpm) * 60;
            this.tl = this.tl.to(
              arrow,
              { currentBeatPosition: 0, duration, ease: "none" },
              firstArrowChained ? "<" : `<${delay}`
            );
          }
          // if arrow comes after this section
          else {
            const duration = sectionDuration;
            const endingBeatValue = arrow.originalBeatPosition - endEvent.beat;
            this.tl = this.tl.to(
              arrow,
              {
                currentBeatPosition: endingBeatValue,
                duration,
                ease: "none",
              },
              firstArrowChained ? "<" : `<${delay}`
            );
          }

          if (!firstArrowChained) firstArrowChained = true;
        });

        this.shockArrows.forEach(arrow => {
          let beatsFromStart = arrow.originalBeatPosition - startEvent.beat;
          // ignore arrows that have already passed
          if (beatsFromStart < 0) return;

          // if arrow exists within this section
          if (endEvent.beat > arrow.originalBeatPosition) {
            const extraBeatTime = 60 / (arrow.speed * bpm); // amount of time it takes to travel one extra arrow height
            const duration = (beatsFromStart / bpm) * 60 + extraBeatTime;
            this.tl = this.tl.to(
              arrow,
              { currentBeatPosition: -1 / arrow.speed, duration, ease: "none" }, // animate one extra arrow height past target
              firstArrowChained ? "<" : `<${delay}`
            );
          }
          // if arrow comes after this section
          else {
            const duration = sectionDuration;
            const endingBeatValue = arrow.originalBeatPosition - endEvent.beat;
            this.tl = this.tl.to(
              arrow,
              {
                currentBeatPosition: endingBeatValue,
                duration,
                ease: "none",
              },
              firstArrowChained ? "<" : `<${delay}`
            );
          }

          if (!firstArrowChained) firstArrowChained = true;
        });
      }
      // if this is the last bpm change/stop event, animate remaining arrows to end
      else {
        this.tl = this.tl.to(this.globalParams, {
          beatTick: finalBeat,
          duration: ((finalBeat - accumulatedBeatTick) / bpm) * 60,
          ease: "none",
        });

        this.arrows.forEach(arrow => {
          let beatsFromStart = arrow.originalBeatPosition - startEvent.beat;
          // ignore arrows that have already passed
          if (beatsFromStart < 0) return;
          const duration = (beatsFromStart / bpm) * 60;

          this.tl = this.tl.to(
            arrow,
            { currentBeatPosition: 0, duration, ease: "none" },
            firstArrowChained ? "<" : `<${delay}`
          );
          if (!firstArrowChained) firstArrowChained = true;
        });

        this.shockArrows.forEach(arrow => {
          let beatsFromStart = arrow.originalBeatPosition - startEvent.beat;
          // ignore arrows that have already passed
          if (beatsFromStart < 0) return;
          const extraBeatTime = 60 / (arrow.speed * bpm);
          const duration = (beatsFromStart / bpm) * 60 + extraBeatTime;

          this.tl = this.tl.to(
            arrow,
            { currentBeatPosition: -1 / arrow.speed, duration, ease: "none" },
            firstArrowChained ? "<" : `<${delay}`
          );
          if (!firstArrowChained) firstArrowChained = true;
        });
      }
    }
  }

  resetArrows() {
    this.arrows.forEach(arrow => arrow.reset());
  }

  mainLoop() {
    // if (this.tl.paused()) return;
    // console.log("mainLoop running");
    this.drawBackground();
    this.stepZone.render(this.canvas, this.globalParams.beatTick);

    for (let i = this.shockArrows.length - 1; i >= 0; i--) {
      const shockArrow = this.shockArrows[i];
      shockArrow.render(this.canvas, this.globalParams.frame);
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
    // console.log("call restart");
    this.tl.restart().pause();
    this.resetArrows();
  }
  pauseTl() {
    this.tl.pause();
  }

  yeet() {
    // this.testArrow.y *= 2;
  }
}

export default GameEngine;
