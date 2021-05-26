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
    originalMenuItems: {},
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
        this.setState({
          menuItems: res.data,
          originalMenuItems: res.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  handleOnVegOnly = (e) => {
    let vegOnly = e.target.checked;
    let menuItems = JSON.parse(JSON.stringify(this.state.originalMenuItems));
    if (vegOnly) {
      let menu = menuItems.menu;
      for (var key in menu) {
        menu[key] = menu[key].filter(
          (item) => item.type.toLowerCase() === "veg"
        );
        if (menu[key].length === 0) {
          delete menu[key];
        }
      }
      menuItems.menu = menu;
    }
    this.setState({ vegOnly, menuItems });
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
    let wantToRepeatSection = null;
    let sections = null;

    if (menu.hasOwnProperty("Want to Repeat?")) {
      wantToRepeatSection = menu["Want to Repeat?"];

      wantToRepeatSection = (
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

    for (var key in menu) {
      if (menu.hasOwnProperty(key) && key !== "Want to Repeat?") {
        let jsx = (
          <>
            <div className="section">
              <h5>{key}</h5>
              <div className="items">
                {menu[key].map((item, index) => (
                  <MenuItemCard
                    menuItem={item}
                    key={index}
                    cartItemCount={
                      cartItems.filter((i) => i === item.id).length
                    }
                    onItemRemove={() => this.onItemRemove(item)}
                    onItemAdd={() => this.onItemAdd(item)}
                  />
                ))}
              </div>
              <div className="grey-line"></div>
            </div>
          </>
        );

        if (sections === null) {
          sections = jsx;
        } else {
          sections = (
            <>
              {sections}
              {jsx}
            </>
          );
        }
      }
    }

    return (
      <>
        {wantToRepeatSection}
        {sections}
      </>
    );
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
