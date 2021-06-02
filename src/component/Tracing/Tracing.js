import React, { Component } from "react";
import "./Tracing.scss";
import qs from "query-string";
import pageExpiredImage from "../../asset/image/pageExpired.svg";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  getTracingInfoApi,
  getTracingUpdateApi,
  getTracingPlaceApi,
  getTracingBusinessDetailApi,
  getVendorDetailApi,
} from "../../common/Api";
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
import flightIcon from "../../asset/tracing/flight.svg";
import dinnerIcon from "../../asset/tracing/dinner.svg";
import bedIcon from "../../asset/tracing/bed.svg";
import stethoscopeIcon from "../../asset/tracing/stethoscope.svg";
import GoogleMapReact from "google-map-react";

class Tracing extends Component {
  state = {
    idToken: "fetching",
    trackerType: "",
    tracingData: {},
    tracingUpdateData: undefined,
    sourceData: undefined,
    destinationData: undefined,
    businessData: undefined,
    vendorData: undefined,
    isLoading: true,
    isTracingUpdateDataLoading: true,
    isSourceDataLoading: true,
    isDestinationDataLoading: true,
    isBusinessDataLoading: true,
    isVendorDataLoading: true,
    selectedDestination: undefined,
    destinationSearchBarValue: "",
  };
  typeMapping = {
    cab: "CAB_TRACKER",
    towing: "TOW_TRUCK_TRACKER",
    ambulance: "AMBULANCE_TRACKER",
    delivery: "FOOD_DELIVERY_TRACKER",
  };
  secondaryLogoMapping = {
    CAB_TRACKER: uberIcon,
    FOOD_DELIVERY_TRACKER: swiggyIcon,
    AMBULANCE_TRACKER: fortisIcon,
    TOW_TRUCK_TRACKER: suzukiIcon,
  };
  detailIconMapping = {
    CAB_TRACKER: carIcon,
    FOOD_DELIVERY_TRACKER: deliveryIcon,
    AMBULANCE_TRACKER: ambulanceIcon,
    TOW_TRUCK_TRACKER: twoTruckIcon,
  };
  customDestinationIconMapping = {
    AIRPORT: flightIcon,
    RESTAURANT: dinnerIcon,
    HOTEL: bedIcon,
    HOSPITAL: stethoscopeIcon,
  };

  componentDidMount() {
    const queryObj = qs.parse(this.props.location.search);
    this.setState(
      {
        idToken: queryObj.idtoken,
        trackerType: this.typeMapping[this.props.match.params.trackerType],
      },
      this.fetchTracingInfo
    );
  }

