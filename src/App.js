import React from "react";
import { Route, Switch, withRouter, useHistory } from "react-router-dom";

import MainContainer from "./containers/main/MainContainer";
import HelpContainer from "./containers/main/HelpContainer";
import Navbar from "./components/navigation/Navbar";

function App() {
  const history = useHistory();

  return (
    <div className="app-container">
      <Switch>
        <Route
          exact
          path="/"
          // component={MainContainer}
          render={(routeProps) => <MainContainer {...routeProps} />}
        />
        <Route exact path="/help" render={(routeProps) => <HelpContainer {...routeProps} />} />
      </Switch>
      <Navbar history={history} />
    </div>
  );
}

export default withRouter(App);
