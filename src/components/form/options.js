import { presetParams } from "../../utils";

export const options = {
  difficulty: ["Beginner", "Basic", "Difficult", "Expert", "Challenge"],
  mods: {
    speed: [
      0.25,
      0.5,
      0.75,
      1,
      1.25,
      1.5,
      1.75,
      2,
      2.25,
      2.5,
      2.75,
      3,
      3.25,
      3.5,
      3.75,
      4,
      4.5,
      5,
      5.5,
      6,
      6.5,
      7,
      7.5,
      8,
    ],
    turn: ["off", "mirror", "left", "right", "shuffle"],
    shuffle: [1, 2, 3, 4, 5, 6, 7, 8],
    noteskin: ["rainbow", "note", "vivid", "flat"],
  },
};

const optionDefaultValues = {
  difficulty: "Challenge",
  mods: {
    speed: 3,
    turn: "off",
    shuffle: 1,
    noteskin: "note",
    guidelines: true,
    colorFreezes: false,
  },
};

if (presetParams.difficulty) {
  const difficulties = {
    b: "Beginner",
    B: "Basic",
    D: "Difficult",
    E: "Expert",
    C: "Challenge",
  };
  if (Object.keys(difficulties).includes(presetParams.difficulty[0])) {
    optionDefaultValues.difficulty = difficulties[presetParams.difficulty[0]];
  }
}
if (presetParams.speed) {
  const value = parseFloat(
    `${presetParams.speed[0]}.${presetParams.speed.slice(1)}`
  );
  if (options.mods.speed.includes(value)) {
    optionDefaultValues.mods.speed = value;
  }
}
if (presetParams.turn) {
  const turnValue = presetParams.turn.toLowerCase();
  if (options.mods.turn.includes(turnValue)) {
    optionDefaultValues.mods.turn = turnValue;
  }
}

export { optionDefaultValues };
