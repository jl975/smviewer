export const PLAY_CHART_AUDIO = "PLAY_CHART_AUDIO";
export const PAUSE_CHART_AUDIO = "PAUSE_CHART_AUDIO";
export const STOP_CHART_AUDIO = "STOP_CHART_AUDIO";

export const PLAY_PREVIEW_AUDIO = "PLAY_PREVIEW_AUDIO";
export const STOP_PREVIEW_AUDIO = "STOP_PREVIEW_AUDIO";

export const SET_CHART_PROGRESS = "SET_CHART_PROGRESS";

export const playChartAudio = () => (dispatch) => {
  dispatch({
    type: PLAY_CHART_AUDIO,
  });
};

export const pauseChartAudio = () => (dispatch) => {
  dispatch({
    type: PAUSE_CHART_AUDIO,
  });
};

export const stopChartAudio = () => (dispatch) => {
  dispatch({
    type: STOP_CHART_AUDIO,
  });
};

export const playPreviewAudio = () => (dispatch) => {
  dispatch({
    type: PLAY_PREVIEW_AUDIO,
  });
};
export const stopPreviewAudio = () => (dispatch) => {
  dispatch({
    type: STOP_PREVIEW_AUDIO,
  });
};

export const setChartProgress = (progress) => (dispatch) => {
  dispatch({
    type: SET_CHART_PROGRESS,
    payload: progress,
  });
};
