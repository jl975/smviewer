export const UPDATE_SETTINGS = 'UPDATE_SETTINGS'

export const updateSettings = (settings) => (dispatch) => {
  dispatch({
    type: UPDATE_SETTINGS,
    payload: settings,
  })
}
