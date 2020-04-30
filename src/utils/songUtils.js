import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../constants";

export const getClosestDifficulty = (song, difficulty, mode) => {
  const difficulties = mode === "double" ? DP_DIFFICULTIES : SP_DIFFICULTIES;
  const levels =
    mode === "double" ? song.levels.slice(5, 9) : song.levels.slice(0, 5);

  if (["Difficult", "Expert", "Challenge"].includes(difficulty)) {
    for (let i = difficulties.length - 1; i >= 0; i--) {
      if (levels[i]) {
        return difficulties[i];
      }
    }
  } else if (["Beginner", "Basic"].includes(difficulty)) {
    for (let i = 0; i <= difficulties.length - 1; i++) {
      if (levels[i]) {
        return difficulties[i];
      }
    }
  }
};
