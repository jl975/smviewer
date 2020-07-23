import { gsap } from "gsap";

import Arrow from "../components/chart/canvas/Arrow";
import ShockArrow from "../components/chart/canvas/ShockArrow";
import StepZone from "../components/chart/canvas/StepZone";
import Guidelines from "../components/chart/canvas/Guidelines";
import TargetFlash from "../components/chart/canvas/TargetFlash";
import ComboDisplay from "../components/chart/canvas/ComboDisplay";
import BpmAndStopDisplay from "../components/chart/canvas/BpmAndStopDisplay";
import LaneCover from "../components/chart/canvas/LaneCover";
import {
  applyTurnMods,
  initializeBeatWindow,
  updateBeatWindow,
  changeActiveBpm
} from "../utils/engineUtils";
import {
  END_EXTRA_BEATS,
  MARVELOUS_FLASH_FRAMES,
  DEFAULT_CMOD
} from "../constants";
import AudioPlayer from "./AudioPlayer";
import store from "../store";
import { debugLogView, debugSimfileChart } from "../utils/debugUtils";

class GameEngine {
  constructor(canvas, simfiles, chartParams) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d");
    // this.sm = sm;
    this.simfiles = simfiles;

    this.tl = gsap.timeline();
    this.eventList = [];
    this.arrows = [];
    this.shocks = [];
    this.freezes = [];
    this.allArrows = [];

    this.mainLoopRequestRef = null;

    this.bpmReel = document.getElementById("bpmReel");
    this.stopReel = document.getElementById("stopReel");

    this.drawBackground();

    this.globalParams = {
      /*
        Use this parameter to keep track of which beat the chart is on at any given point.
        Animate this one property in the timeline, then reference its value to calculate frames
        for step zone and arrow animations without having to create separate tweens for them.
      */
      beatTick: 0,

      /*
        Use this parameter to animate values that can be tracked as a continuous function of time,
        e.g. position of arrows/guidelines on a cmod.
        Not intended to be used for events that happen at discrete timestamps, such as combo updates and target flashes
      */
      timeTick: 0,

      /*
        Use this parameter for animations based on absolute frame and not a function of the beat.
      */
      frame: 0,

      combo: 0,
      bpmQueue: [], // this is the one that is used

      targetFlashes: {},

      /*
        Parameters related to scheduling the assist tick    
      */
      assist: {},

      // "global" variables for creating the timeline
      /*
        lol for lack of a better word. Refers to the last arrow or last bpm change/stop event,
        whichever comes later
      */
      lastEntity: null,

      /*
        The beat that the timeline ends on. Will be defined as the beat of the lastEntity
      */
      finalBeat: 0,

      /*
        Miscellaneous constant parameters for ease of access
      */
      chartAreaHeight: canvas.height
    };

    AudioPlayer.startAnimationLoop = this.startLoop.bind(this);
    AudioPlayer.stopAnimationLoop = this.stopLoop.bind(this);
    AudioPlayer.updateAnimationLoopOnce = this.updateLoopOnce.bind(this);

    // if (!this.sm) return;

    // init logic
    // this.simfiles = parseSimfile(this.sm, simfileType);
    // console.log("this.simfiles", this.simfiles);

