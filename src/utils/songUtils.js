import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../constants";

/*
  If the song does not have a chart corresponding to the chosen difficulty option,
  pick whatever is *closest*
  - If Difficult, Expert, or Challenge is the chosen option, start from Challenge and
    work your way down until the first available difficulty is reached.
  - If Beginner or Basic is the chosen option, start from Beginner and work up.
  The closest available difficulty will be chosen for the song without affecting the
  difficulty option selected for the form, like the way it works in the real game
*/
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
