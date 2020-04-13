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

export const optionDefaultValues = {
  difficulty: "Expert",
  mods: {
    speed: 1,
    turn: "off",
    shuffle: 1,
    noteskin: "note",
  },
};
