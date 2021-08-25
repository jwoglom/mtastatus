import React from "react";

import {fetchStationInfo, makeDisplayedRoutes} from "../utils/fetchStationInfo.js";
import StationHeader from "./StationHeader.js";
import StationStop from "./StationStop.js";

export default class StationInfo extends React.Component {
    state = {
        stops: []
    }

    async componentDidMount() {
        if (this.props.station) {
            this.loadData();
            this.timer = setInterval(this.loadData.bind(this), 20000);
        } else if (this.props.stationData) {
            this.setState(this.props.stationData);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.name && this.props.stationData) {
            this.setState(this.props.stationData);
        }

    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    mergeStation(station, info) {
        let north = info[station+"N"];
        let south = info[station+"S"];
        let stops = [];
        north.stops.map(stop => {
            stop["title"] = north.destination;
            stops.push(stop);
        });
        south.stops.map(stop => {
            stop["title"] = south.destination;
            stops.push(stop);
        });
        stops.sort((a, b) => new Date(a["time"]) - new Date(b["time"]));
        return {
            name: north.name,
            direction: "",
            destination: north.destination+" / "+south.destination,
            routes: north.routes,
            displayedRoutes: north.displayedRoutes,
            stops: stops
        };
    }

    async loadData() {
        const station = this.props.station;

        let info = await fetchStationInfo([station]);
        if (info[station]) {
            this.setState(info[station]);
        } else {
            this.setState(this.mergeStation(station, info));
        }
    }

    render() {
        if (!this.state.name) {
            return (<div>Loading...</div>);
        }
        return (
            <div className="station-info">
                
                <StationHeader
                    name={this.state.name}
                    direction={this.state.direction}
                    destination={this.state.destination}
                    routes={this.state.routes}
                    displayedRoutes={this.state.displayedRoutes}
                ></StationHeader>
                
                <div className="station-stops">
                    {this.state.stops.map(stop => 
                        <StationStop stop={stop} key={stop["trip"]["trip_id"]}></StationStop>
                    )}
                </div>
                
                {this.state.stops.length == 0 && <p>
                    There are no trains scheduled.
                </p>}

                {this.props.showLastUpdated &&
                    <p>Last updated: {this.state.updateTime}</p>}
            </div>
        )
    }
};

StationInfo.defaultProps = {
    showLastUpdated: true
}
