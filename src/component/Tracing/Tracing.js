import React, { Component } from "react";
import "./Tracing.scss";
import qs from "query-string";
import pageExpiredImage from "../../asset/image/pageExpired.svg";
import CircularProgress from "@material-ui/core/CircularProgress";
import { getTracingInfoApi } from "../../common/Api";
import logo from "../../asset/tracing/logo.svg";
import uberIcon from "../../asset/tracing/uber.svg";
import swiggyIcon from "../../asset/tracing/swiggy.svg";
import fortisIcon from "../../asset/tracing/fortis.svg";
import suzukiIcon from "../../asset/tracing/suzuki.svg";
import carIcon from "../../asset/tracing/car.svg";
import deliveryIcon from "../../asset/tracing/delivery.svg";
import ambulanceIcon from "../../asset/tracing/ambulance.svg";
import twoTruckIcon from "../../asset/tracing/towTruck.svg";
import userIcon from "../../asset/accountProfile/user.svg";
import RoomIcon from "@material-ui/icons/Room";
import RadioButtonUncheckedIcon from "@material-ui/icons/RadioButtonUnchecked";

class Tracing extends Component {
  state = {
    idToken: "fetching",
    trackerType: "",
    tracingInfo: {},
    isLoading: true,
  };
  secondaryLogoMapping = {
    CAB: uberIcon,
    FOOD_DELIVERY: swiggyIcon,
    AMBULANCE: fortisIcon,
    VEHICLE_REPAIR: suzukiIcon,
  };
  detailIconMapping = {
    CAB: carIcon,
    FOOD_DELIVERY: deliveryIcon,
    AMBULANCE: ambulanceIcon,
    VEHICLE_REPAIR: twoTruckIcon,
  };

  componentDidMount() {
    const queryObj = qs.parse(this.props.location.search);
    this.setState(
      {
        idToken: queryObj.idtoken,
        trackerType: this.props.match.params.trackerType,
      },
      this.fetchTracingInfo
    );
  }

  fetchTracingInfo = () => {
    const { idToken, trackerType } = this.state;
    getTracingInfoApi(idToken, trackerType)
      .then((res) => {
        this.setState({
          tracingInfo: res.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  getServiceDetailJSX = () => {
    const { trackerType, tracingInfo } = this.state;
    const { secureOtp, source, destination, serviceProvider } = tracingInfo;
    const { agent, additionalFields } = serviceProvider;

    return (
      <>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={this.detailIconMapping[trackerType]} alt="Detail" />
            {additionalFields ? (
              <span className="vehicle-no">{additionalFields.VehicleInfo}</span>
            ) : null}
          </div>
          <div className="otp">
            OTP <b>{secureOtp}</b>
          </div>
        </div>
        <div className="service-details">
          <div className="location-content">
            <div className="first-row">
              <RadioButtonUncheckedIcon /> <span>{source.name}</span>
            </div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="last-row">
              <RoomIcon />{" "}
              <span>
                {destination
                  ? destination.name
                    ? destination.name
                    : `Location at (${destination.latitude}, ${destination.longitude})`
                  : "Waiting for update"}
              </span>
            </div>
          </div>
          <div className="agent-content">
            <img src={agent.photoUrl ? agent.photoUrl : userIcon} alt="User" />
            <span className="name">{agent.givenName}</span>
          </div>
        </div>
      </>
    );
  };

  render() {
    const { idToken, trackerType, isLoading } = this.state;

    if (
      !idToken ||
      idToken.length === 0 ||
      !trackerType ||
      trackerType.length === 0
    ) {
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
      <div className="tracing-container">
        <div className="top-row">
          <img src={logo} alt="Logo" />
          <img src={this.secondaryLogoMapping[trackerType]} alt="Brand logo" />
        </div>

        <div className="detail-row">{this.getServiceDetailJSX()}</div>
      </div>
    );
  }
}

export default Tracing;
