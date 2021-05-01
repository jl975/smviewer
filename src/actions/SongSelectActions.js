export const SELECT_SONG = 'SELECT_SONG'
export const SELECT_DIFFICULTY = 'SELECT_DIFFICULTY'
export const SELECT_MODE = 'SELECT_MODE'

export const UPDATE_SONG_APP_OFFSET = 'UPDATE_SONG_APP_OFFSET'

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

export const updateSongAppOffset = (offset) => (dispatch) => {
  dispatch({
    type: UPDATE_SONG_APP_OFFSET,
    payload: offset,
  })
}
