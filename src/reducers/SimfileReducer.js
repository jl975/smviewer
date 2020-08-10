import * as actions from "../actions/SimfileActions";

const initialState = {
  simfileList: []
};

export const simfiles = (state = initialState, action) => {
  switch (action.type) {
    case actions.GET_SIMFILE_LIST: {
      const simfileList = action.payload;
      return { ...state, simfileList };
    }
    default:
      return state;
  }
};
