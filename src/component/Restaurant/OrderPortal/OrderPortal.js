import React, { Component } from "react";
import qs from "query-string";
import { fetchMenuApi } from "../../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./OrderPortal.scss";
import StarIcon from "@material-ui/icons/Star";
import CouponCard from "./CouponCard/CouponCard";

class OrderPortal extends Component {
  state = {
    idToken: "fetching",
    menuItems: {},
    isLoading: true,
  };

  componentDidMount() {
    const queryObj = qs.parse(this.props.location.search);
    this.setState({ idToken: queryObj.idtoken });
    this.fetchMenuItems(queryObj.idtoken);
  }

  fetchMenuItems = (idToken) => {
    fetchMenuApi(idToken)
      .then((res) => {
        this.setState({ menuItems: res.data, isLoading: false });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  render() {
    const { idToken, menuItems, isLoading } = this.state;
    const { name, category, rating, coupon } = menuItems;

    if (!idToken || idToken.length === 0) {
      return <p>Invalid session, please try again with valid link.</p>;
    }

    if (isLoading) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <CircularProgress />
        </div>
      );
    }

    return (
      <div className="order-portal">
        <div className="top-section d-flex flex-wrap justify-content-between align-items-center">
          <div className="d-flex flex-column">
            <span className="title">{name}</span>
            <span className="category">{category}</span>
          </div>
          <div className="rating-box d-flex flex-column">
            <div className="d-flex align-self-center">
              <StarIcon />
              <span className="rating">{rating.value}</span>
            </div>
            <span className="impressions text-center">
              {rating.impressions}
            </span>
          </div>
        </div>

        {coupon ? (
          <div className="coupon-section">
            <CouponCard {...coupon} />
          </div>
        ) : null}
      </div>
    );
  }
}

export default OrderPortal;
