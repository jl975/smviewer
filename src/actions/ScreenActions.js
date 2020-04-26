export const RESIZE_SCREEN = "RESIZE_SCREEN";

export const resizeScreen = (e) => (dispatch) => {
  dispatch({
    type: RESIZE_SCREEN,
    payload: e,
  });
};
