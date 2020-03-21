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

  return chart.map(row => {
    const note = row.note;
    let turnedNote = "";

    let turnMod = turn;
    if (turn === "shuffle") turnMod += shuffle;
    const mapping = turnMap[turnMod];

    for (let direction of mapping) {
      turnedNote += note[turnMap.off.indexOf(direction)];
    }

    return { ...row, note: turnedNote };
  });
};
