import { combineReducers } from "redux";

import { audio } from "./AudioReducer";
import { chart } from "./ChartReducer";
import { mods } from "./ModsReducer";
import { screen } from "./ScreenReducer";
import { songSelect } from "./SongSelectReducer";

export default combineReducers({ audio, chart, mods, screen, songSelect });
