import React, { Component } from "react";
import "./AccountProfile.scss";
import logo from "../../asset/ticket/logo.svg";
import userIcon from "../../asset/accountProfile/user.svg";
import phoneIcon from "../../asset/accountProfile/phone.svg";

class AccountProfile extends Component {
  state = {
    profilePic: userIcon,
    contactNo: "99491 89336",
    name: "Harshal Priyadarshi",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    upiId: "",
  };

  render() {
    const {
      profilePic,
      contactNo,
      name,
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      upiId,
    } = this.state;

    return (
      <div className="account-profile-container">
        <div className="top-section">
          <img src={logo} alt="Logo" />
        </div>
        <div className="profile-card">
          <div className="top-row">
            <h3>Account Profile</h3>
            <div className="profile-pic-holder">
              <img src={profilePic} alt="Profile" />
            </div>
          </div>
          <div className="phone-content">
            <img src={phoneIcon} alt="Phone" />
            <span>{contactNo}</span>
          </div>
          <div className="group name-group">
            <span className="label">Full Name</span>
            <span className="name">{name}</span>
          </div>
          <div className="group email-group">
            <span className="label">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
            />
          </div>

          <div className="billing-group">
            <h3>Billing Address</h3>
            <div className="group">
              <span className="label">Address Line 1</span>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) =>
                  this.setState({ addressLine1: e.target.value })
                }
              />
            </div>
            <div className="group">
              <span className="label">Address Line 2</span>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) =>
                  this.setState({ addressLine2: e.target.value })
                }
              />
            </div>
            <div className="d-grid">
              <div className="group">
                <span className="label">City</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => this.setState({ city: e.target.value })}
                />
              </div>
              <div className="group">
                <span className="label">State</span>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => this.setState({ state: e.target.value })}
                />
              </div>
            </div>
            <div className="d-grid">
              <div className="group">
                <span className="label">Postal Code</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) =>
                    this.setState({ postalCode: e.target.value })
                  }
                />
              </div>
              <div className="group">
                <span className="label">Country</span>
                <span className="country">{country}</span>
              </div>
            </div>
          </div>

          <div className="payment-group">
            <h3>Payment Information</h3>
            <div className="group">
              <span className="label">UPI ID</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => this.setState({ upiId: e.target.value })}
              />
            </div>
          </div>

          <button className="btn btn-primary save-button">SAVE</button>
        </div>
      </div>
    );
  }
}

export default AccountProfile;
