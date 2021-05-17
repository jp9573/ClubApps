import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { routesMapping } from "./common/const";

class App extends Component {
  state = {};
  render() {
    return (
      <Switch>
        {Object.keys(routesMapping).map((route, index) => (
          <Route
            path={route}
            exact
            key={index}
            component={routesMapping[route]}
          />
        ))}
      </Switch>
    );
  }
}

export default App;
