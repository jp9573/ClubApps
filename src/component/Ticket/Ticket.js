import React, { Component } from "react";
import "./Ticket.scss";
import { getTicketInfoApi } from "../../common/Api";
import CircularProgress from "@material-ui/core/CircularProgress";
import qs from "query-string";
import logo from "../../asset/ticket/logo.svg";

class Ticket extends Component {
  state = {
    idToken: "fetching",
    eventId: "",
    ticketDetails: undefined,
    isLoading: true,
    currentTicketIndex: 0,
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
    const ticketObj = ticketDetails[currentTicketIndex];
    const { ticketNumber } = ticketObj;

    return (
      <>
        <span className="ticket-number">{ticketNumber}</span>
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
