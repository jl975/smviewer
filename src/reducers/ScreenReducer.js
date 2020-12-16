import * as actions from "../actions/ScreenActions";
import { getUserSettings, updateUserSettings } from "../utils/userSettings";

const userSettings = getUserSettings();
const initialState = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  activeView: userSettings.activeView || "song",
  modalOpen: {
    welcome: false,
    offset: false,
    offsetConfirm: false,
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
    case actions.SET_MODAL_OPEN: {
      const { modalName, isOpen } = action.payload;
      const newState = { ...state };

      // only one modal open at a time
      for (let key in newState.modalOpen) {
        newState.modalOpen[key] = key === modalName;
        if (key === modalName) {
          newState.modalOpen[key] = isOpen;
        } else {
          newState.modalOpen[key] = false;
        }
      }
      return newState;
    }
    default:
      return state;
  }
};
