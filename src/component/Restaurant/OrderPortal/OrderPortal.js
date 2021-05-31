import React, { Component } from "react";
import qs from "query-string";
import { fetchMenuApi, submitOrderApi } from "../../../common/Api";
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
import ListIcon from "@material-ui/icons/List";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import pageExpiredImage from "../../../asset/image/pageExpired.svg";

class OrderPortal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      idToken: "fetching",
      specialRequestText: "",
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
      showOrderPlacedModal: false,
      showLoadingModal: false,
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
              originalCustomization: this.state.currentMenuItem.customization,
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
    const { cartItems, specialRequestText } = this.state;
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
        let customizationText = "";

        items.map((i) => {
          itemTotal += i.price;
          if (i.customization) {
            for (let key in i.customization) {
              i.customization[key].map((j) => {
                customizationText += j.name + ", ";
                itemTotal += j.price;
              });
            }
          }
        });
        totalCartAmount += itemTotal;

        let itemJSX = (
          <div className="cart-slide" key={key}>
            <FoodTypeIcon isVeg={item.type.toLowerCase() === "veg"} />
            <span className="item-name">
              {item.name}
              {customizationText ? (
                <>
                  <br />
                  <span className="customization">
                    {customizationText.substring(
                      0,
                      customizationText.length - 2
                    )}
                  </span>
                </>
              ) : null}
            </span>
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
          <div className="requirements">
            <ListIcon style={{ fill: "#686b78" }} />
            <input
              type="text"
              name="request"
              placeholder="Any restaurant request? We will try our best to convey it"
              value={specialRequestText}
              onChange={(e) =>
                this.setState({ specialRequestText: e.target.value })
              }
            />
          </div>
        </div>
      </>
    );
  };

  submitOrder = () => {
    this.setState({
      showLoadingModal: true,
      showCart: false,
    });
    const { cartItems, idToken, specialRequestText } = this.state;
    let itemsById = {};
    let orderItems = [];
    cartItems.forEach((item) => {
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

      if (item.customization === null) {
        orderItems.push({
          Id: key,
          Name: item.name,
          Price: item.price,
          Quantity: items.length,
        });
      } else {
        items.map((item) => {
          let Customizations = [];
          const { customization, originalCustomization } = item;
          for (let key in customization) {
            Customizations.push({
              Name: originalCustomization[key].step,
              SelectedOptions: customization[key].map((cItem) => {
                return {
                  Id: cItem.id,
                  Name: cItem.name,
                  Price: cItem.price,
                };
              }),
            });
          }
          orderItems.push({
            Id: key,
            Name: item.name,
            Price: item.price,
            Quantity: 1,
            Customizations,
          });
        });
      }
    }

    submitOrderApi(idToken, {
      SpecialRequest: specialRequestText,
      OrderedItems: orderItems,
    })
      .then((res) => {
        this.setState({ showOrderPlacedModal: true, showLoadingModal: false });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({
          showLoadingModal: false,
          showCart: true,
        });
      });
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
      showOrderPlacedModal,
      showLoadingModal,
    } = this.state;
    const { name, logoPath, category, rating, coupon, menu } = menuItems;

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
      return (
        <div className="page-not-found-container">
          <img src={pageExpiredImage} alt="Expired" />
          <p className="text-center mt-3">Your Page has expired.</p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <CircularProgress />
        </div>
      );
    }

    return (
      <div className="container">
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
            className="browse-categories-bottom-sheet"
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
            className="customization-bottom-sheet"
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

          <Dialog
            open={showOrderPlacedModal}
            onClose={() => this.setState({ showOrderPlacedModal: false })}
            disableBackdropClick
          >
            <DialogTitle className="order-place-dialog-title">
              <CheckCircleIcon style={{ fill: "#60b246" }} /> Success
            </DialogTitle>
            <DialogContent className="order-place-dialog-content">
              <DialogContentText>
                Your order has been placed successfully.
              </DialogContentText>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showLoadingModal}
            onClose={() => this.setState({ showLoadingModal: false })}
            disableBackdropClick
          >
            <DialogTitle className="loading-dialog-title">
              <CircularProgress size={25} /> Please wait
            </DialogTitle>
            <DialogContent className="order-place-dialog-content">
              <DialogContentText>
                Give us a moment, we are placing your oder.
              </DialogContentText>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }
}

export default OrderPortal;
