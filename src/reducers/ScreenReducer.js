import * as actions from "../actions/ScreenActions";
import { getUserSettings, updateUserSettings } from "../utils/userSettings";

const userSettings = getUserSettings();
const initialState = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  activeView: userSettings.activeView || "song",
  previousActiveView: null,
  fullScreenModal: false,
  modalOpen: {
    welcome: false,
    offset: false,
    offsetConfirm: false,
    share: false,
    staticChart: false,
    settings: false,
    help: false,
  },
};

const fullScreenModals = ["welcome", "offset", "offsetConfirm", "staticChart"];

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
      const previousActiveView = state.activeView;
      updateUserSettings({ activeView, previousActiveView });
      return { ...state, activeView, previousActiveView };
    }
    case actions.SET_MODAL_OPEN: {
      const { modalName, isOpen } = action.payload;
      const newState = { ...state };
      newState.fullScreenModal = false;

      // only one modal open at a time
      for (let key in newState.modalOpen) {
        newState.modalOpen[key] = key === modalName;
        if (key === modalName) {
          newState.modalOpen[key] = isOpen;
          if (isOpen && fullScreenModals.includes(modalName)) {
            newState.fullScreenModal = true;
          }
        } else {
          newState.modalOpen[key] = false;
        }
      }
      return newState;
    }
    case actions.CLOSE_ALL_MODALS: {
      const newState = { ...state };
      for (let key in newState.modalOpen) {
        newState.modalOpen[key] = false;
      }
      newState.fullScreenModal = false;
      return newState;
    }
    default:
      return state;
  }
};