    this.resetChart(chartParams);
  }

  resetChart({ mode, difficulty, mods }) {
    const { audio, songSelect } = store.getState();

    // kill the previous gsap timeline before creating a new one
    if (this.tl) {
      this.tl.kill();
    }
    this.tl = gsap.timeline();

    // reinitialize all chart-specific values
    this.eventList.length = 0;
    this.arrows.length = 0;
    this.freezes.length = 0;
    this.shocks.length = 0;
    this.allArrows.length = 0;

    this.globalParams.beatTick = 0;
    this.globalParams.timeTick = 0;
    this.globalParams.frame = 0;
    this.globalParams.combo = 0;
    this.globalParams.bpmQueue = [];
    this.globalParams.stopQueue = [];
    // this.globalParams.arrows = self.allArrows;
    this.globalParams.arrows = this.arrows;
    this.globalParams.freezes = this.freezes;
    this.globalParams.shocks = this.shocks;
    this.globalParams.allArrows = this.allArrows;

    this.globalParams.beatWindowStartPtr = {};
    this.globalParams.beatWindowEndPtr = {};
    this.globalParams.timeWindowStartPtr = {};
    this.globalParams.timeWindowEndPtr = {};

    this.globalParams.assist = {
      audioContext: new (window.AudioContext || window.webkitAudioContext)(),
      notesInQueue: [],
      nextNotePtr: null
    };

    this.globalParams.targetFlashes = {};
    this.globalParams.mods = mods;
    AudioPlayer.setGlobalParams(this.globalParams);

    AudioPlayer.initializeAssistTick();

    // debugging
    window.globalParams = this.globalParams;

    // recreate the chart with the new given parameters
    // then immediately seek to where the chart's progress was before it was recreated
    const simfile = this.simfiles[`${mode}_${difficulty}`];
    if (simfile) {
      debugSimfileChart(simfile);

      this.globalParams.offset = simfile.offset;

      this.generateEventList(simfile);
      this.generateArrows(simfile, mods);
      this.generateTimestamps();
      this.initTimeline(mods);
      this.restartTl();
      if (audio.chartAudio.status !== "playing") {
        this.pauseTl();
      }
      AudioPlayer.storePreviewSource(songSelect.song, simfile);

      AudioPlayer.resync();
    }
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
    this.clearBpmAndStopDisplay();
    window.requestAnimationFrame(this.mainLoop.bind(this, false));
  }

  updateExternalGlobalParams(params) {
    for (let param in params) {
      this.globalParams[param] = params[param];
    }
    initializeBeatWindow(this.globalParams);
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

      // stops before bpm changes when they fall on the same beat
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

    this.globalParams.bpmQueue = [eventList[0]];

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

      if (currentEvent.type === "bpm") {
        this.globalParams.bpmQueue.push(currentEvent);
      } else if (currentEvent.type === "stop") {
        this.globalParams.stopQueue.push(currentEvent);
      }
    }

    this.eventList = eventList;
    return eventList;
  }

  generateArrows(simfile, mods) {
    let { chart } = simfile;
    const mode = store.getState().songSelect.mode;

    if (Array.isArray(chart[0])) {
      const newChart = [];
      chart.forEach(measure => {
        newChart.push(...measure);
      });
      chart = newChart;
    }

    chart = applyTurnMods(chart, mods, mode);

    // calculate beat positions for each arrow
    chart.forEach((note, key) => {
      // calculate starting position currentBeatPosition
      const { measureIdx, measureN, measureD } = note;
      note.beatstamp = (measureIdx + measureN / measureD) * 4;

      // truncate to 3 decimal places in a consistent manner as stop beatstamps
      note.beatstamp = Math.floor(note.beatstamp * 1000) / 1000;
    });

    // generate arrays of arrows by category
    chart.forEach((note, key) => {
      if (note.note[0] === "M" || note.note[4] === "M") {
        const shockArrow = new ShockArrow({ key, ...note });
        this.shocks.push(shockArrow);
        this.allArrows.push(shockArrow);
      }
      if (
        note.note.includes("1") ||
        note.note.includes("2") ||
        note.note.includes("3")
      ) {
        const arrow = new Arrow({ key, ...note });
        this.arrows.push(arrow);
        this.allArrows.push(arrow);

        if (note.note.includes("2") || note.note.includes("3")) {
          this.freezes.push(arrow);
        }
      }
    });

    this.stepZone = new StepZone();
    this.comboDisplay = new ComboDisplay();
    this.laneCover = new LaneCover();

    // console.log("all arrows", this.allArrows);
    // console.log(`chart for ${simfile.difficulty}`, chart);
  }

  generateTimestamps() {
    // Designate the "end" of the chart as an arbitrary number of beats (8?) after either the last arrow
    // or the last event in the chart, whichever comes later
    const lastArrow = this.arrows[this.arrows.length - 1];
    const lastEvent = this.eventList[this.eventList.length - 1];

    if (lastArrow && lastEvent) {
      const lastArrowBeat = lastArrow.beatstamp;
      const lastEventBeat = lastEvent.beat;
      if (lastEventBeat > lastArrowBeat) {
        this.globalParams.finalBeat = lastEventBeat;
        this.globalParams.lastEntity = lastEvent;
      } else {
        this.globalParams.finalBeat = lastArrowBeat;
        this.globalParams.lastEntity = lastArrow;
      }
    } else if (lastArrow) {
      this.globalParams.finalBeat = lastArrow.beatstamp;
      this.globalParams.lastEntity = lastArrow;
    } else if (lastEvent) {
      this.globalParams.finalBeat = lastEvent.beat;
      this.globalParams.lastEntity = lastEvent;
    }
    this.globalParams.finalBeat += END_EXTRA_BEATS;

    // note events (combo, assist tick, target flash)
    // console.log("eventList", this.eventList);
    const bpmQueue = this.globalParams.bpmQueue;
    // console.log("bpmQueue", bpmQueue);

    // subset of arrows that specifically count for combo (e.g. excluding ends of freeze arrows)
    this.comboArrows = [];

    let currentBpmPtr = -1,
      currentEventPtr = 0,
      pendingStopPtr = -1,
      currentBpm = null,
      pendingStop = null,
      currentStopOffset = 0,
      currentCombo = 0;
    this.allArrows.forEach((arrow, idx) => {
      // Find the latest bpm section that starts before this note
      while (
        currentBpmPtr < bpmQueue.length - 1 &&
        bpmQueue[currentBpmPtr + 1].beat < arrow.beatstamp
      ) {
        // if this block was entered, a new bpm section was entered
        currentBpmPtr++;
        const bpmSection = bpmQueue[currentBpmPtr];
        currentBpm = bpmSection.value;

        // reset the accumulated stop time
        currentStopOffset = 0;

        // find the index of this bpm section in the eventList and use it as a starting point
        // for keeping track of stops
        for (let i = currentEventPtr; i < this.eventList.length; i++) {
          const event = this.eventList[i];
          if (event.beat === bpmSection.beat && event.type === "bpm") {
            currentEventPtr = i;
            const nextEvent = this.eventList[i + 1];
            if (nextEvent && nextEvent.type === "stop") {
              pendingStopPtr = i + 1;
              pendingStop = this.eventList[pendingStopPtr];
            } else {
              pendingStop = null;
            }
            break;
          }
        }
      }

      // Accumulate total time of any stops that exist in this bpm section before this note.
      // Keep track of the next pending stop so it can be added to the total stop time as soon as
      // the first arrow following it is reached
      while (pendingStop && pendingStop.beat < arrow.beatstamp) {
        currentStopOffset += pendingStop.value;
        const nextEvent = this.eventList[pendingStopPtr + 1];
        if (nextEvent && nextEvent.type === "stop") {
          pendingStopPtr++;
        } else {
          pendingStopPtr = -1;
        }
        pendingStop = this.eventList[pendingStopPtr];
      }

      const bpmSectionStartBeat = bpmQueue[currentBpmPtr].beat;
      const bpmSectionStartTime = bpmQueue[currentBpmPtr].timestamp;

      const beatDiff = arrow.beatstamp - bpmSectionStartBeat;
      const timeDiff = beatDiff * (60 / currentBpm);
      const arrowTimestamp = bpmSectionStartTime + timeDiff + currentStopOffset;
      arrow.timestamp = arrowTimestamp;

      // combo arrows (includes regular notes and freeze heads)
      if (
        arrow.note.includes("1") ||
        arrow.note.includes("2") ||
        arrow.note.includes("M")
      ) {
        currentCombo++;
        arrow.combo = currentCombo;

        this.comboArrows.push(arrow);
      }
      // freeze ends that are not simultaneous with combo arrows
      else if (arrow.note.includes("3")) {
      }
    });

    this.allArrows.forEach(arrow => {
      // If the note is the tail of a freeze arrow, calculate the number of beats
      // from the head of the freeze arrow
      for (let i = 0; i < arrow.note.length; i++) {
        if (arrow.note[i] !== "3") continue;

        // Find the most recent freeze head on the same direction as the tail
        // and retroactively fill in the beats of the head and tail
        // Also apply this to every regular note that occurs during the freeze

        const arrowsDuringFreeze = [];

        for (let j = arrow.key - 1; j >= 0; j--) {
          if (!this.allArrows[j].holdStartBeats) {
            this.allArrows[j].holdStartBeats = [];
            this.allArrows[j].holdEndBeats = [];
            this.allArrows[j].holdStartTimes = [];
            this.allArrows[j].holdEndTimes = [];
          }
          arrowsDuringFreeze.push(this.allArrows[j]);

          if (this.allArrows[j].note[i] === "2") {
            const freezeHead = this.allArrows[j];
            const freezeTail = arrow;

            if (!freezeTail.holdStartBeats) {
              freezeTail.holdStartBeats = [];
              freezeTail.holdEndBeats = [];
              freezeTail.holdStartTimes = [];
              freezeTail.holdEndTimes = [];
            }
            arrowsDuringFreeze.push(freezeTail);

            arrowsDuringFreeze.forEach(arrowDuringFreeze => {
              arrowDuringFreeze.holdStartBeats[i] = freezeHead.beatstamp;
              arrowDuringFreeze.holdEndBeats[i] = freezeTail.beatstamp;
              arrowDuringFreeze.holdStartTimes[i] = freezeHead.timestamp;
              arrowDuringFreeze.holdEndTimes[i] = freezeTail.timestamp;
            });
            break;
          }
        }
      }
    });
  }

  // Calculate the gsap tweens before playing the chart
  initTimeline(mods) {
    /* Timestamp-based arrow events timeline */

    this.allArrows.forEach(arrow => {
      // combo arrows (includes regular notes and freeze heads)
      if (
        arrow.note.includes("1") ||
        arrow.note.includes("2") ||
        arrow.note.includes("M")
      ) {
        this.tl.set(
          this.globalParams,
          {
            onStart: () => {
              this.globalParams.combo = arrow.combo;

              if (arrow instanceof Arrow) {
                // AudioPlayer.playAssistTick();
                // console.log(arrow);
                this.globalParams.targetFlashes[
                  arrow.beatstamp
                ] = new TargetFlash(arrow);
              }
            }
          },
          arrow.timestamp - 0.008
        );
      }

      // freeze ends that are not simultaneous with combo arrows
      else if (arrow.note.includes("3")) {
        this.tl.set(
          this.globalParams,
          {
            onStart: () => {
              this.globalParams.targetFlashes[
                arrow.beatstamp
              ] = new TargetFlash(arrow);
            }
          },
          arrow.timestamp - 0.008
        );
      }
    });

    /* Arrows timeline */

    // set tween starting point back to 0
    this.tl = this.tl.set({}, {}, 0);

    // time tick timeline for cmod
    // extend duration by an arbitrarily long buffer so rounding error does not cause the
    // last arrow to stop a tiny decimal before reaching 0
    this.tl = this.tl.to(
      this.globalParams,
      {
        timeTick: this.globalParams.lastEntity.timestamp + 1,
        duration: this.globalParams.lastEntity.timestamp + 1,
        ease: "none"
      },
      ">"
    );

    // set tween starting point back to 0
    this.tl = this.tl.set({}, {}, 0);

    /*
      The space in between each event (i.e. a bpm change or stop) denotes a continous section of constant bpm.
      Create a tween to animate the global beat tick for each of these sections and chain them together.
      The position and/or frame animation of each canvas object (e.g. arrows, step zone, guidelines) can be
      determined as a function of the beat tick value at any given point.
    */
    let accumulatedBeatTick = 0;
    let bpm;

    // beat tick timeline for normal speed mods
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
                changeActiveBpm(startEvent.value, this.globalParams);
              }
            }
          },
          `>${delay}`
        );
        accumulatedBeatTick += sectionBeatLength;
      }
      // if this is the last bpm change/stop event, animate remaining objects to end
      else {
        this.tl = this.tl.to(
          this.globalParams,
          {
            beatTick: this.globalParams.finalBeat,
            duration:
              ((this.globalParams.finalBeat - accumulatedBeatTick) / bpm) * 60,
            ease: "none",
            onStart: () => {
              if (startEvent.type === "bpm") {
                changeActiveBpm(startEvent.value, this.globalParams);
              }
            }
          },
          `>${delay}`
        );
      }
    }

    this.guidelines = new Guidelines(this.globalParams.finalBeat);
    this.bpmAndStopDisplay = new BpmAndStopDisplay();

    AudioPlayer.setTimeline(this.tl);

    this.updateLoopOnce();
  }

  // test assist tick code

  scheduler() {
    // console.log("scheduler");
    // console.log(AudioPlayer.isAudioStable);
    const { assist, allArrows } = this.globalParams;
    const {
      audioContext,
      audioStartContextTime,
      audioStartProgressTime,
      nextNotePtr
    } = assist;

    const scheduleAheadTime = 0.2;
    // const scheduleAheadTime = 1;

    const songOffset = this.globalParams.offset;

    // amount (in seconds) to add to a timestamp to get its equivalent audioContext time
    const audioContextDiff =
      audioStartContextTime - audioStartProgressTime - songOffset;

    let nextNote = allArrows[nextNotePtr];

    // short-circuit if no future note is detected
    if (!nextNote) return;

    let nextNoteTime = allArrows[nextNotePtr].timestamp;
    let nextNoteContextTime = nextNoteTime + audioContextDiff;

    // console.log("nextNoteContextTime", nextNoteContextTime);
    // console.log(
    //   "audioContext.currentTime + scheduleAheadTime",
    //   audioContext.currentTime + scheduleAheadTime
    // );

    // while there are notes that will need to play before the next interval,
    // schedule them and advance the pointer.
    while (nextNoteContextTime < audioContext.currentTime + scheduleAheadTime) {
      this.scheduleNote(nextNote);

      AudioPlayer.playAssistTick(nextNoteContextTime);

      // look for the next assist tick note to schedule, and short-circuit if end is reached
      assist.nextNotePtr++;
      nextNote = allArrows[assist.nextNotePtr];
      if (!nextNote) return;

      while (!nextNote.note.includes("1") && !nextNote.note.includes("2")) {
        assist.nextNotePtr++;
        nextNote = allArrows[assist.nextNotePtr];
        if (!nextNote) return;
      }

      nextNoteTime = allArrows[assist.nextNotePtr].timestamp;
      nextNoteContextTime = nextNoteTime + audioContextDiff;
    }

    // console.log(audioContext.currentTime);
  }

  scheduleNote(note) {
    // console.log("scheduled note combo", note.combo);
  }

  mainLoop(loop = true) {
    // if this gameEngine is replaced and flagged for garbage deletion, squash any residual
    // attempts to invoke its mainLoop
    if (this.killed) {
      // console.log("old mainLoop squashed");
      return;
    }

    // console.log("mainLoop running");
    // console.log("\n\n\n");
    let t0, t1;

    // console.log(this.globalParams.timeTick);

    t0 = performance.now();
    this.drawBackground();
    t1 = performance.now();
    // console.log(`drawBackground: ${(t1 - t0).toFixed(3)} ms`);

    const { songSelect, mods } = store.getState();
    const { mode } = songSelect;

    // schedule assist tick sounds in advance
    if (mods.assistTick) {
      this.scheduler();
    }

    if (mods.cmod < 100 || mods.cmod > 1000) {
      mods.cmod = DEFAULT_CMOD;
    }

    const { beatTick, timeTick } = this.globalParams;

    if (this.stepZone && mods.stepZone !== "off") {
      t0 = performance.now();
      this.stepZone.render(
        this.canvas,
        { beatTick },
        {
          mode,
          mods
        }
      );
      t1 = performance.now();
      // console.log(`stepZone.render: ${(t1 - t0).toFixed(3)} ms`);
    }
    if (this.guidelines) {
      t0 = performance.now();
      this.guidelines.render(this.canvas, { beatTick, timeTick }, { mods });
      t1 = performance.now();
      // console.log(`guidelines.render: ${(t1 - t0).toFixed(3)} ms`);
    }

    /* Combo display, if behind arrows */
    if (mods.comboDisplay === "behind") {
      this.comboDisplay.render(this.canvas, this.globalParams.combo, {
        mode,
        mods
      });
    }

    updateBeatWindow(this.globalParams);

    let windowStartPtr, windowEndPtr;
    if (mods.speed === "cmod") {
      windowStartPtr = this.globalParams.timeWindowStartPtr;
      windowEndPtr = this.globalParams.timeWindowEndPtr;
    } else {
      windowStartPtr = this.globalParams.beatWindowStartPtr;
      windowEndPtr = this.globalParams.beatWindowEndPtr;
    }

    /* Bpm and stop display */
    if (!this.bpmReel) {
      this.bpmReel = document.getElementById("bpmReel");
      this.bpmReel.height = this.canvas.height;
      this.bpmReel.width = this.bpmReel.clientWidth;
    }
    if (!this.stopReel) {
      this.stopReel = document.getElementById("stopReel");
      this.stopReel.height = this.canvas.height;
      this.stopReel.width = this.stopReel.clientWidth;
    }

    if (mods.bpmStopDisplay) {
      if (
        windowStartPtr.bpm <= windowEndPtr.bpm ||
        windowStartPtr.stop <= windowEndPtr.stop
      ) {
        this.clearBpmAndStopDisplay();
      }

      for (let i = windowStartPtr.bpm; i <= windowEndPtr.bpm; i++) {
        const bpm = this.globalParams.bpmQueue[i];
        this.bpmAndStopDisplay.renderBpm(
          this.bpmReel,
          bpm,
          { beatTick, timeTick },
          { mods }
        );
      }
      for (let i = windowStartPtr.stop; i <= windowEndPtr.stop; i++) {
        const stop = this.globalParams.stopQueue[i];
        this.bpmAndStopDisplay.renderStop(
          this.stopReel,
          stop,
          { beatTick, timeTick },
          { mods }
        );
      }
      // window.bpmAndStopDisplay = this.bpmAndStopDisplay;
    }

    /* Arrows */

    const upArrows = mode === "double" ? [2, 6] : [2];
    const notUpArrows = mode === "double" ? [0, 1, 3, 4, 5, 7] : [0, 1, 3];
    // console.log(`GameEngine`, [
    //   windowStartPtr.arrow,
    //   windowEndPtr.arrow,
    // ]);
    for (let i = windowEndPtr.shock; i >= windowStartPtr.shock; i--) {
      const shockArrow = this.globalParams.shocks[i];
      shockArrow.render(
        this.canvas,
        this.globalParams.frame,
        { beatTick, timeTick },
        { mods }
      );
    }

    for (let i = windowEndPtr.freeze; i >= windowStartPtr.freeze; i--) {
      const freeze = this.globalParams.freezes[i];
      notUpArrows.forEach(directionIdx => {
        freeze.renderFreezeBody(
          this.canvas,
          { beatTick, timeTick },
          directionIdx,
          { mods }
        );
      });
    }
    for (let i = windowStartPtr.freeze; i <= windowEndPtr.freeze; i++) {
      const freeze = this.globalParams.freezes[i];
      upArrows.forEach(directionIdx => {
        freeze.renderFreezeBody(
          this.canvas,
          { beatTick, timeTick },
          directionIdx,
          { mods }
        );
      });
    }

    for (let i = windowEndPtr.arrow; i >= windowStartPtr.arrow; i--) {
      const arrow = this.globalParams.arrows[i];
      notUpArrows.forEach(directionIdx => {
        arrow.renderArrow(this.canvas, { beatTick, timeTick }, directionIdx, {
          mods
        });
      });
    }

    // t0 = performance.now();
    for (let i = windowStartPtr.arrow; i <= windowEndPtr.arrow; i++) {
      const arrow = this.globalParams.arrows[i];
      upArrows.forEach(directionIdx => {
        arrow.renderArrow(this.canvas, { beatTick, timeTick }, directionIdx, {
          mods
        });
      });
    }
    // t1 = performance.now();

    // console.log(`arrows renderArrow: ${(t1 - t0).toFixed(3)} ms`);

    // /* End arrows */

    /* Combo display, if in front of arrows */
    if (mods.comboDisplay === "inFront") {
      this.comboDisplay.render(this.canvas, this.globalParams.combo, {
        mode,
        mods
      });
    }

    /* Hidden+ and/or Sudden+ lane cover */
    if (
      ["hidden", "sudden", "hiddensudden"].includes(mods.appearance) &&
      mods.laneCoverVisible
    ) {
      this.laneCover.render(this.canvas, { mode, mods });
    }

    /* Target flashes */
    t0 = performance.now();
    for (let beatstamp in this.globalParams.targetFlashes) {
      const targetFlash = this.globalParams.targetFlashes[beatstamp];
      targetFlash.frame++;
      if (targetFlash.frame > MARVELOUS_FLASH_FRAMES) {
        delete this.globalParams.targetFlashes[beatstamp];
      } else {
        targetFlash.render(this.canvas, { mods });
      }
    }
    t1 = performance.now();
    // console.log(`targetFlash render: ${(t1 - t0).toFixed(3)} ms`);

    /* Manual css property updates for DOM-based components */

    // if (!this.bpmReel) {
    //   this.bpmReel = document.getElementById("bpmReel");
    // }
    // if (!this.stopReel) {
    //   this.stopReel = document.getElementById("stopReel");
    // }
    // if (mods.speed !== "cmod" && mods.bpmStopDisplay) {
    //   [this.bpmReel, this.stopReel].forEach((reel) => {
    //     reel.style.height =
    //       this.globalParams.finalBeat * ARROW_HEIGHT * mods.speed;
    //     reel.style.transform = `translateY(-${
    //       this.globalParams.beatTick * ARROW_HEIGHT * mods.speed
    //     }px)`;
    //   });
    // }

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
  clearBpmAndStopDisplay() {
    if (this.bpmReel) {
      const c = this.bpmReel.getContext("2d");
      c.fillStyle = "black";
      c.fillRect(0, 0, this.bpmReel.width, this.bpmReel.height);
    }
    if (this.stopReel) {
      const c = this.stopReel.getContext("2d");
      c.fillStyle = "black";
      c.fillRect(0, 0, this.stopReel.width, this.stopReel.height);
    }
  }

  restartTl() {
    // console.log("call restart");
    this.tl.restart();
  }
  pauseTl() {
    this.tl.pause();
  }
  isTlPaused() {
    return this.tl.paused();
  }
}

export default GameEngine;
