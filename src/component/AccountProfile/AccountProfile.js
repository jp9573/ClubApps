import React, { Component } from "react";
import qs from "query-string";
import "./AccountProfile.scss";
import logo from "../../asset/ticket/logo.svg";
import userIcon from "../../asset/accountProfile/user.svg";
import phoneIcon from "../../asset/accountProfile/phone.svg";
import {
  isValidEmail,
  isValidText,
  isValidAddress,
  isValidTextOnly,
} from "../../common/function";
import { getUserProfileApi, saveUserProfileApi } from "../../common/Api";
import pageExpiredImage from "../../asset/image/pageExpired.svg";
import CircularProgress from "@material-ui/core/CircularProgress";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
};

class AccountProfile extends Component {
  state = {
    contactNo: "",
    name: "",
    email: "",
    emailErrorMessage: "",
    addressLine1: "",
    addressLine1ErrorMessage: "",
    addressLine2: "",
    addressLine2ErrorMessage: "",
    city: "",
    cityErrorMessage: "",
    state: "",
    stateErrorMessage: "",
    postalCode: "",
    postalCodeErrorMessage: "",
    country: "India",
    upiId: "",
    upiIdErrorMessage: "",
    idToken: "fetching",
    isLoading: true,
    isSaving: false,
    response: undefined,
    showSuccessSnackbar: false,
  };

