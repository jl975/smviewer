import * as actions from "../actions/ScreenActions";

const initialState = {
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
};

export const screen = (state = initialState, action) => {
  switch (action.type) {
    case actions.RESIZE_SCREEN: {
      const { target } = action.payload;
      const { innerWidth, innerHeight } = target;

      const values = { innerWidth, innerHeight };

      return { ...state, ...values };
    }
    default:
      return state;
  }
};
