import React from "react";
import { Route, Switch, withRouter } from "react-router-dom";

import MainContainer from "./containers/main/MainContainer";
import StaticViewContainer from "./containers/static";

function App() {
  return (
    <div className="app-container">
      <Switch>
        <Route
          exact
          path="/"
          // component={MainContainer}
          render={routeProps => <MainContainer {...routeProps} />}
        />
        <Route
          exact
          path="/static"
          // component={StaticViewContainer}
          render={routeProps => {
            return <StaticViewContainer {...routeProps} />;
          }}
        />
      </Switch>
    </div>
  );
}

export default withRouter(App);
