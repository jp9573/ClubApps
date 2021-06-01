import React, { Component } from "react";
import "./MenuItemCard.scss";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import StarIcon from "@material-ui/icons/Star";

export const FoodTypeIcon = (props) => {
  return (
    <div className={`food-icon ${props.isVeg ? "veg" : "non-veg"}`}>
      <div className="round"></div>
    </div>
  );
};

const AddButton = (props) => {
  return props.cartItemCount === 0 ? (
    <button className="btn btn-success add-button" onClick={props.onItemAdd}>
      ADD{" "}
      {props.hasCustomization ? <AddIcon style={{ fill: "#60B246" }} /> : null}
    </button>
  ) : (
    <div className="add-button-container">
      <RemoveIcon style={{ fill: "#60B246" }} onClick={props.onItemRemove} />
      <span className="count">{props.cartItemCount}</span>
      <AddIcon style={{ fill: "#60B246" }} onClick={props.onItemAdd} />
    </div>
  );
};

const BasicCard = (props) => {
  const { menuItem, cartItemCount, onItemRemove, onItemAdd } = props;
  const { name, price, isVeg, shortDescription } = menuItem;

  return (
    <div className="card menu-item-card basic-card">
      <div className="d-flex align-items-center title">
        <FoodTypeIcon isVeg={isVeg} />
        <span className="item-name">{name}</span>
      </div>
      <span className="description">{shortDescription}</span>

      <div className="footer-section">
        <span className="price">&#8377; {price}</span>
        <AddButton
          cartItemCount={cartItemCount}
          onItemRemove={onItemRemove}
          onItemAdd={onItemAdd}
        />
      </div>
    </div>
  );
};

const RichCard = (props) => {
  const { menuItem, cartItemCount, onItemRemove, onItemAdd } = props;
  const {
    name,
    price,
    imageUrl,
    isVeg,
    tag,
    shortDescription,
    customizations,
  } = menuItem;

  return (
    <div className="rich-card">
      <div className="left-section">
        <div className="d-flex align-items-center title">
          <FoodTypeIcon isVeg={isVeg} />
          {tag ? (
            <>
              <StarIcon style={{ fill: "#FC8019" }} />
              <span>{tag}</span>
            </>
          ) : null}
        </div>
        <span className="item-name">{name}</span>
        <span className="price">&#8377; {price}</span>
        <span className="description">{shortDescription}</span>
      </div>

      <div className="right-section">
        {imageUrl ? <img src={imageUrl} alt="Food Item" /> : null}
        <AddButton
          cartItemCount={cartItemCount}
          onItemRemove={onItemRemove}
          onItemAdd={onItemAdd}
          hasCustomization={customizations !== null}
        />
        {customizations ? (
          <span className="customization">Customizable</span>
        ) : null}
      </div>
    </div>
  );
};

class MenuItemCard extends Component {
  render() {
    const { basicCard } = this.props;
    return basicCard ? (
      <BasicCard {...this.props} />
    ) : (
      <RichCard {...this.props} />
    );
  }
}

export default MenuItemCard;
