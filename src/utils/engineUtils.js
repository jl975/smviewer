import { GLOBAL_OFFSET } from "../constants";
import { debugLog } from "./index";

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
  if (typeof currentTime !== "number") {
    return 0;
  }

  let currentCombo;

  // Go through the chart until the arrow following the current timestamp is reached,
  // then set the combo to one less than that arrow's combo
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    if (arrow.combo && arrow.timestamp > currentTime + GLOBAL_OFFSET) {
      currentCombo = arrow.combo - 1;
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

/*
  Method for finding the coordinate of a sprite on Reverse scroll
  given the corresponding coordinate on Normal scroll and its height
*/
export const getReverseCoord = (originalCoord, height, canvas) => {
  return canvas.height - (originalCoord + height);
};
