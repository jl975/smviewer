import * as actions from "../actions/SongSelectActions";
import { optionDefaultValues } from "../components/form/options";

const initialState = {
  difficulty: optionDefaultValues.difficulty,
  mode: optionDefaultValues.mode,
};

export const songSelect = (state = initialState, action) => {
  switch (action.type) {
    case actions.SELECT_SONG: {
      const song = action.payload;
      return { ...state, song };
    }
    case actions.SELECT_DIFFICULTY: {
      const difficulty = action.payload;
      return { ...state, difficulty };
    }
    case actions.SELECT_MODE: {
      const mode = action.payload;
      return { ...state, mode };
    }
    default:
      return state;
  }
};
