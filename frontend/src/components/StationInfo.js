import React from "react";
import StationHeader from "./StationHeader.js";
import StationStop from "./StationStop.js";

export default class StationInfo extends React.Component {
    state = {
        name: null,
        direction: null,
        stops: []
    }

    async componentDidMount() {
        this.loadData();
        this.timer = setInterval(this.loadData.bind(this), 20000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    async loadData() {
        const station = this.props.station;

        const endpoint = process.env.REACT_APP_MTASTATUS_ENDPOINT;
        const req = await fetch(endpoint+'/api/stations/'+station);
        const data = await req.json();
        console.log(data);

        const stops = data[station]["stops"];
        const date = (""+new Date()).split(" ")[4];
        this.setState({
            name: data[station]["station"]["name"],
            direction: data[station]["station"]["direction"],
            destination: data[station]["station"]["destination"],
            routes: data[station]["station"]["routes"],
            displayedRoutes: new Set(),
            stops: stops,
            updateTime: date
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
                
                <h3>{this.state.stops.map(stop => 
                    <StationStop stop={stop} key={stop["trip"]["trip_id"]}></StationStop>
                )}</h3>
                
                {this.state.stops.length == 0 && <p>
                    There are no trains scheduled.
                </p>}

                <h4>Last updated: {this.state.updateTime}</h4>
            </div>
        )
    }
}