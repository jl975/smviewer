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

  return chart.map(row => {
    const note = row.note;
    const turnedNote = turnMap[turnMod]
      .split("")
      .map(direction => note[turnMap.off.indexOf(direction)]);

    return { ...row, note: turnedNote };
  });
};
