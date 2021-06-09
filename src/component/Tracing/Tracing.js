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
  updateDestinationApi,
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
import hospitalIcon from "../../asset/tracing/hospital.svg";
import homeIcon from "../../asset/tracing/home.svg";
import workIcon from "../../asset/tracing/suitcase.svg";
import trainIcon from "../../asset/tracing/train.svg";
import metroIcon from "../../asset/tracing/metro.svg";
import busIcon from "../../asset/tracing/bus.svg";
import redPinIcon from "../../asset/tracing/red-pin.png";
import blackPinIcon from "../../asset/tracing/black-pin.png";
import movingCarIcon from "../../asset/tracing/movingCar.svg";
import MdAdd from "@material-ui/icons/Add";
import MdClose from "@material-ui/icons/Clear";
import {
  FloatingMenu,
  MainButton,
  Directions,
  ChildButton,
} from "react-floating-button-menu";
import Snackbar from "@material-ui/core/Snackbar";
import { Alert } from "../AccountProfile/AccountProfile";
import GoogleMap from "google-map-react";

class Tracing extends Component {
  state = {
    idToken: "fetching",
    trackerType: "",
    tracingData: {},
    currentGeoLocation: undefined,
    sourceData: undefined,
    destinationData: undefined,
    businessData: undefined,
    vendorData: undefined,
    isLoading: true,
    isSourceDataLoading: true,
    isDestinationDataLoading: true,
    isBusinessDataLoading: true,
    isVendorDataLoading: true,
    selectedDestination: undefined,
    destinationSearchBarValue: "",
    customDestinationResultData: undefined,
    allCustomDestinationResultData: {},
    isCustomDestinationResultDataLoading: true,
    isFloatingMenuOpen: false,
    showRoutingToast: false,
    routeTowards: null,
    customDestinationInputReadOnly: true,
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
    HOTELROOM: bedIcon,
    HOSPITAL: hospitalIcon,
    HOME: homeIcon,
    WORK: workIcon,
    TRAIN_STATION: trainIcon,
    METRO_STATION: metroIcon,
    BUS_STATION: busIcon,
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
            currentGeoLocation: {
              lat: res.data.currentGeoLocation.latitude,
              lng: res.data.currentGeoLocation.longitude,
            },
            routeTowards: res.data.routeTowards,
            isLoading: false,
          },
          () => {
            this.getDestinationData();
            this.getSourceData();
            this.getBusinessData();
            this.getVendorData();
            this.getCustomDestinationData();
            setInterval(this.getTrackingUpdateData, 60 * 1000);
          }
        );
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  getTrackingUpdateData = () => {
    const { idToken, tracingData, currentGeoLocation } = this.state;

    getTracingUpdateApi(idToken, tracingData.id)
      .then((res) => {
        let newCurrentGeoLocation = {
          lat: res.data.currentGeoLocation.latitude,
          lng: res.data.currentGeoLocation.longitude,
        };
        if (
          newCurrentGeoLocation.lat !== currentGeoLocation.lat &&
          newCurrentGeoLocation.lng !== currentGeoLocation.lng
        ) {
          this.setState(
            {
              currentGeoLocation: newCurrentGeoLocation,
              routeTowards: res.data.routeTowards,
            },
            this.loadETAData
          );
        }
      })
      .catch((err) => {
        console.error(err.message);
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
        this.setState(
          {
            destinationData: res.data,
            isDestinationDataLoading: false,
          },
          this.loadETAData
        );
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

  getCustomDestinationData = () => {
    const { idToken, tracingData } = this.state;
    const { customDestinations } = tracingData;

    if (!customDestinations) {
      this.setState({ isCustomDestinationResultDataLoading: false });
      return null;
    }

    customDestinations.map((destination) => {
      getTracingPlaceApi(idToken, destination.id)
        .then((res) => {
          this.setState({
            allCustomDestinationResultData: {
              ...this.state.allCustomDestinationResultData,
              [destination.id]: res.data,
            },
            isCustomDestinationResultDataLoading: false,
          });
        })
        .catch((err) => {
          console.error(err.message);
          this.setState({ isCustomDestinationResultDataLoading: false });
        });
      return null;
    });
  };

  loadETAData = () => {
    const { currentGeoLocation, destinationData } = this.state;

    if (!currentGeoLocation || !destinationData) return;
    const destination = {
      lat: destinationData.geoLocation.latitude,
      lng: destinationData.geoLocation.longitude,
    };
    try {
      new window.google.maps.DistanceMatrixService().getDistanceMatrix(
        {
          origins: [currentGeoLocation],
          destinations: [destination],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.IMPERIAL,
          avoidHighways: false,
          avoidTolls: false,
        },
        (response, status) => {
          if (status !== "OK") {
            console.error("Error was: " + status);
          } else {
            this.setState({
              tracingData: {
                ...this.state.tracingData,
                arrivalInMinutes: response.rows[0].elements[0].duration.text,
              },
            });
          }
        }
      );
    } catch (error) {
      setTimeout(this.loadETAData, 1000);
    }
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
              {vehicleNumber ? (
                vehicleNumber
              ) : (
                <CircularProgress color="white" size={25} />
              )}
            </span>
          </div>
          <div className="otp">
            OTP{" "}
            <b>
              {verificationCode ? (
                verificationCode
              ) : (
                <CircularProgress color="white" size={25} />
              )}
            </b>
          </div>
        </div>
        <div className="service-details">
          <div className="location-content">
            <div className="first-row">
              <RadioButtonUncheckedIcon className="loc-icon" />{" "}
              <span>
                {sourceData ? (
                  sourceData.name
                ) : (
                  <CircularProgress color="white" size={25} />
                )}
              </span>
            </div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="last-row">
              <RoomIcon className="loc-icon" />{" "}
              <span>
                {destinationData ? (
                  destinationData.name ? (
                    destinationData.name
                  ) : (
                    "Current Location"
                  )
                ) : (
                  <CircularProgress color="white" size={25} />
                )}
              </span>
            </div>
          </div>
          <div className="agent-content">
            <img src={userIcon} alt="User" />
            <span className="name">
              {givenName ? (
                givenName
              ) : (
                <CircularProgress color="white" size={25} />
              )}
            </span>
          </div>
        </div>
      </>
    );
  };

  getStatusJSX = () => {
    const { tracingData } = this.state;
    const { arrivalStatus, arrivalInMinutes } = tracingData;

    if (!arrivalStatus) return null;

    return (
      <>
        <span className="label">ARRIVING IN</span>
        <span className="arrival-time">
          {arrivalInMinutes ? (
            arrivalInMinutes
          ) : (
            <CircularProgress color="white" size={25} />
          )}
        </span>
        <span className="status-label">{arrivalStatus}</span>
      </>
    );
  };

  getCustomDestinationsJSX = () => {
    const {
      tracingData,
      selectedDestination,
      isFloatingMenuOpen,
      isCustomDestinationResultDataLoading,
    } = this.state;
    const { customDestinations } = tracingData;

    if (!customDestinations || isCustomDestinationResultDataLoading)
      return null;

    const onDestinationClick = (destinationObj) => {
      const { allCustomDestinationResultData } = this.state;
      this.setState({
        selectedDestination:
          selectedDestination !== destinationObj ? destinationObj : undefined,
        destinationSearchBarValue:
          selectedDestination !== destinationObj
            ? allCustomDestinationResultData[destinationObj.id].name
            : "",
        isFloatingMenuOpen: false,
        customDestinationResultData:
          allCustomDestinationResultData[destinationObj.id],
      });
    };

    const jsx = customDestinations.map((destination, index) => {
      const { name, type } = destination;
      const cls =
        selectedDestination && selectedDestination.type === type
          ? "active"
          : "";

      return (
        <ChildButton
          icon={
            <div className={`icon ${cls}`}>
              <img src={this.customDestinationIconMapping[type]} alt={name} />
            </div>
          }
          onClick={() => onDestinationClick(destination)}
          key={index}
        />
      );
    });

    return (
      <>
        <FloatingMenu
          slideSpeed={500}
          direction={Directions.Up}
          spacing={25}
          isOpen={isFloatingMenuOpen}
        >
          <MainButton
            iconResting={<MdAdd style={{ fill: "white" }} />}
            iconActive={<MdClose style={{ fill: "white" }} />}
            background="black"
            onClick={() =>
              this.setState({
                isFloatingMenuOpen: !isFloatingMenuOpen,
                selectedDestination: undefined,
                destinationSearchBarValue: "",
              })
            }
            size={56}
          />
          {jsx}
        </FloatingMenu>
      </>
    );
  };

  getCustomAddressBarJSX = () => {
    const { selectedDestination, destinationSearchBarValue } = this.state;

    if (!selectedDestination) return null;
    let { type } = selectedDestination;
    type = type.split("_").join(" ");

    const onUpdateDestination = () => {
      const { idToken, selectedDestination } = this.state;
      updateDestinationApi(idToken, selectedDestination)
        .then((res) => {
          this.setState({
            destinationData: this.state.customDestinationResultData,
            customDestinationResultData: undefined,
            showRoutingToast: true,
            selectedDestination: undefined,
            destinationSearchBarValue: "",
          });
        })
        .catch((err) => {
          console.error(err.message);
        });
    };

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
          readOnly={this.state.customDestinationInputReadOnly}
          onFocus={(e) =>
            this.setState({ customDestinationInputReadOnly: false })
          }
          onBlur={(e) =>
            this.setState({ customDestinationInputReadOnly: true })
          }
        />
        <span className="label">{type}</span>
        <button
          className="btn btn-success go-button"
          onClick={onUpdateDestination}
          disabled={
            destinationSearchBarValue === "" ||
            destinationSearchBarValue === "Fetching..."
          }
        >
          GO
        </button>
      </div>
    );
  };

  getMapJSX = () => {
    const { currentGeoLocation, sourceData, destinationData } = this.state;

    if (!currentGeoLocation || !sourceData || !destinationData) {
      return (
        <div className="d-flex align-items-center justify-content-center h-100">
          <CircularProgress />
        </div>
      );
    }

    const origin = {
      lat: sourceData.geoLocation.latitude,
      lng: sourceData.geoLocation.longitude,
    };
    const destination = {
      lat: destinationData.geoLocation.latitude,
      lng: destinationData.geoLocation.longitude,
    };

    const renderDirection = (map, maps) => {
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true,
      });
      const directionsService = new window.google.maps.DirectionsService();
      directionsRenderer.setMap(map);
      calculateAndDisplayRoute(directionsService, directionsRenderer, map);
    };

    const calculateAndDisplayRoute = (
      directionsService,
      directionsRenderer,
      map
    ) => {
      const makeMarker = (position, icon, map) => {
        new window.google.maps.Marker({
          position: position,
          map: map,
          icon: icon,
        });
      };

      const icons = {
        start: new window.google.maps.MarkerImage(
          // icon
          blackPinIcon,
          // (width,height)
          new window.google.maps.Size(44, 32),
          // The origin point (x,y)
          new window.google.maps.Point(0, 0),
          // The anchor point (x,y)
          new window.google.maps.Point(13, 22)
        ),
        end: new window.google.maps.MarkerImage(
          // icon
          redPinIcon,
          // (width,height)
          new window.google.maps.Size(44, 32),
          // The origin point (x,y)
          new window.google.maps.Point(0, 0),
          // The anchor point (x,y)
          new window.google.maps.Point(13, 22)
        ),
      };

      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response, status) => {
          if (status === "OK") {
            directionsRenderer.setDirections(response);
            let leg = response.routes[0].legs[0];
            makeMarker(leg.start_location, icons.start, map);
            makeMarker(leg.end_location, icons.end, map);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
    };

    return (
      <GoogleMap
        bootstrapURLKeys={{ key: process.env.REACT_APP_MAPS_API_KEY }}
        yesIWantToUseGoogleMapApiInternals
        defaultCenter={currentGeoLocation}
        center={currentGeoLocation}
        defaultZoom={15}
        onGoogleApiLoaded={({ map, maps }) => renderDirection(map, maps)}
      >
        <img
          src={movingCarIcon}
          alt="Car"
          lat={currentGeoLocation.lat}
          lng={currentGeoLocation.lng}
        />
      </GoogleMap>
    );
  };

  render() {
    const { idToken, trackerType, isLoading, showRoutingToast } = this.state;

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

        <div className="map-holder">{this.getMapJSX()}</div>

        <div className="custom-destination-holder">
          {this.getCustomDestinationsJSX()}
          {this.state.tracingData.customDestinations &&
          !this.state.isCustomDestinationResultDataLoading ? (
            <span className="label-text">
              Change
              <br />
              Destination
            </span>
          ) : null}
        </div>
        <div className="footer-section">
          {this.getCustomAddressBarJSX()}

          <div className="bottom-row">
            <div className="status-holder">{this.getStatusJSX()}</div>
          </div>
        </div>

        <Snackbar
          open={showRoutingToast}
          autoHideDuration={2000}
          onClose={() => {
            this.setState({ showRoutingToast: false });
          }}
        >
          <Alert severity="success">Routing</Alert>
        </Snackbar>
      </div>
    );
  }
}

export default Tracing;