  componentDidMount() {
    const queryObj = qs.parse(this.props.location.search);
    this.setState({ idToken: queryObj.idtoken });
    getUserProfileApi(queryObj.idtoken)
      .then((res) => {
        const data = res.data;
        const billingAddress = data.billingAddress;
        this.setState({
          response: data,
          name: data.user.givenName + " " + data.user.familyName,
          contactNo: data.user.phoneNumber ? data.user.phoneNumber : "",
          email: data.user.emailAddress ? data.user.emailAddress : "",
          addressLine1: billingAddress ? billingAddress.addressLine1 : "",
          addressLine2: billingAddress ? billingAddress.addressLine2 : "",
          city: billingAddress ? billingAddress.city : "",
          state: billingAddress ? billingAddress.state : "",
          postalCode: billingAddress ? billingAddress.postalCode : "",
          upiId: data.upiAddress ? data.upiAddress : "",
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  }

  hasValidValues = () => {
    let isValid = true;
    const {
      email,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      upiId,
    } = this.state;

    if (email.length === 0 || !isValidEmail(email)) {
      this.setState({ emailErrorMessage: "Please enter valid email address." });
      isValid = false;
    } else {
      this.setState({ emailErrorMessage: "" });
    }
    if (addressLine1.length === 0 || !isValidAddress(addressLine1)) {
      this.setState({
        addressLine1ErrorMessage: "Please enter valid address.",
      });
      isValid = false;
    } else {
      this.setState({ addressLine1ErrorMessage: "" });
    }
    if (addressLine2.length === 0 || !isValidAddress(addressLine2)) {
      this.setState({
        addressLine2ErrorMessage: "Please enter valid address.",
      });
      isValid = false;
    } else {
      this.setState({ addressLine2ErrorMessage: "" });
    }
    if (city.length === 0 || !isValidTextOnly(city)) {
      this.setState({ cityErrorMessage: "Please enter valid city." });
      isValid = false;
    } else {
      this.setState({ cityErrorMessage: "" });
    }
    if (state.length === 0 || !isValidTextOnly(state)) {
      this.setState({ stateErrorMessage: "Please enter valid state." });
      isValid = false;
    } else {
      this.setState({ stateErrorMessage: "" });
    }
    if (postalCode.length === 0 || !isValidText(postalCode)) {
      this.setState({
        postalCodeErrorMessage: "Please enter valid postal code.",
      });
      isValid = false;
    } else {
      this.setState({ postalCodeErrorMessage: "" });
    }
    if (upiId.length === 0 || !isValidText(upiId)) {
      this.setState({ upiIdErrorMessage: "Please enter valid UPI id." });
      isValid = false;
    } else {
      this.setState({ upiIdErrorMessage: "" });
    }

    return isValid;
  };

  handleSave = (e) => {
    e.preventDefault();
    const isValid = this.hasValidValues();

    if (isValid) {
      this.setState({ isSaving: true });
      const {
        email,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        upiId,
        idToken,
      } = this.state;

      let data = {
        user: {
          emailAddress: email,
        },
        billingAddress: {
          AddressLine1: addressLine1,
          AddressLine2: addressLine2,
          City: city,
          State: state,
          PostalCode: postalCode,
          Country: country,
        },
        upiAddress: upiId,
      };

      saveUserProfileApi(idToken, data)
        .then((res) => {
          this.setState({ showSuccessSnackbar: true, isSaving: false });
        })
        .catch((err) => {
          console.error(err.message);
          this.setState({
            idToken: undefined,
            isSaving: false,
          });
        });
    }
  };

  render() {
    const {
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
      emailErrorMessage,
      addressLine1ErrorMessage,
      addressLine2ErrorMessage,
      cityErrorMessage,
      stateErrorMessage,
      postalCodeErrorMessage,
      upiIdErrorMessage,
      idToken,
      isLoading,
      showSuccessSnackbar,
      isSaving,
    } = this.state;

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
      <div className="account-profile-container">
        <div className="top-section">
          <img src={logo} alt="Logo" />
        </div>
        <div className="profile-card">
          <div className="top-row">
            <h3>Account Profile</h3>
            <div className="profile-pic-holder">
              <img src={userIcon} alt="Profile" />
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
            <span className="label">Email Address *</span>
            <input
              type="email"
              value={email}
              onChange={(e) => this.setState({ email: e.target.value })}
            />
            {emailErrorMessage ? (
              <span className="error">{emailErrorMessage}</span>
            ) : null}
          </div>

          <div className="billing-group">
            <h3>Billing Address</h3>
            <div className="group">
              <span className="label">Address Line 1 *</span>
              <input
                type="text"
                value={addressLine1}
                onChange={(e) =>
                  this.setState({ addressLine1: e.target.value })
                }
              />
              {addressLine1ErrorMessage ? (
                <span className="error">{addressLine1ErrorMessage}</span>
              ) : null}
            </div>
            <div className="group">
              <span className="label">Address Line 2 *</span>
              <input
                type="text"
                value={addressLine2}
                onChange={(e) =>
                  this.setState({ addressLine2: e.target.value })
                }
              />
              {addressLine2ErrorMessage ? (
                <span className="error">{addressLine2ErrorMessage}</span>
              ) : null}
            </div>
            <div className="d-grid">
              <div className="group">
                <span className="label">City *</span>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => this.setState({ city: e.target.value })}
                />
                {cityErrorMessage ? (
                  <span className="error">{cityErrorMessage}</span>
                ) : null}
              </div>
              <div className="group">
                <span className="label">State *</span>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => this.setState({ state: e.target.value })}
                />
                {stateErrorMessage ? (
                  <span className="error">{stateErrorMessage}</span>
                ) : null}
              </div>
            </div>
            <div className="d-grid">
              <div className="group">
                <span className="label">Postal Code *</span>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) =>
                    this.setState({ postalCode: e.target.value })
                  }
                />
                {postalCodeErrorMessage ? (
                  <span className="error">{postalCodeErrorMessage}</span>
                ) : null}
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
              <span className="label">UPI ID *</span>
              <input
                type="text"
                value={upiId}
                onChange={(e) => this.setState({ upiId: e.target.value })}
              />
              {upiIdErrorMessage ? (
                <span className="error">{upiIdErrorMessage}</span>
              ) : null}
            </div>
          </div>

          <button
            className="btn btn-primary save-button"
            onClick={this.handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "SAVE"}
          </button>

          <Snackbar
            open={showSuccessSnackbar}
            autoHideDuration={5000}
            onClose={() => {
              this.setState({ showSuccessSnackbar: false });
            }}
          >
            <Alert severity="success">Profile data saved successfully.</Alert>
          </Snackbar>
        </div>
      </div>
    );
  }
}

export default AccountProfile;
