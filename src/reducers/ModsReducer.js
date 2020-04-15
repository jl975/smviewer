import * as actions from "../actions/ModsActions";
import { optionDefaultValues } from "../components/form/options";

const initialState = optionDefaultValues.mods;

export const mods = (state = initialState, action) => {
  switch (action.type) {
    case actions.UPDATE_MODS: {
      const updatedMods = action.payload;
      return { ...state, ...updatedMods };
    }
    default:
      return state;
  }
};
