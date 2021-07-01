import * as actions from '../actions/SettingsActions'
import { getUserSettings, updateUserSettings } from '../utils/userSettings'

const initialSettings = getUserSettings()

const initialState = {
  filters: initialSettings.filters || {
    title: 'all',
    version: 17,
    level: 'all',
    difficulty: 'all',
    bpm: 'all',
    includeDeleted: true,
  },
}

export const settings = (state = initialState, action) => {
  switch (action.type) {
    case actions.UPDATE_SETTINGS: {
      const updatedSettings = action.payload
      const updatedState = { ...state, ...updatedSettings }
      updateUserSettings(updatedState)
      return updatedState
    }
    default:
      return state
  }
}
