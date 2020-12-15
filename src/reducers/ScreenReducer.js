import * as actions from "../actions/ScreenActions";
import { getUserSettings, updateUserSettings } from "../utils/userSettings";

const userSettings = getUserSettings();
const initialState = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  activeView: userSettings.activeView || "song",
  offsetModal: {
    open: false,
  },
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
    case actions.SET_OFFSET_MODAL_OPEN: {
      const isOpen = action.payload;
      const newState = { ...state };
      newState.offsetModal.open = isOpen;
      return newState;
    }
    default:
      return state;
  }
};
