import * as actions from "../actions/AudioActions";

const initialState = {
  chartAudio: {
    status: "stopped",
    progress: 0,
  },
  previewAudio: {
    status: "stopped",
  },
};

export const audio = (state = initialState, action) => {
  switch (action.type) {
    case actions.PLAY_CHART_AUDIO: {
      const chartAudio = { ...state.chartAudio, status: "playing" };
      return { ...state, chartAudio };
    }
    case actions.PAUSE_CHART_AUDIO: {
      const chartAudio = { ...state.chartAudio, status: "paused" };
      return { ...state, chartAudio };
    }
    case actions.STOP_CHART_AUDIO: {
      const chartAudio = { ...state.chartAudio, status: "stopped" };
      return { ...state, chartAudio };
    }
    case actions.PLAY_PREVIEW_AUDIO: {
      const previewAudio = { ...state.previewAudio, status: "playing" };
      return { ...state, previewAudio };
    }
    case actions.STOP_PREVIEW_AUDIO: {
      const previewAudio = { ...state.previewAudio, status: "stopped" };
      return { ...state, previewAudio };
    }
    case actions.SET_CHART_PROGRESS: {
      const chartAudio = { ...state.chartAudio, progress: action.payload };
      return { ...state, chartAudio };
    }
    default:
      return state;
  }
};
