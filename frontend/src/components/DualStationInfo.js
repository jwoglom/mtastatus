import React from "react";

import {fetchStationInfo} from "../utils/fetchStationInfo";
import mergeStationInfo from "../utils/mergeStationInfo";
import StationHeader from "./StationHeader";
import StationStop from "./StationStop";

export default class DualStationInfo extends React.Component {
    state = {
        nb: {
            name: null,
            stops: [],
        },
        sb: {
            name: null,
            stops: []
        }
    }

    async componentDidMount() {
        if (this.props.nbStation) {
            this.loadDataNB();
            this.nbTimer = setInterval(this.loadData.bind(this, [this.props.nbStation]), 20000);
        }
        if (this.props.sbStation) {
            this.loadDataSB();
            this.sbTimer = setInterval(this.loadData.bind(this, [this.props.sbStation]), 20000);

        }
        if (this.props.stationData) {
            this.setState(this.props.stationData);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(this.props.stationData) !== JSON.stringify(prevProps.stationData)) {
            console.debug("componentDidUpdate ", this.props.stationData);
            this.setState(this.props.stationData);
            console.debug("updated stationInfo");
        }

    }

    componentWillUnmount() {
        if (this.nbTimer) {
            clearInterval(this.nbTimer);
        }
        if (this.sbTimer) {
            clearInterval(this.sbTimer);
        }
    }

    async loadDataNB() {
        const station = this.props.nbStation;

        let info = await fetchStationInfo([station]);
        if (info[station]) {
            this.setState({nb: info[station]});
        } else {
            this.setState({nb: mergeStationInfo(station, info)});
        }
    }

    async loadDataSB() {
        const station = this.props.sbStation;

        let info = await fetchStationInfo([station]);
        if (info[station]) {
            this.setState({sb: info[station], ...this.state});
        } else {
            this.setState({sb: mergeStationInfo(station, info), ...this.state});
        }
    }

    showStop(stop, i) {
        let time = new Date(stop["time"]);
        let minDiff = (time - new Date()) / 60000;

        if (!this.props.maxTimeMinutes) {
            return true;
        }

        if (minDiff > this.props.maxTimeMinutes) {
            return false;
        }

        if (!this.props.maxCount) {
            return true;
        }

        if (i > this.props.maxCount) {
            return false;
        }

        return true;
    }

    stationName() {
        if (!this.state.nb || !this.state.sb) {
            return null;
        }
        if (this.state.nb.name === this.state.sb.name) {
            return this.state.nb.name;
        }

        return [this.state.nb.name, this.state.sb.name];
    }

    filterToShownStops(stops) {
        return stops.filter((stop, i) => this.showStop.apply(this, [stop, i]));
    }

    mergedStops() {
        let stops = [];
        let nbStops = this.filterToShownStops(this.state.nb.stops || []);
        let sbStops = this.filterToShownStops(this.state.sb.stops || []);

        let min = Math.min(nbStops.length, sbStops.length);
        for (let i=0; i<min; i++) {
            stops.push({stop: nbStops[i], direction: this.state.nb.direction});
            stops.push({stop: sbStops[i], direction: this.state.sb.direction});
        }

        if (nbStops.length > sbStops.length) {
            for (let i=min; i<nbStops.length; i++) {
                stops.push({stop: nbStops[i], direction: this.state.nb.direction});
                stops.push({padding: true});
            }
        } else if (sbStops > nbStops.length) {
            for (let i=min; i<sbStops.length; i++) {
                stops.push({padding: true});
                stops.push({stop: sbStops[i], direction: this.state.sb.direction});
            }
        }

        return stops;
    }

    updateTime() {
        let nbDate = new Date(this.state.nb.updateTime);
        let sbDate = new Date(this.state.sb.updateTime);
        if (nbDate < sbDate) {
            return this.state.nb.updateTime;
        }
        return this.state.sb.updateTime;
    }

    render() {
        console.log("state", this.state);
        if (!this.stationName()) {
            return (<div>Loading...</div>);
        }

        const stops = this.mergedStops();
        console.debug("mergedStops", stops);
        return (
            <div className="station-info">
                <StationHeader
                    name={this.stationName()}
                    dualDirection={true}
                    direction={[this.state.nb.direction, this.state.sb.direction]}
                    destination={[this.state.nb.destination, this.state.sb.destination]}
                    routes={[this.state.nb.routes, this.state.sb.routes]}
                    displayedRoutes={[this.state.nb.displayedRoutes, this.state.sb.displayedRoutes]}
                ></StationHeader>
                
                <div className="station-stops dual-station-stops">
                    {stops.map((obj, i) => <React.Fragment key={i}>
                        {obj.padding && <StationStop hidden={true} />}
                        {obj.stop && <StationStop stop={obj.stop} direction={obj.direction} />}
                    </React.Fragment>)}
                </div>
                
                {stops.length === 0 && <p>
                    There are no trains scheduled.
                </p>}

                {this.props.showLastUpdated &&
                    <p>Last updated: {this.updateTime()}</p>}
            </div>
        )
    }
};

DualStationInfo.defaultProps = {
    showLastUpdated: true,
    maxTimeMinutes: 60,
    maxCount: 10,
}
