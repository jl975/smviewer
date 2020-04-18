export const applyTurnMods = (chart, mods) => {
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

  return chart.map((row) => {
    const note = row.note;
    const turnedNote = turnMap[turnMod]
      .split("")
      .map((direction) => note[turnMap.off.indexOf(direction)]);

    return { ...row, note: turnedNote };
  });
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

  // Go through the chart until the arrow following the current timestamp is reached,
  // then set the combo to one less than that arrow's combo
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    if (arrow.timestamp > audio.seek()) {
      return arrow.combo - 1;
    }
  }
  return arrows[arrows.length - 1].combo;
};
