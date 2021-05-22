import React from "react";
import "./CouponCard.scss";
import LoyaltyIcon from "@material-ui/icons/Loyalty";

const CouponCard = (props) => {
  const { heading, detail } = props;
  return (
    <div className="card coupon-card">
      <p className="d-flex align-items-center">
        <LoyaltyIcon style={{ fill: "#FC8019" }} />
        <span>{heading}</span>
      </p>
      <span className="detail">{detail}</span>
    </div>
  );
};

export default CouponCard;
