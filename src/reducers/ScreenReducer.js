import * as actions from "../actions/ScreenActions";
import { getUserSettings, updateUserSettings } from "../utils/userSettings";

const userSettings = getUserSettings();
const initialState = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  activeView: userSettings.activeView || "song",
};

export const screen = (state = initialState, action) => {
  switch (action.type) {
    case actions.RESIZE_SCREEN: {
      const { target } = action.payload;
      const { innerWidth, innerHeight } = target;

      const values = { innerWidth, innerHeight };

      return { ...state, ...values };
    }
    case actions.SET_ACTIVE_VIEW: {
      const activeView = action.payload;
      updateUserSettings({ activeView });
      return { ...state, activeView };
    }
    default:
      return state;
  }
};
