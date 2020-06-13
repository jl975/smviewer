import { DEFAULT_OFFSET, ARROW_HEIGHT } from "../constants";
import { debugLog } from "./debugUtils";

export const applyTurnMods = (chart, mods, mode) => {
  const { turn, shuffle } = mods;

  // shuffle patterns courtesy of https://zenius-i-vanisher.com/v5.2/viewthread.php?threadid=3823
  const turnMap = {
    off: "LDUR",
    mirror: "RUDL",
    left: "ULRD",
    right: "DRLU",
    shuffle1: "LRDU",
    shuffle2: "UDRL",
    shuffle3: "LRUD",
    shuffle4: "DURL",
    shuffle5: "DLUR",
    shuffle6: "DULR",
    shuffle7: "RLUD",
    shuffle8: "RULD",
  };

  let turnMod = turn;
  if (turn === "shuffle") turnMod += shuffle;

  if (mode === "single") {
    return chart.map((row) => {
      const note = row.note;
      const turnedNote = turnMap[turnMod]
        .split("")
        .map((direction) => note[turnMap.off.indexOf(direction)]);

      return { ...row, note: turnedNote };
    });
  }
  if (mode === "double") {
    return chart.map((row) => {
      let turnedNote = row.note.split("");
      if (turn === "mirror") turnedNote = turnedNote.reverse();
      return { ...row, note: turnedNote };
    });
  }
};

/*
  Given the bpmChangeQueue and the current beat tick, find the latest bpm
  change event that happened before the current beat and set the current bpm
  to that bpm value. This should be invoked every time the audio is resynced
  (which will happen whenever progress is skipped)
*/
export const getCurrentBpm = (params) => {
  const { beatTick, bpmChangeQueue } = params;
  let lastBpmValue = 0;
  for (let i = 0; i < bpmChangeQueue.length; i++) {
    const bpmEvent = bpmChangeQueue[i];
    if (bpmEvent.beat > beatTick) {
      return lastBpmValue;
    }
    lastBpmValue = bpmEvent.value;
  }
  return lastBpmValue;
};

/*
  Find the current combo given the song timestamp. This should be invoked
  every time the audio is resynced.
*/

export const getCurrentCombo = (song) => {
  const { audio, globalParams } = song;
  const { arrows } = globalParams;
  if (!arrows.length) return 0;

  const currentTime = audio.seek();

  // if audio is not properly loaded by the time this runs, currentTime will
  // return the Howl object, causing this method to return the full combo.
  // Return 0 instead in this case; seeing no combo is better than seeing
  // an incorrect full combo number

  // if (typeof currentTime !== "number") {
  //   return 0;
  // }

  let currentCombo;

  // Go through the chart until the arrow following the current timestamp is reached,
  // then set the combo to one less than that arrow's combo
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    if (arrow.combo && arrow.timestamp > currentTime + DEFAULT_OFFSET) {
      currentCombo = arrow.combo - 1;
      // console.log(currentCombo);
      return currentCombo;
    }
  }

  // If end of chart is reached, use the combo of the last arrow.
  // Need to go back if the last "note" is the end of a freeze, which is common
  // Expected to short circuit out of loop after ~1-2 iterations
  for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];
    if (arrow.combo) {
      currentCombo = arrow.combo;
      return currentCombo;
    }
  }

  return -1; // should never reach this. return -1 to make debugging easier
};

export const getFullCombo = (song) => {
  const { globalParams } = song;
  const { arrows } = globalParams;
  if (!arrows.length) return 0;
  for (let i = arrows.length - 1; i >= 0; i--) {
    const arrow = arrows[i];
    if (arrow.combo) {
      return arrow.combo;
    }
  }
  return 0;
};

/*
  Method for finding the coordinate of a sprite on Reverse scroll
  given the corresponding coordinate on Normal scroll and its height
*/
export const getReverseCoord = (originalCoord, height, canvas) => {
  return canvas.height - (originalCoord + height);
};

