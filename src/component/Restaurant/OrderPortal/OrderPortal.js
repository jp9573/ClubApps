import React, { Component } from "react";
import qs from "query-string";
import { fetchMenuApi } from "../../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./OrderPortal.scss";
import StarIcon from "@material-ui/icons/Star";
import CouponCard from "./CouponCard/CouponCard";
import Switch from "@material-ui/core/Switch";
import MenuItemCard from "./MenuItemCard/MenuItemCard";

class OrderPortal extends Component {
  state = {
    idToken: "fetching",
    menuItems: {},
    isLoading: true,
    vegOnly: false,
    cartItems: [],
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

  handleOnVegOnly = (e) => {
    this.setState({ vegOnly: e.target.checked });
  };

  onItemRemove = (item) => {
    let cartItems = this.state.cartItems;
    let index = cartItems.indexOf(item.id);
    if (index >= 0) {
      cartItems.splice(index, 1);
    }
    this.setState({ cartItems });
  };

  onItemAdd = (item) => {
    this.setState({ cartItems: [...this.state.cartItems, item.id] });
  };

  getMenuSections = (menu) => {
    let { cartItems } = this.state;
    let wantToRepeatSection = undefined;
    let sections = null;

    if (menu.hasOwnProperty("Want to Repeat?")) {
      wantToRepeatSection = menu["Want to Repeat?"];

      sections = (
        <div className="section repeat-section">
          <h5>Want to Repeat?</h5>
          <div className="items">
            {wantToRepeatSection.map((item, index) => (
              <MenuItemCard
                basicCard
                menuItem={item}
                key={index}
                cartItemCount={cartItems.filter((i) => i === item.id).length}
                onItemRemove={() => this.onItemRemove(item)}
                onItemAdd={() => this.onItemAdd(item)}
              />
            ))}
          </div>
          <div className="grey-line"></div>
        </div>
      );
    }

    return sections;
  };

  render() {
    const { idToken, menuItems, isLoading, vegOnly } = this.state;
    const { name, category, rating, coupon, menu } = menuItems;

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

        <div className="main-section">
          <div className="grey-line"></div>
          <div className="veg-only d-flex align-items-center">
            <span>Veg Only</span>
            <Switch
              checked={vegOnly}
              onChange={this.handleOnVegOnly}
              name="vegOnly"
            />
          </div>
          <div className="menu-sections">{this.getMenuSections(menu)}</div>
        </div>
      </div>
    );
  }
}

export default OrderPortal;
