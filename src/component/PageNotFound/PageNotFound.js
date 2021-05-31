import React, { Component } from "react";
import "./PageNotFound.scss";
import pageNotFoundImage from "../../asset/image/404.svg";

class PageNotFound extends Component {
  render() {
    return (
      <div className="page-not-found-container">
        <img src={pageNotFoundImage} alt="404" className="img-fluid" />
        <p className="text-center mt-3">Oops! We can't find it. Can you ?</p>
      </div>
    );
  }
}

export default PageNotFound;
