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
    let cartItems = this.state.cartItems;
    let index = cartItems.indexOf(item);
    if (index >= 0) {
      cartItems.splice(index, 1);
    }
    this.setState({ cartItems });
  };

  onItemAdd = (item) => {
    if (item.customization === null) {
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

    let totalPrice = 0;
    let isButtonDisabled = false;

    if (
      selectionType === "Single" &&
      currentCustomizationSelection[currentCustomizationIndex].length === 0
    ) {
      isButtonDisabled = true;
    }

    if (currentCustomizationSelection[currentCustomizationIndex]) {
      currentCustomizationSelection[currentCustomizationIndex].forEach(
        (option) => {
          totalPrice += option.price;
        }
      );
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

  render() {
    const {
      idToken,
      menuItems,
      isLoading,
      vegOnly,
      isBrowseMenuVisible,
      isCustomizationMenuVisible,
    } = this.state;
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
      </div>
    );
  }
}

export default OrderPortal;
