import * as actions from "../actions/ChartActions";

const initialState = {
  activeBpm: null,
  combo: 0,
};

export const chart = (state = initialState, action) => {
  switch (action.type) {
    case actions.CHANGE_ACTIVE_BPM_DISPLAY: {
      // const activeBpm = action.payload;
      const activeBpm = Math.round(action.payload);
      return { ...state, activeBpm };
    }
    case actions.SET_COMBO: {
      return { ...state, combo: action.payload };
    }
    default:
      return state;
  }
};
