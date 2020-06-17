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
  const {
    beatTick,
    arrows,
    freezes,
    shocks,
    chartAreaHeight,
    mods,
  } = globalParams;

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  // let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;
  let numVisibleBeats = chartAreaHeight / ARROW_HEIGHT;
  numVisibleBeats /= mods.speed;

  const beatWindowStart = beatTick; // FIXME: later change this to 1 arrow height before the beat tick
  const beatWindowEnd = beatWindowStart + numVisibleBeats;

  const beatWindowStartPtr = {};
  const beatWindowEndPtr = {};

  // if no arrows have passed yet (or none exist), set pointer to beginning
  if (!arrows.length || arrows[0].beatstamp > beatWindowStart) {
    beatWindowStartPtr.arrow = 0;
  }
  // if no more arrows left
  else if (arrows[arrows.length - 1].beatstamp < beatWindowStart) {
    beatWindowStartPtr.arrow = arrows.length;
  }
  // if at least one arrow has passed, find the topmost arrow that has yet to pass
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
        beatWindowStartPtr.arrow = i;
        break;
      }
    }
  }

  // find start pointer for freeze bodies. copy of above logic for regular arrows
  if (!freezes.length || freezes[0].beatstamp > beatWindowStart) {
    beatWindowStartPtr.freeze = 0;
  } else if (freezes[freezes.length - 1].beatstamp < beatWindowStart) {
    beatWindowStartPtr.freeze = freezes.length;
  } else {
    for (let i = 1; i < freezes.length; i++) {
      if (
        freezes[i - 1].beatstamp < beatWindowStart &&
        freezes[i].beatstamp >= beatWindowStart
      ) {
        beatWindowStartPtr.freeze = i;
        break;
      }
    }
  }

  // repeat for end pointer

  // if there are no arrows on screen and the next "top arrow" is pointing to an arrow
  // that has yet to appear, point the next "bottom arrow" to the arrow BEFORE the top arrow.
  // This replicates the way the pointers naturally update when the screen reaches a section
  // with no visible arrows, essentially meaning there are no arrows to iterate over and render

  let nextTopArrow = arrows[beatWindowStartPtr.arrow];

  // short-circuit if chart is over or if no arrows are on screen
  if (
    beatWindowStartPtr.arrow >= arrows.length ||
    nextTopArrow.beatstamp > beatWindowEnd
  ) {
    beatWindowEndPtr.arrow = beatWindowStartPtr.arrow - 1;
  }

  // if at least one arrow is on screen
  else {
    for (let j = beatWindowStartPtr.arrow; j < arrows.length; j++) {
      const currentArrow = arrows[j];
      const nextArrow = arrows[j + 1];

      // if there is no next arrow, the end has been reached
      if (!nextArrow) {
        beatWindowEndPtr.arrow = j;
        break;
      } else if (
        currentArrow.beatstamp <= beatWindowEnd &&
        nextArrow.beatstamp > beatWindowEnd
      ) {
        beatWindowEndPtr.arrow = j;
        break;
      }
    }
  }

  // find end pointer for freeze bodies
  let nextTopFreeze = freezes[beatWindowStartPtr.freeze];
  if (beatWindowStartPtr.freeze >= freezes.length) {
    beatWindowEndPtr.freeze = beatWindowStartPtr.freeze - 1;
  }

  // if the next top arrow is off screen
  else if (nextTopFreeze.beatstamp > beatWindowEnd) {
    beatWindowEndPtr.freeze = beatWindowStartPtr.freeze - 1;

    // if the off-screen arrow is in the middle of (or part of) a freeze,
    // increment the end pointer until it matches the latest holdEndBeat (which could either
    // be part of itself or part of an adjacent freeze arrow)
    if (nextTopFreeze.holdEndBeats) {
      const latestEndBeat = Math.max(
        ...nextTopFreeze.holdEndBeats.filter((beat) => beat)
      );
      beatWindowEndPtr.freeze = beatWindowStartPtr.freeze;
      while (freezes[beatWindowEndPtr.freeze].beatstamp < latestEndBeat)
        beatWindowEndPtr.freeze++;
    }
  }
  // if at least one arrow is on screen
  else {
    for (let i = beatWindowStartPtr.freeze; i < freezes.length; i++) {
      const currentFreeze = freezes[i];
      const nextFreeze = freezes[i + 1];

      if (!nextFreeze) {
        beatWindowEndPtr.freeze = i;
        break;
      }
      // if the last visible arrow is in the middle of (or part of) a freeze,
      // increment the end pointer until it matches the latest holdEndBeat (which could either
      // be part of itself or part of an adjacent freeze arrow)
      else if (
        currentFreeze.beatstamp <= beatWindowEnd &&
        nextFreeze.beatstamp > beatWindowEnd
      ) {
        if (currentFreeze.holdEndBeats) {
          const latestEndBeat = Math.max(
            ...currentFreeze.holdEndBeats.filter((beat) => beat)
          );

          while (freezes[i].beatstamp < latestEndBeat) i++;
        }
        beatWindowEndPtr.freeze = i;
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
    freezes,
    shocks,
    chartAreaHeight,
    mods,
    beatWindowStartPtr,
    beatWindowEndPtr,
  } = globalParams;

  if (
    typeof beatWindowStartPtr === "undefined" ||
    typeof beatWindowEndPtr === "undefined" ||
    !Object.keys(beatWindowStartPtr).length ||
    !Object.keys(beatWindowEndPtr).length
  )
    return;

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  // let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;
  let numVisibleBeats = chartAreaHeight / ARROW_HEIGHT;
  numVisibleBeats /= mods.speed;

  const beatWindowStart = beatTick; // FIXME: later change this to 1 arrow height before the beat tick
  const beatWindowEnd = beatTick + numVisibleBeats;
  const currentBeatWindow = [beatWindowStart, beatWindowEnd];
  globalParams.currentBeatWindow = currentBeatWindow;

  // short-circuit if chart is over
  if (beatWindowStartPtr.arrow === arrows.length) return;

  // if chart is just beginning, watch for the first arrow (unless it is a freeze)
  // short-circuit if it has not begun
  if (beatWindowEndPtr.arrow === -1) {
    // if the first arrow has finally appeared, set the end ptr
    if (arrows[0].beatstamp <= beatWindowEnd) {
      beatWindowEndPtr.arrow = 0;
    } else return;
  }

  // Watching top arrow
  //
  // if there are arrows on the screen, and the topmost arrow from the previous frame is
  // now behind the updated beatWindowStart
  const topmostArrow = arrows[beatWindowStartPtr.arrow];

  let nextTopArrow = topmostArrow;

  // topmost arrow is no longer the topmost arrow when it is behind beatWindowStart
  while (nextTopArrow.beatstamp < beatWindowStart) {
    beatWindowStartPtr.arrow++;

    // no more arrows left
    if (beatWindowStartPtr.arrow >= arrows.length) {
      // beatWindowEndPtr.arrow++;
      console.log("reached end of chart");
      return;
    }

    nextTopArrow = arrows[beatWindowStartPtr.arrow];
  }

  // watching top freeze arrow
  const topFreeze = freezes[beatWindowStartPtr.freeze];
  let nextTopFreeze = topFreeze;
  while (nextTopFreeze && nextTopFreeze.beatstamp < beatWindowStart) {
    beatWindowStartPtr.freeze++;
    nextTopFreeze = freezes[beatWindowStartPtr.freeze];
  }

  // Watching bottom arrow
  //
  // if there are arrows on the screen, and the arrow AFTER the bottommost arrow from the previous
  // frame is now behind the updated beatWindowEnd
  const bottommostArrow = arrows[beatWindowEndPtr.arrow];

  let nextBottomArrow = bottommostArrow;
  let nextBottomArrowAdj = arrows[beatWindowEndPtr.arrow + 1];

  // bottommost arrow is no longer bottommost arrow when the next arrow is behind beatWindowEnd
  while (nextBottomArrowAdj && nextBottomArrowAdj.beatstamp <= beatWindowEnd) {
    beatWindowEndPtr.arrow++;
    nextBottomArrow = arrows[beatWindowEndPtr.arrow];
    nextBottomArrowAdj = arrows[beatWindowEndPtr.arrow + 1];
  }

  // watching bottom freeze arrow
  const bottomFreeze = freezes[beatWindowEndPtr.freeze];
  let nextBottomFreeze = bottomFreeze;
  let nextBottomFreezeAdj = freezes[beatWindowEndPtr.freeze + 1];
  while (
    nextBottomFreezeAdj &&
    nextBottomFreezeAdj.beatstamp <= beatWindowEnd
  ) {
    beatWindowEndPtr.freeze++;
    nextBottomFreeze = freezes[beatWindowEndPtr.freeze];
    nextBottomFreezeAdj = freezes[beatWindowEndPtr.freeze + 1];
  }

  // extend the freeze window to reach the latest endHoldBeat
  if (nextBottomFreeze) {
    const latestEndBeat = Math.max(
      ...nextBottomFreeze.holdEndBeats.filter((beat) => beat)
    );
    while (freezes[beatWindowEndPtr.freeze].beatstamp < latestEndBeat) {
      beatWindowEndPtr.freeze++;
    }
  }

  // ^ because a freeze tail happening simultaneously as the head of a different freeze
  // are counted as the same note, if the end pointer falls on such a note, the above code cannot
  // tell whether it is referring to the former's tail or the latter's head.
  // therefore, it will result in the beat window being extended all the way down to the end of
  // any "freeze chain", including any freezes that are not yet visible on the screen in any form.
  // this makes the engine loop over slightly more arrows than necessary, but this is fine for now

  // const allArrowsInWindow = [];
  // for (
  //   let i = globalParams.beatWindowStartPtr.freeze;
  //   i <= globalParams.beatWindowEndPtr.freeze;
  //   i++
  // ) {
  //   allArrowsInWindow.push(i);
  // }
  // console.log(allArrowsInWindow);
};
