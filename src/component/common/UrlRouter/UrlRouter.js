import React, { Component } from "react";
import { urlResolver } from "../../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import pageExpiredImage from "../../../asset/image/pageExpired.svg";

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

  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      let token = this.props.match.params.token;
      if (token === "profile") {
        this.props.history.push(
          "/user" + this.props.location.pathname + this.props.location.search
        );
      } else {
        this.setState({ errorOccurred: true });
      }
    }
  }

  render() {
    if (this.state.errorOccurred) {
      return (
        <div className="page-not-found-container">
          <img src={pageExpiredImage} alt="Expired" />
          <p className="text-center mt-3">Your Page has expired.</p>
        </div>
      );
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
