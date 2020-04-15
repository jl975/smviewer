import { combineReducers } from "redux";

import { audio } from "./AudioReducer";
import { chart } from "./ChartReducer";
import { songSelect } from "./SongSelectReducer";

export default combineReducers({ audio, chart, songSelect });
