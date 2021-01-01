export const RESIZE_SCREEN = "RESIZE_SCREEN";
export const SET_ACTIVE_VIEW = "SET_ACTIVE_VIEW";
export const SET_MODAL_OPEN = "SET_MODAL_OPEN";
export const CLOSE_ALL_MODALS = "CLOSE_ALL_MODALS";

export const resizeScreen = (e) => (dispatch) => {
  dispatch({
    type: RESIZE_SCREEN,
    payload: e,
  });
};

export const setActiveView = (view) => (dispatch) => {
  dispatch({
    type: SET_ACTIVE_VIEW,
    payload: view,
  });
};

export const setModalOpen = (modalName, isOpen = true) => (dispatch) => {
  dispatch({
    type: SET_MODAL_OPEN,
    payload: {
      modalName,
      isOpen,
    },
  });
};

export const closeAllModals = () => (dispatch) => {
  dispatch({
    type: CLOSE_ALL_MODALS,
  });
};
