import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import MainContainer from "./containers/main/MainContainer";

function App() {
  return (
    <div className="app-container">
      <Switch>
        <Route exact path="/" component={MainContainer} />
      </Switch>
    </div>
  );
}

export default withRouter(App);
