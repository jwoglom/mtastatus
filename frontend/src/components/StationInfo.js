import React from "react";

import {fetchStationInfo, makeDisplayedRoutes} from "../utils/fetchStationInfo.js";
import mergeStationInfo from "../utils/mergeStationInfo.js";
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
        if (JSON.stringify(this.props.stationData) != JSON.stringify(prevProps.stationData)) {
            this.setState(this.props.stationData);
            console.debug("updated stationInfo for "+this.state.name+": "+this.state.updateTime);
        }

    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    async loadData() {
        const station = this.props.station;

        let info = await fetchStationInfo([station]);
        if (info[station]) {
            this.setState(info[station]);
        } else {
            this.setState(mergeStationInfo(station, info));
        }
    }

    showStop(stop) {
        let time = new Date(stop["time"]);
        let minDiff = (time - new Date()) / 60000;

        if (!this.props.maxTimeMinutes) {
            return true;
        }

        return (minDiff <= this.props.maxTimeMinutes);
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
                    {this.state.stops.map((stop, i) => this.showStop.apply(this, [stop]) ?
                        <StationStop stop={stop} key={i}></StationStop>
                        : <div></div>
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
    showLastUpdated: true,
    maxTimeMinutes: 60
}
