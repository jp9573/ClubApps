import React, { Component } from "react";
import {
  withGoogleMap,
  Marker,
  GoogleMap,
  DirectionsRenderer,
} from "react-google-maps";
import movingCarIcon from "../../../asset/tracing/movingCar.svg";

class Map extends Component {
  state = {
    directions: null,
  };

  componentDidMount() {
    const directionsService = new window.google.maps.DirectionsService();

    const origin = this.props.source;
    const destination = this.props.destination;

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },

      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          this.setState({
            directions: result,
          });
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }

  render() {
    const GoogleMapExample = withGoogleMap((props) => (
      <GoogleMap defaultCenter={props.currentGeoLocation} defaultZoom={13}>
        <DirectionsRenderer directions={props.directions} />
        <Marker position={props.currentGeoLocation} icon={movingCarIcon} />
      </GoogleMap>
    ));

    return (
      <div>
        <GoogleMapExample
          loadingElement=<div style={{ height: `100%` }} />
          containerElement=<div style={{ height: `100%` }} />
          mapElement=<div style={{ height: `100%` }} />
          currentGeoLocation={this.props.currentGeoLocation}
          directions={this.state.directions}
        />
      </div>
    );
  }
}

export default Map;
