import React, { Component } from "react";
import "./MenuItemCard.scss";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

const FoodTypeIcon = (props) => {
  return (
    <div className={`food-icon ${props.isVeg ? "veg" : "non-veg"}`}>
      <div className="round"></div>
    </div>
  );
};

const AddButton = (props) => {
  return props.cartItemCount === 0 ? (
    <button className="btn btn-success add-button" onClick={props.onItemAdd}>
      ADD
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
  const {
    id,
    name,
    price,
    imageUrl,
    type,
    tag,
    shortDescription,
    customization,
  } = menuItem;

  return (
    <div className="card menu-item-card basic-card">
      <div className="d-flex align-items-center title">
        <FoodTypeIcon isVeg={type.toLowerCase() == "veg"} />
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
  return (
    <div className="card menu-item-card rich-card">
      <FoodTypeIcon isVeg={props.type.toLowerCase() == "veg"} />
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
