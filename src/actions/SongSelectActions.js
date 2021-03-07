export const SELECT_SONG = 'SELECT_SONG'
export const SELECT_DIFFICULTY = 'SELECT_DIFFICULTY'
export const SELECT_MODE = 'SELECT_MODE'

export const selectSong = (song) => (dispatch) => {
  dispatch({
    type: SELECT_SONG,
    payload: song,
  })
}

export const selectDifficulty = (difficulty) => (dispatch) => {
  dispatch({
    type: SELECT_DIFFICULTY,
    payload: difficulty,
  })
}

export const selectMode = (mode) => (dispatch) => {
  dispatch({
    type: SELECT_MODE,
    payload: mode,
  })
}
