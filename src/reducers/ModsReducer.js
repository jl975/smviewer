import * as actions from "../actions/ModsActions";
import { optionDefaultValues } from "../components/form/options";
import { getUserSettings, updateUserSettings } from "../utils/userSettings";

const initialState = optionDefaultValues.mods;

export const mods = (state = initialState, action) => {
  switch (action.type) {
    case actions.UPDATE_MODS: {
      const updatedMods = action.payload;
      const updatedState = { ...state, ...updatedMods };
      updateUserSettings({ mods: updatedState });
      return updatedState;
    }
    default:
      return state;
  }
};
