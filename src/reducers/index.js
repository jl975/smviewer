import { combineReducers } from "redux";

import { audio } from "./AudioReducer";
import { chart } from "./ChartReducer";

export default combineReducers({ audio, chart });
