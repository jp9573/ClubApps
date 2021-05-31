import React, { Component } from "react";
import { Route, Switch } from "react-router";
import { routesMapping } from "./common/const";
import PageNotFound from "./component/PageNotFound/PageNotFound";
class App extends Component {
  state = { width: 0, height: 0 };
  minWidth = 414;
  minHeight = 896;

  updateDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  };

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    if (
      window.innerWidth > this.minWidth ||
      window.innerHeight > this.minHeight ||
      this.state.width > this.minWidth ||
      this.state.height > this.minHeight
    ) {
      return <></>;
    }

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
        <Route component={PageNotFound} />
      </Switch>
    );
  }
}

export default App;
