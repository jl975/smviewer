export const SET_BPM_CHANGE_QUEUE = "SET_BPM_CHANGE_QUEUE";
export const CHANGE_ACTIVE_BPM_DISPLAY = "CHANGE_ACTIVE_BPM_DISPLAY";
export const SET_COMBO = "SET_COMBO";

export const setBpmChangeQueue = (payload) => (dispatch) => {
  dispatch({
    type: SET_BPM_CHANGE_QUEUE,
    payload,
  });
};

export const changeActiveBpm = (bpm) => (dispatch) => {
  dispatch({
    type: CHANGE_ACTIVE_BPM_DISPLAY,
    payload: bpm,
  });
};

export const setCombo = (combo) => (dispatch) => {
  dispatch({
    type: SET_COMBO,
    payload: combo,
  });
};
