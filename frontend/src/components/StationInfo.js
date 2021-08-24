import React from "react";
import StationHeader from "./StationHeader.js";

export default class StationInfo extends React.Component {
    state = {
        name: null,
        direction: null,
        stops: []
    }

    async componentDidMount() {
        const station = this.props.station;
        const line = this.props.line;

        const endpoint = process.env.REACT_APP_MTASTATUS_ENDPOINT;
        const req = await fetch(endpoint+'/api/lines/'+line+'/stations/'+station);
        const data = await req.json();
        
        const stops = data[station]["stops"];
        
        this.setState({
            name: data[station]["station"]["name"],
            direction: data[station]["station"]["direction"],
            destination: data[station]["station"]["destination"],
            routes: data[station]["station"]["routes"],
            displayedRoutes: new Set(),
            stops: stops,
        });

        this.updateDisplayedRoutes();
    }

    updateDisplayedRoutes() {
        let displayedRoutes = new Set();
        this.state.stops.forEach((stop, i) => {
            displayedRoutes.add(stop["trip"]["route_id"]);
        });
        this.setState({
            displayedRoutes: displayedRoutes
        })
    }


    render() {
        return (
            <div>
                <StationHeader
                    name={this.state.name}
                    direction={this.state.direction}
                    destination={this.state.destination}
                    routes={this.state.routes}
                    displayedRoutes={this.state.displayedRoutes}
                ></StationHeader>
                <h3>line: {this.props.line} station: {this.props.station}</h3>
                <h3>{this.state.stops.map(stop => <div key={stop["time"]}>
                    {stop["time"]} ({stop["trip"]["route_id"]})
                </div>)}</h3>
            </div>
        )
    }
}