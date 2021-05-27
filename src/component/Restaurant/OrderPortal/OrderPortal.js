import React, { Component } from "react";
import qs from "query-string";
import { fetchMenuApi } from "../../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import "./OrderPortal.scss";
import StarIcon from "@material-ui/icons/Star";
import CouponCard from "./CouponCard/CouponCard";
import Switch from "@material-ui/core/Switch";
import MenuItemCard, { FoodTypeIcon } from "./MenuItemCard/MenuItemCard";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";
import ShoppingBasketIcon from "@material-ui/icons/ShoppingBasket";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";

class OrderPortal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: "fetching",
      menuItems: {},
      originalMenuItems: {},
      isLoading: true,
      vegOnly: false,
      cartItems: [],
      showCart: false,
      isBrowseMenuVisible: false,
      isCustomizationMenuVisible: false,
      currentMenuItem: undefined,
      currentCustomizationIndex: undefined,
      currentCustomizationSelection: undefined,
    };
    this.sectionRefs = {};
  }

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
    let { cartItems, showCart } = this.state;
    let index = cartItems.findIndex((p) => p.id === item.id);
    if (index >= 0) {
      cartItems.splice(index, 1);
    }
    if (showCart && cartItems.length === 0) {
      showCart = false;
    }
    this.setState({ cartItems, showCart });
  };

  onItemAdd = (item, doNotAskCustomization = false) => {
    if (item.customization === null || doNotAskCustomization) {
      this.setState({ cartItems: [...this.state.cartItems, item] });
    } else {
      this.setState({
        currentMenuItem: item,
        currentCustomizationIndex: 0,
        isCustomizationMenuVisible: true,
        currentCustomizationSelection: {
          0: [],
        },
      });
    }
  };

  getMenuSections = (menu) => {
    let { cartItems } = this.state;
    let wantToRepeatSection = null;
    let sections = null;

    if (menu.hasOwnProperty("Want to Repeat?")) {
      wantToRepeatSection = menu["Want to Repeat?"];
      this.sectionRefs["Want to Repeat?"] = React.createRef();

      wantToRepeatSection = (
        <div
          className="section repeat-section"
          ref={(ref) => (this.sectionRefs["Want to Repeat?"] = ref)}
        >
          <h5>Want to Repeat?</h5>
          <div className="items">
            {wantToRepeatSection.map((item, index) => (
              <MenuItemCard
                basicCard
                menuItem={item}
                key={index}
                cartItemCount={cartItems.filter((i) => i.id === item.id).length}
                onItemRemove={() => this.onItemRemove(item)}
                onItemAdd={() => this.onItemAdd(item)}
              />
            ))}
          </div>
          <div className="grey-line"></div>
        </div>
      );
    }

    for (let key in menu) {
      if (menu.hasOwnProperty(key) && key !== "Want to Repeat?") {
        this.sectionRefs[key] = React.createRef();
        let jsx = (
          <>
            <div
              className="section"
              key={key}
              ref={(ref) => (this.sectionRefs[key] = ref)}
            >
              <h5>{key}</h5>
              <div className="items">
                {menu[key].map((item, index) => (
                  <MenuItemCard
                    menuItem={item}
                    key={index}
                    cartItemCount={
                      cartItems.filter((i) => i.id === item.id).length
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

  openBrowseMenu = () => {
    this.setState({ isBrowseMenuVisible: true });
  };

  getBottomSheetCategoriesJSX = () => {
    let menu = this.state.menuItems.menu;

    const scrollToSection = (sectionName) => {
      this.sectionRefs[sectionName].scrollIntoView({
        behavior: "smooth",
      });
      this.setState({ isBrowseMenuVisible: false });
    };

    return (
      <>
        <div
          className="category-item"
          onClick={() => scrollToSection("Want to Repeat?")}
        >
          <span className="item-name">Want to Repeat?</span>
          <span className="count">{menu["Want to Repeat?"].length}</span>
        </div>
        {Object.keys(menu).map((key, index) => {
          if (key !== "Want to Repeat?") {
            return (
              <div
                className="category-item"
                key={index}
                onClick={() => scrollToSection(key)}
              >
                <span className="item-name">{key}</span>
                <span className="count">{menu[key].length}</span>
              </div>
            );
          } else {
            return null;
          }
        })}
      </>
    );
  };

  getCustomizationMenuJSX = () => {
    const {
      currentMenuItem,
      currentCustomizationIndex,
      currentCustomizationSelection,
    } = this.state;

    if (!currentMenuItem) return null;

    const customization =
      currentMenuItem.customization[currentCustomizationIndex];
    const { step, selectionType, options } = customization;

    let totalPrice = currentMenuItem.price;
    let isButtonDisabled = false;

    if (
      selectionType === "Single" &&
      currentCustomizationSelection[currentCustomizationIndex].length === 0
    ) {
      isButtonDisabled = true;
    }

    if (currentCustomizationSelection[currentCustomizationIndex]) {
      for (let key in currentCustomizationSelection) {
        currentCustomizationSelection[key].forEach((option) => {
          totalPrice += option.price;
        });
      }
    }

    const onItemAdd = () => {
      if (
        currentMenuItem.customization.length - 1 >
        currentCustomizationIndex
      ) {
        this.setState({
          currentCustomizationIndex: currentCustomizationIndex + 1,
          currentCustomizationSelection: {
            ...this.state.currentCustomizationSelection,
            [currentCustomizationIndex + 1]: [],
          },
        });
      } else {
        this.setState({
          cartItems: [
            ...this.state.cartItems,
            {
              ...this.state.currentMenuItem,
              customization: { ...this.state.currentCustomizationSelection },
            },
          ],
          isCustomizationMenuVisible: false,
          currentMenuItem: undefined,
          currentCustomizationIndex: undefined,
          currentCustomizationSelection: undefined,
        });
      }
    };

    return (
      <>
        <div className="top-section">
          <span className="title">{step}</span>
        </div>
        <div className="middle-section">
          {options.map((option, index) => {
            if (selectionType === "Single") {
              return (
                <div className="option-slide" key={index}>
                  <FoodTypeIcon isVeg={option.type.toLowerCase() === "veg"} />
                  <div>
                    <input
                      type="radio"
                      name={option.name}
                      id={option.name}
                      value={option.name}
                      checked={
                        currentCustomizationSelection[
                          currentCustomizationIndex
                        ] &&
                        currentCustomizationSelection[
                          currentCustomizationIndex
                        ].includes(option)
                      }
                      onChange={(e) => {
                        this.setState({
                          currentCustomizationSelection: {
                            ...this.state.currentCustomizationSelection,
                            [currentCustomizationIndex]: [option],
                          },
                        });
                      }}
                    />
                    <label htmlFor={option.name}>
                      {option.name}{" "}
                      <span className="price">&#8377; {option.price}</span>
                    </label>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="option-slide" key={index}>
                  <FoodTypeIcon isVeg={option.type.toLowerCase() === "veg"} />
                  <div>
                    <input
                      type="checkbox"
                      name={option.name}
                      id={option.name}
                      value={option.name}
                      checked={
                        currentCustomizationSelection[
                          currentCustomizationIndex
                        ] &&
                        currentCustomizationSelection[
                          currentCustomizationIndex
                        ].includes(option)
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          this.setState({
                            currentCustomizationSelection: {
                              ...this.state.currentCustomizationSelection,
                              [currentCustomizationIndex]: [
                                ...this.state.currentCustomizationSelection[
                                  currentCustomizationIndex
                                ],
                                option,
                              ],
                            },
                          });
                        } else {
                          this.setState({
                            currentCustomizationSelection: {
                              ...this.state.currentCustomizationSelection,
                              [currentCustomizationIndex]:
                                this.state.currentCustomizationSelection[
                                  currentCustomizationIndex
                                ].filter((item) => item !== option),
                            },
                          });
                        }
                      }}
                    />
                    <label htmlFor={option.name}>
                      {option.name}{" "}
                      <span className="price">&#8377; {option.price}</span>
                    </label>
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="bottom-section">
          <span className="price">Item total &#8377; {totalPrice}</span>
          <button
            className="btn btn-success next-button"
            onClick={onItemAdd}
            disabled={isButtonDisabled}
          >
            CONTINUE
          </button>
        </div>
      </>
    );
  };

  openCartMenu = () => {
    this.setState({ showCart: true });
  };

  getCartMenuJSX = () => {
    const { cartItems } = this.state;
    let totalCartAmount = 0;

    const getCartItemsJSX = (items) => {
      let itemsById = {};
      let jsx = null;
      items.forEach((item) => {
        if (itemsById.hasOwnProperty(item.id)) {
          itemsById[item.id].push(item);
        } else {
          itemsById[item.id] = [item];
        }
      });

      for (let key in itemsById) {
        let items = itemsById[key];
        let item = items[0];
        let itemTotal = 0;

        items.map((i) => {
          itemTotal += i.price;
          if (i.customization) {
            for (let key in i.customization) {
              i.customization[key].map((j) => (itemTotal += j.price));
            }
          }
        });
        totalCartAmount += itemTotal;

        let itemJSX = (
          <div className="cart-slide" key={key}>
            <FoodTypeIcon isVeg={item.type.toLowerCase() === "veg"} />
            <span className="item-name">{item.name}</span>
            <div className="item-counter">
              <RemoveIcon
                style={{ fill: "#60B246" }}
                onClick={() => this.onItemRemove(item)}
              />
              <span className="count">{items.length}</span>
              <AddIcon
                style={{ fill: "#60B246" }}
                onClick={() => this.onItemAdd(item, true)}
              />
            </div>
            <span className="item-total">&#8377; {itemTotal}</span>
          </div>
        );

        if (jsx === null) {
          jsx = itemJSX;
        } else {
          jsx = (
            <>
              {jsx}
              {itemJSX}
            </>
          );
        }
      }
      return jsx;
    };

    return (
      <>
        <div className="middle-section">
          {getCartItemsJSX(cartItems)}
          <div className="total-count">
            <span>Total</span>{" "}
            <span className="price">&#8377; {totalCartAmount}</span>
          </div>
        </div>
      </>
    );
  };

  render() {
    const {
      idToken,
      menuItems,
      isLoading,
      vegOnly,
      isBrowseMenuVisible,
      isCustomizationMenuVisible,
      cartItems,
      showCart,
    } = this.state;
    let { name, logoPath, category, rating, coupon, menu } = menuItems;
    logoPath =
      "data:image/jpeg;base64,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";

    let cartTotal = 0;
    cartItems.map((item) => {
      cartTotal += item.price;
      if (item.customization) {
        for (let key in item.customization) {
          item.customization[key].map((i) => (cartTotal += i.price));
        }
      }
    });

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
            <div className="d-flex align-self-center align-items-center">
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

        <div className="browse-menu" onClick={this.openBrowseMenu}>
          <RestaurantMenuIcon style={{ fill: "#ffffff" }} />
          <span>BROWSE MENU</span>
        </div>

        {cartItems.length > 0 ? (
          <div className="cart-items" onClick={this.openCartMenu}>
            <span className="item-count">
              {cartItems.length} Item{cartItems.length === 1 ? "" : "s"} |
              &#8377; {cartTotal}
            </span>
            <button
              className="btn btn-success view-cart-button"
              onClick={this.openCartMenu}
            >
              VIEW CART <ShoppingBasketIcon style={{ fill: "#ffffff" }} />
            </button>
          </div>
        ) : null}

        <BottomSheet
          open={isBrowseMenuVisible}
          onDismiss={() => {
            this.setState({ isBrowseMenuVisible: false });
          }}
          snapPoints={({ minHeight }) => minHeight}
        >
          <div className="browse-category-list">
            {this.getBottomSheetCategoriesJSX()}
          </div>
        </BottomSheet>

        <BottomSheet
          open={isCustomizationMenuVisible}
          onDismiss={() => {
            this.setState({ isCustomizationMenuVisible: false });
          }}
          snapPoints={({ minHeight }) => minHeight}
        >
          <div className="customization-menu-list">
            {this.getCustomizationMenuJSX()}
          </div>
        </BottomSheet>

        <BottomSheet
          open={showCart}
          onDismiss={() => {
            this.setState({ showCart: false });
          }}
          snapPoints={({ minHeight }) => minHeight}
          header={
            <div className="top-section d-flex align-items-center">
              {logoPath ? <img src={logoPath} alt="Logo" /> : null}
              <span className="title">{name}</span>
            </div>
          }
          footer={
            <div className="bottom-section d-flex justify-content-center align-items-center">
              <button
                className="btn btn-success order-button"
                onClick={this.submitOrder}
              >
                ORDER NOW
              </button>
            </div>
          }
        >
          <div className="cart-menu">{this.getCartMenuJSX()}</div>
        </BottomSheet>
      </div>
    );
  }
}

export default OrderPortal;
