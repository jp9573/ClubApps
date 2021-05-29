import React, { Component } from "react";
import "./Ticket.scss";
import { getTicketInfoApi } from "../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import qs from "query-string";
import QRCode from "qrcode.react";
import logo from "../../asset/ticket/logo.svg";
import leftArrowIcon from "../../asset/ticket/leftArrow.svg";
import rightArrowIcon from "../../asset/ticket/rightArrow.svg";

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
    } = ticketObj;

    const { ticketTextLabel, descriptionTextLabel, dateTextLabel } =
      this.ticketTypeHeaderMapping[ticketType];

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
          <div className="group">
            <span className="label">{ticketTextLabel}</span>
            <span className="ticket-info">{ticketInfo}</span>
          </div>
          <div className="group">
            <span className="label">{descriptionTextLabel}</span>
            <span className="description">{ticketProviderInfo}</span>
          </div>
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