/*
  Based on the current beat tick, calculates the index of the first
  arrow to fall within the visible beat window
*/
export const initializeBeatWindow = (globalParams) => {
  const { beatTick, arrows, chartAreaHeight, mods } = globalParams;

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  // let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;
  let numVisibleBeats = chartAreaHeight / ARROW_HEIGHT;
  numVisibleBeats /= mods.speed;

  const beatWindowStart = beatTick; // FIXME: later change this to 1 arrow height before the beat tick
  const beatWindowEnd = beatWindowStart + numVisibleBeats;

  let beatWindowStartPtr, beatWindowEndPtr;

  // set ptr to -1 if there is no corresponding arrow on screen

  // if no more arrows left
  if (arrows[arrows.length - 1].beatstamp < beatWindowStart) {
    beatWindowStartPtr = arrows.length;
  }

  // before the first arrow shows up
  else if (!arrows.length || arrows[0].beatstamp > beatWindowEnd) {
    beatWindowStartPtr = -1;
  }
  // when the first arrow is on screen
  else if (
    arrows[0].beatstamp <= beatWindowEnd &&
    arrows[0].beatstamp > beatWindowStart
  ) {
    beatWindowStartPtr = 0;
  }
  // if at least one arrow has passed
  // binary search would be ideal. for now, just use an ordinary O(n) search
  else {
    for (let i = 1; i < arrows.length; i++) {
      const previousArrow = arrows[i - 1];
      const currentArrow = arrows[i];

      // return the index of the first arrow that lies on or after the current beat tick
      if (
        previousArrow.beatstamp < beatWindowStart &&
        currentArrow.beatstamp >= beatWindowStart
      ) {
        beatWindowStartPtr = i;
        break;
      }
    }
  }

  // repeat for end pointer

  // if no more arrows left
  if (arrows[arrows.length - 1].beatstamp < beatWindowStart) {
    beatWindowEndPtr = arrows.length;
  }

  // before the first arrow shows up
  else if (!arrows.length || arrows[0].beatstamp > beatWindowEnd) {
    beatWindowEndPtr = -1;
  }

  // if only the first arrow is on screen
  else if (
    arrows[0].beatstamp <= beatWindowEnd &&
    (!arrows[1] || arrows[1].beatstamp > beatWindowEnd)
  ) {
    beatWindowEndPtr = 0;
  }

  // if at least one arrow has passed
  else {
    for (let j = beatWindowStartPtr; j < arrows.length; j++) {
      const currentArrow = arrows[j];
      const nextArrow = arrows[j + 1];

      console.log(
        "currentArrow",
        currentArrow,
        "nextArrow",
        nextArrow,
        "beatWindowEnd",
        beatWindowEnd
      );

      // if there are no arrows on screen and the next "top arrow" is pointing to an arrow
      // that has yet to appear, point the next "bottom arrow" to the arrow BEFORE the top arrow.
      // This replicates the way the pointers naturally update when the screen reaches a section
      // with no visible arrows, essentially meaning there are no arrows to iterate over and render
      if (currentArrow.beatstamp > beatWindowEnd) {
        beatWindowEndPtr = j - 1;
        break;
      }

      if (
        !nextArrow ||
        (currentArrow.beatstamp <= beatWindowEnd &&
          nextArrow.beatstamp > beatWindowEnd)
      ) {
        if (j === arrows.length - 1) {
          console.log(
            "did it",
            j,
            `for beatWindowStart ${beatWindowStart}, beatWindowEnd ${beatWindowEnd}, beatWindwoStartPtr ${beatWindowStartPtr}, beatWindowEndPtr ${beatWindowEndPtr}`
          );
        }
        beatWindowEndPtr = j;
        break;
      }
    }
  }

  const currentBeatWindow = [beatWindowStart, beatWindowEnd];

  globalParams.beatWindowStartPtr = beatWindowStartPtr;
  globalParams.beatWindowEndPtr = beatWindowEndPtr;
  globalParams.currentBeatWindow = currentBeatWindow;

  // console.log("initialize beat window", currentBeatWindow);
};

/*
  Assuming the beat pointer is already defined, invoke this method on every subsequent
  frame to incrementally update the window values and determine if the pointer needs
  to be shifted
*/
export const updateBeatWindow = (globalParams) => {
  const {
    beatTick,
    arrows,
    chartAreaHeight,
    mods,
    beatWindowStartPtr,
    beatWindowEndPtr,
  } = globalParams;

  if (
    typeof globalParams.beatWindowStartPtr === "undefined" ||
    typeof globalParams.beatWindowEndPtr === "undefined"
  )
    return;

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;
  numVisibleBeats /= mods.speed;

  const beatWindowStart = beatTick; // FIXME: later change this to 1 arrow height before the beat tick
  const beatWindowEnd = beatTick + numVisibleBeats;
  const currentBeatWindow = [beatWindowStart, beatWindowEnd];
  globalParams.currentBeatWindow = currentBeatWindow;

  // short-circuit if chart is over
  if (beatWindowStartPtr === arrows.length) return;

  // if chart is just beginning, watch for the first arrow
  if (beatWindowStartPtr === -1) {
    // if the first arrow has finally appeared, set both ptrs and short-circuit
    if (arrows[0].beatstamp <= beatWindowEnd) {
      globalParams.beatWindowStartPtr = 0;
      globalParams.beatWindowEndPtr = 0;
      console.log("updated ptrs", [
        globalParams.beatWindowStartPtr,
        globalParams.beatWindowEndPtr,
      ]);
    }
    return;
  }

  // if there are arrows on the screen, and the topmost arrow from the previous frame is
  // now behind the updated beatWindowStart
  const topmostArrow = arrows[beatWindowStartPtr];

  let nextTopmostArrow = topmostArrow;

  // topmost arrow is no longer the topmost arrow when it is behind beatWindowStart
  while (nextTopmostArrow.beatstamp < beatWindowStart) {
    globalParams.beatWindowStartPtr++;

    console.log("updated ptrs", [
      globalParams.beatWindowStartPtr,
      globalParams.beatWindowEndPtr,
    ]);

    // no more arrows left
    if (globalParams.beatWindowStartPtr >= arrows.length) {
      globalParams.beatWindowEndPtr++;
      console.log("reached end of chart");
      return;
    }

    nextTopmostArrow = arrows[globalParams.beatWindowStartPtr];
  }

  // if there are arrows on the screen, and the arrow AFTER the bottommost arrow from the previous
  // frame is now behind the updated beatWindowEnd
  const bottommostArrow = arrows[beatWindowEndPtr];

  let nextBottommostArrow = bottommostArrow;
  let nextBottommostArrowAdj = arrows[beatWindowEndPtr + 1];

  // bottommost arrow is no longer bottommost arrow when the next arrow is behind beatWindowEnd
  while (
    nextBottommostArrowAdj &&
    nextBottommostArrowAdj.beatstamp <= beatWindowEnd
  ) {
    globalParams.beatWindowEndPtr++;
    nextBottommostArrow = arrows[globalParams.beatWindowEndPtr];
    nextBottommostArrowAdj = arrows[globalParams.beatWindowEndPtr + 1];
    console.log("updated ptrs", [
      globalParams.beatWindowStartPtr,
      globalParams.beatWindowEndPtr,
    ]);
  }

  console.log([globalParams.beatWindowStartPtr, globalParams.beatWindowEndPtr]);
};
