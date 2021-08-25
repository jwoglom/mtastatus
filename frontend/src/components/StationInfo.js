import React from "react";

import fetchStationInfo from "../utils/fetchStationInfo.js";
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

    async loadData() {
        const station = this.props.station;

        let info = await fetchStationInfo(station);
        this.setState(info[station]);
    }

    render() {
        if (!this.state.name) {
            return (<div>Loading...</div>);
        }
        return (
            <div class="station-info">
                
                <StationHeader
                    name={this.state.name}
                    direction={this.state.direction}
                    destination={this.state.destination}
                    routes={this.state.routes}
                    displayedRoutes={this.state.displayedRoutes}
                ></StationHeader>
                
                <div class="station-stops">
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
