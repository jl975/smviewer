import * as actions from "../actions/ChartActions";

const initialState = {
  activeBpm: null,
  bpmChangeQueue: [],
};

export const chart = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_BPM_CHANGE_QUEUE: {
      return { ...state, bpmChangeQueue: [...action.payload] };
    }
    case actions.CHANGE_ACTIVE_BPM_DISPLAY: {
      // const activeBpm = action.payload;
      const activeBpm = Math.round(action.payload);
      return { ...state, activeBpm };
    }
    case actions.SET_COMBO: {
      return { ...state };
    }
    default:
      return state;
  }
};
