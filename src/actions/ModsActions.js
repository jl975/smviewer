export const UPDATE_MODS = "UPDATE_MODS";

export const updateMods = (mods) => (dispatch) => {
  dispatch({
    type: UPDATE_MODS,
    payload: mods,
  });
};
