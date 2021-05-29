import React, { Component } from "react";
import "./Ticket.scss";
import { getTicketInfoApi } from "../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import qs from "query-string";
import QRCode from "qrcode.react";
import logo from "../../asset/ticket/logo.svg";
import leftArrowIcon from "../../asset/ticket/leftArrow.svg";
import rightArrowIcon from "../../asset/ticket/rightArrow.svg";
import flight from "../../asset/ticket/flight.svg";
import bus from "../../asset/ticket/bus.svg";
import train from "../../asset/ticket/train.svg";

class Ticket extends Component {
  state = {
    idToken: "fetching",
    eventId: "",
    ticketDetails: undefined,
    isLoading: true,
    currentTicketIndex: 0,
  };

  ticketTypeHeaderMapping = {
    "Event/Show": {
      ticketTextLabel: "Ticket/seat",
      descriptionTextLabel: "Event /Show",
      dateTextLabel: "Date",
    },
    Flight: {
      ticketTextLabel: "Seat",
      descriptionTextLabel: "Provider",
      dateTextLabel: "Departure Time",
    },
  };

  vehicleIconMapping = {
    Flight: flight,
    Train: train,
    Bus: bus,
  };

  componentDidMount() {
    const queryObj = qs.parse(this.props.location.search);
    this.setState(
      {
        idToken: queryObj.idtoken,
        eventId: this.props.match.params.eventId,
      },
      this.fetchTicketDetails
    );
  }

  fetchTicketDetails = () => {
    const { idToken, eventId } = this.state;
    console.log(idToken, eventId);
    getTicketInfoApi(idToken, eventId)
      .then((res) => {
        this.setState({
          ticketDetails: res.data,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error(err.message);
        this.setState({ idToken: undefined, isLoading: false });
      });
  };

  getTicketCardJSX = () => {
    const { ticketDetails, currentTicketIndex } = this.state;
    const hasMultipleTicket = ticketDetails.length > 1;
    const totalTicketCount = ticketDetails.length;
    const ticketObj = ticketDetails[currentTicketIndex];
    const {
      ticketNumber,
      qrCodeText,
      name,
      ticketType,
      ticketInfo,
      ticketProviderInfo,
      eventDateInfo,
      location,
      additionalFields,
    } = ticketObj;

    const disableRightArrow = currentTicketIndex === ticketDetails.length - 1;
    const disableLeftArrow = currentTicketIndex === 0;

    const { ticketTextLabel, descriptionTextLabel, dateTextLabel } =
      this.ticketTypeHeaderMapping[
        ticketType === "Event/Show" ? "Event/Show" : "Flight"
      ];

    const onPrevTicket = () => {
      let { currentTicketIndex } = this.state;
      if (currentTicketIndex > 0) {
        currentTicketIndex -= 1;
        this.setState({ currentTicketIndex });
      }
    };

    const onNextTicket = () => {
      let { currentTicketIndex, ticketDetails } = this.state;
      if (currentTicketIndex < ticketDetails.length - 1) {
        currentTicketIndex += 1;
        this.setState({ currentTicketIndex });
      }
    };

    const getTicketInfoJSX = () => {
      return (
        <>
          <div className="group">
            <span className="label">{ticketTextLabel}</span>
            <span className="ticket-info">{ticketInfo}</span>
          </div>
          <div className="group">
            <span className="label">{descriptionTextLabel}</span>
            <span className="description">{ticketProviderInfo}</span>
          </div>
        </>
      );
    };

    return (
      <>
        <div className="upper-section">
          <div
            className={`navigation-content ${
              hasMultipleTicket
                ? "justify-content-between"
                : "justify-content-center"
            }`}
          >
            {hasMultipleTicket ? (
              <img
                className={`${disableLeftArrow ? "disable-arrow" : ""}`}
                src={leftArrowIcon}
                alt="Left Arrow"
                onClick={onPrevTicket}
              />
            ) : null}
            <div className="qr-code">
              <QRCode value={qrCodeText} size={150} />
            </div>
            {hasMultipleTicket ? (
              <img
                className={`${disableRightArrow ? "disable-arrow" : ""}`}
                src={rightArrowIcon}
                alt="Right Arrow"
                onClick={onNextTicket}
              />
            ) : null}
          </div>
          <span className="ticket-number">{ticketNumber}</span>
        </div>
        <span className="ticket-count">
          <div className="dash-border"></div>
          <span className="text">
            Ticket {currentTicketIndex + 1} of {totalTicketCount}
          </span>
        </span>
        <div className="ticket-details">
          <div className="group">
            <span className="label">Name</span>
            <span className="name">{name}</span>
          </div>
          {additionalFields ? (
            <div className="additional-fields">
              <div className="left-part">{getTicketInfoJSX()}</div>
              <div className="right-part">
                <span className="source">{additionalFields.Source}</span>
                <img src={this.vehicleIconMapping[ticketType]} alt="Vehicle" />
                <span className="destination">
                  {additionalFields.Destination}
                </span>
                <div className="dash-border"></div>
              </div>
            </div>
          ) : (
            getTicketInfoJSX()
          )}
          <div className="d-grid location-container">
            <div className="group">
              <span className="label">{dateTextLabel}</span>
              <span className="date">{eventDateInfo}</span>
            </div>
            <div className="group">
              <span className="label">Location</span>
              <span className="location">
                {location.name} <br />
                {location.address}
              </span>
              <a
                href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                className="view-map"
                target="_blank"
              >
                View Map
              </a>
            </div>
          </div>
        </div>
      </>
    );
  };

  render() {
    const { idToken, eventId, isLoading } = this.state;

    if (!idToken || idToken.length === 0 || !eventId || eventId.length === 0) {
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
      <div className="ticket-container">
        <div className="top-section">
          <img src={logo} alt="Logo" />
        </div>
        <div className="ticket-card">{this.getTicketCardJSX()}</div>
      </div>
    );
  }
}

export default Ticket;
