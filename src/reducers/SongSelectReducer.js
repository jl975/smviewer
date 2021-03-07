import * as actions from '../actions/SongSelectActions'
import { optionDefaultValues } from '../components/form/options'
import { updateUserSettings } from '../utils/userSettings'

const initialState = {
  difficulty: optionDefaultValues.difficulty,
  mode: optionDefaultValues.mode,
}

export const songSelect = (state = initialState, action) => {
  switch (action.type) {
    case actions.SELECT_SONG: {
      const song = action.payload
      updateUserSettings({ song: song.hash })
      return { ...state, song }
    }
    case actions.SELECT_DIFFICULTY: {
      const difficulty = action.payload
      updateUserSettings({ difficulty })
      return { ...state, difficulty }
    }
    case actions.SELECT_MODE: {
      const mode = action.payload
      updateUserSettings({ mode })
      return { ...state, mode }
    }
    default:
      return state
  }
}
