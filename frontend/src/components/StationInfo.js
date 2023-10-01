import React from "react";

import {fetchStationInfo} from "../utils/fetchStationInfo";
import { filterToShownStops } from "../utils/filterShownStop";
import mergeStationInfo from "../utils/mergeStationInfo";
import StationHeader from "./StationHeader";
import StationStop from "./StationStop";
import AlertsSummary from "./AlertsSummary";

export default class StationInfo extends React.Component {
    state = {
        stops: [],
        showAll: false
    }

    async componentDidMount() {
        if (this.props.station) {
            this.loadData();
            this.timer = setInterval(this.loadData.bind(this), 20000);
        } else if (this.props.stationData) {
            this.setState({...this.state, ...this.props.stationData});
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(this.props.stationData) !== JSON.stringify(prevProps.stationData)) {
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

        let info = await fetchStationInfo([station], {alerts: this.props.showAlerts});
        if (info[station]) {
            this.setState(info[station]);
        } else {
            this.setState(mergeStationInfo(station, info));
        }
    }

    onClick() {
        this.setState({...this.state, showAll: !this.state.showAll})
        console.log('showAll', this.state.showAll);
    }

    render() {
        if (!this.state.name) {
            return (<div>Loading...</div>);
        }
        return (
            <div className={"station-info " + (this.state.showAll ? "showAll" : "notShowAll")} onClick={this.onClick.bind(this)}>
                
                <StationHeader
                    name={this.state.name}
                    direction={this.state.direction}
                    destination={this.state.destination}
                    routes={this.state.routes}
                    displayedRoutes={this.state.displayedRoutes}
                ></StationHeader>
                
                <div className="station-stops">
                    {filterToShownStops(this.props, this.state.stops, this.state.showAll).map((stop, i) => 
                        <StationStop 
                            key={i} 
                            stop={stop} 
                            shortUnits={this.props.shortUnits} 
                            showTime={this.props.showTime} />
                    )}
                </div>
                
                {this.state.stops.length === 0 && <p>
                    There are no trains scheduled.
                </p>}
                
                {this.props.showAlerts && <React.Fragment>
                    <p />
                    <AlertsSummary alerts={this.state.alerts} condensed={this.props.condensedAlerts ? !this.state.showAll : false} hideAlertIds={this.props.hideAlertIds} />
                </React.Fragment>}

                {this.props.showLastUpdated &&
                    <p>Last updated: {this.state.updateTime}</p>}
            </div>
        )
    }
};

StationInfo.defaultProps = {
    minTimeMinutes: 1,
    maxTimeMinutes: 60,
    maxCount: 10,
    showLastUpdated: true,
    shortUnits: false,
    showTime: false,
    showAlerts: false,
    condensedAlerts: true,
    hideAlertIds: []
}
