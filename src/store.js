import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

import reducers from "./reducers";

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.__REDUX_DEVTOOLS_EXTENSION__() : (f) => f
  )
);

export default store;
