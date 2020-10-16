import * as actions from "../actions/SimfileActions";

const initialState = {
  simfileList: [],
  sm: null,
};

export const simfiles = (state = initialState, action) => {
  switch (action.type) {
    case actions.GET_SIMFILE_LIST: {
      const simfileList = action.payload;
      return { ...state, simfileList };
    }
    case actions.LOAD_SIMFILE: {
      const sm = action.payload;
      return { ...state, sm };
    }

    default:
      return state;
  }
};
