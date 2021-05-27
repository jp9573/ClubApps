import React, { Component } from "react";
import { urlResolver } from "../../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";

class UrlRouter extends Component {
  state = { errorOccurred: false };

  componentDidMount() {
    let token = this.props.match.params.token;
    urlResolver(token)
      .then((res) => {
        let url = res.data.longUrl;
        url = url.substring(url.indexOf(".in"));
        url = url.substring(url.indexOf("/"));
        this.props.history.push(url);
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ errorOccurred: true });
      });
  }

  render() {
    if (this.state.errorOccurred) {
      return <h3>Something went wrong, please try again later</h3>;
    } else {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <CircularProgress />
        </div>
      );
    }
  }
}

export default UrlRouter;
