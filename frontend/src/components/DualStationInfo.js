import React from "react";

import {fetchStationInfo} from "../utils/fetchStationInfo";
import { filterToShownStops } from "../utils/filterShownStop";
import mergeStationInfo from "../utils/mergeStationInfo";
import StationHeader from "./StationHeader";
import StationStop from "./StationStop";
import AlertsSummary from "./AlertsSummary";

export default class DualStationInfo extends React.Component {
    state = {
        nb: {
            name: null,
            stops: [],
        },
        sb: {
            name: null,
            stops: []
        },
        showAll: false
    }

    async componentDidMount() {
        if (this.props.nbStation) {
            this.loadDataNB();
            this.nbTimer = setInterval(this.loadDataNB.bind(this), 20000);
        }
        if (this.props.sbStation) {
            this.loadDataSB();
            this.sbTimer = setInterval(this.loadDataSB.bind(this), 20000);
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

        try {
            let info = await fetchStationInfo([station], {alerts: this.props.showAlerts});
            if (info[station]) {
                this.setState({...this.state, nb: info[station]});
            } else {
                this.setState({...this.state, nb: mergeStationInfo(station, info)});
            }
        } catch (e) {
            this.setState({error: e});
        }
    }

    async loadDataSB() {
        const station = this.props.sbStation;

        try {
            let info = await fetchStationInfo([station], {alerts: this.props.showAlerts});
            if (info[station]) {
                this.setState({...this.state, sb: info[station]});
            } else {
                this.setState({...this.state, sb: mergeStationInfo(station, info)});
            }
        } catch (e) {
            this.setState({error: e});
        }
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

    mergedStops() {
        let stops = [];
        let nbStops = filterToShownStops(this.props, this.state.nb.stops || [], this.state.showAll);
        let sbStops = filterToShownStops(this.props, this.state.sb.stops || [], this.state.showAll);

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

    onClick() {
        this.setState({...this.state, showAll: !this.state.showAll})
    }

    render() {
        if (this.state.error) {
            return (<div>Error: {this.state.error}</div>)
        }
        if (!this.stationName()) {
            return (<div>Loading...</div>);
        }

        const stops = this.mergedStops();
        return (
            <div className={"station-info " + (this.state.showAll ? "showAll" : "notShowAll")} onClick={this.onClick.bind(this)}>
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
                        {obj.stop && <StationStop 
                            stop={obj.stop} 
                            direction={obj.direction}
                            shortUnits={this.props.shortUnits} 
                            showTime={this.props.showTime} />}
                    </React.Fragment>)}
                </div>
                
                {stops.length === 0 && <p>
                    There are no trains scheduled.
                </p>}
                
                {this.props.showAlerts && <React.Fragment>
                    <p />
                    <AlertsSummary alerts={this.state.nb.alerts} condensed={this.props.condensedAlerts ? !this.state.showAll : false} />
                </React.Fragment>}

                {this.props.showLastUpdated &&
                    <p>Last updated: {this.updateTime()}</p>}
            </div>
        )
    }
};

DualStationInfo.defaultProps = {
    minTimeMinutes: 1,
    maxTimeMinutes: 60,
    maxCount: 10,
    showLastUpdated: true,
    shortUnits: false,
    showTime: false,
    showAlerts: false,
    condensedAlerts: true
}
