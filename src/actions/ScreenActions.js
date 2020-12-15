export const RESIZE_SCREEN = "RESIZE_SCREEN";
export const SET_ACTIVE_VIEW = "SET_ACTIVE_VIEW";
export const SET_OFFSET_MODAL_OPEN = "SET_OFFSET_MODAL_OPEN";

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

export const setOffsetModalOpen = (isOpen) => (dispatch) => {
  dispatch({
    type: SET_OFFSET_MODAL_OPEN,
    payload: isOpen,
  });
};
