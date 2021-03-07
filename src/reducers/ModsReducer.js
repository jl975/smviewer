import * as actions from '../actions/ModsActions'
import { optionDefaultValues } from '../components/form/options'
import { updateUserSettings } from '../utils/userSettings'

const initialState = optionDefaultValues.mods

export const mods = (state = initialState, action) => {
  switch (action.type) {
    case actions.UPDATE_MODS: {
      const updatedMods = action.payload
      const updatedState = { ...state, ...updatedMods }
      updateUserSettings({ mods: updatedState })
      return updatedState
    }
    case actions.UPDATE_LANE_COVER_HEIGHT: {
      const { diff, canvasHeight } = action.payload
      const laneCoverHeight = [...state.laneCoverHeight]

      // don't let lane covers go beyond the chart area boundary
      let lowerBoundary = 0
      let upperBoundary = canvasHeight
      if (state.appearance === 'hiddensudden') upperBoundary /= 2
      for (let i = 0; i < laneCoverHeight.length; i++) {
        laneCoverHeight[i] += diff[i]
        const height = laneCoverHeight[i]
        if (height < lowerBoundary) laneCoverHeight[i] = lowerBoundary
        else if (height > upperBoundary) laneCoverHeight[i] = upperBoundary
      }

      const updatedState = { ...state, laneCoverHeight }
      updateUserSettings({ mods: updatedState })
      return updatedState
    }
    default:
      return state
  }
}