  fetchTracingInfo = () => {
    const { idToken, trackerType } = this.state;

    getTracingInfoApi(idToken, trackerType)
      .then((res) => {
        this.setState(
          {
            tracingData: res.data,
            isLoading: false,
          },
          () => {
            this.getTrackingUpdateData();
            this.getSourceData();
            this.getDestinationData();
            this.getBusinessData();
            this.getVendorData();
          }
        );
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  getTrackingUpdateData = () => {
    const { idToken, tracingData } = this.state;

    getTracingUpdateApi(idToken, tracingData.id)
      .then((res) => {
        this.setState({
          tracingUpdateData: res.data,
          isTracingUpdateDataLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ isTracingUpdateDataLoading: false });
      });
  };

  getSourceData = () => {
    const { idToken, tracingData } = this.state;

    getTracingPlaceApi(idToken, tracingData.sourceId)
      .then((res) => {
        this.setState({
          sourceData: res.data,
          isSourceDataLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ isSourceDataLoading: false });
      });
  };

  getDestinationData = () => {
    const { idToken, tracingData } = this.state;

    getTracingPlaceApi(idToken, tracingData.destinationId)
      .then((res) => {
        this.setState({
          destinationData: res.data,
          isDestinationDataLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ isDestinationDataLoading: false });
      });
  };

  getBusinessData = () => {
    const { idToken, tracingData } = this.state;

    getTracingBusinessDetailApi(idToken, tracingData.businessId)
      .then((res) => {
        this.setState({
          businessData: res.data,
          isBusinessDataLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ isBusinessDataLoading: false });
      });
  };

  getVendorData = () => {
    const { idToken, tracingData } = this.state;

    getVendorDetailApi(idToken, tracingData.vendorId)
      .then((res) => {
        this.setState({
          vendorData: res.data,
          isVendorDataLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ isVendorDataLoading: false });
      });
  };

  getServiceDetailJSX = () => {
    const {
      trackerType,
      tracingData,
      vendorData,
      sourceData,
      destinationData,
    } = this.state;
    const { verificationCode } = tracingData;
    const { givenName, vehicleNumber } = vendorData || {};

    return (
      <>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <img src={this.detailIconMapping[trackerType]} alt="Detail" />
            <span className="vehicle-no">
              {vehicleNumber ? vehicleNumber : "Fetching..."}
            </span>
          </div>
          <div className="otp">
            OTP <b>{verificationCode ? verificationCode : "Fetching..."}</b>
          </div>
        </div>
        <div className="service-details">
          <div className="location-content">
            <div className="first-row">
              <RadioButtonUncheckedIcon />{" "}
              <span>{sourceData ? sourceData.name : "Fetching..."}</span>
            </div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="last-row">
              <RoomIcon />{" "}
              <span>
                {destinationData
                  ? destinationData.name
                    ? destinationData.name
                    : "Current Location"
                  : "Fetching..."}
              </span>
            </div>
          </div>
          <div className="agent-content">
            <img src={userIcon} alt="User" />
            <span className="name">
              {givenName ? givenName : "Fetching..."}
            </span>
          </div>
        </div>
      </>
    );
  };

  getStatusJSX = () => {
    const { tracingData } = this.state;
    const { arrivalStatus } = tracingData;

    if (!arrivalStatus) return null;

    return (
      <>
        <span className="label">ARRIVING IN</span>
        <span className="arrival-time">{"1"} min</span>
        <span className="status-label">{arrivalStatus}</span>
      </>
    );
  };

  getCustomDestinationsJSX = () => {
    const { tracingData, selectedDestination } = this.state;
    const { customDestinations } = tracingData;

    if (!customDestinations) return null;

    const onDestinationClick = (destinationObj) => {
      this.setState({
        selectedDestination:
          selectedDestination !== destinationObj ? destinationObj : undefined,
        destinationSearchBarValue:
          selectedDestination !== destinationObj ? destinationObj.name : "",
      });
    };

    return customDestinations.map((destination, index) => {
      const { name, type } = destination;
      const cls =
        selectedDestination && selectedDestination.type === type
          ? "active"
          : "";

      return (
        <div
          className={`icon ${cls}`}
          onClick={() => onDestinationClick(destination)}
          key={index}
        >
          <img src={this.customDestinationIconMapping[type]} alt={name} />
        </div>
      );
    });
  };

  getCustomAddressBarJSX = () => {
    const { selectedDestination, destinationSearchBarValue } = this.state;

    if (!selectedDestination) return null;

    const onUpdateDestination = () => {};

    return (
      <div className="custom-address-bar">
        <RoomIcon />
        <input
          type="text"
          className="search-box form-control"
          placeholder="Search place..."
          value={destinationSearchBarValue}
          onChange={(e) =>
            this.setState({ destinationSearchBarValue: e.target.value })
          }
        />
        <button
          className="btn btn-success go-button"
          onClick={onUpdateDestination}
        >
          GO
        </button>
      </div>
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

        <div className="map-holder">
          {/* <GoogleMapReact
            bootstrapURLKeys={{
              key: process.env.REACT_APP_MAPS_API_KEY,
              language: "en",
            }}
            defaultCenter={this.props.center}
            defaultZoom={this.props.zoom}
          ></GoogleMapReact> */}
        </div>

        <div className="footer-section">
          {this.getCustomAddressBarJSX()}

          <div className="bottom-row">
            <div className="custom-destination-holder">
              {this.getCustomDestinationsJSX()}
            </div>
            <div className="status-holder">{this.getStatusJSX()}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default Tracing;
