export const UPDATE_MODS = "UPDATE_MODS";
export const UPDATE_LANE_COVER_HEIGHT = "UPDATE_LANE_COVER_HEIGHT";
export const TRACK_PRECONFIRM_OFFSET = "TRACK_PRECONFIRM_OFFSET";

export const updateMods = (mods) => (dispatch) => {
  dispatch({
    type: UPDATE_MODS,
    payload: mods,
  });
};

export const updateLaneCoverHeight = (payload) => (dispatch) => {
  dispatch({
    type: UPDATE_LANE_COVER_HEIGHT,
    payload,
  });
};
