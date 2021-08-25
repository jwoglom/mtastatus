import React from "react";
import {fetchStationInfo} from "../utils/fetchStationInfo.js";
import StationInfo from "./StationInfo.js";

export default class StationsGroup extends React.Component {
    state = {
        stationData: {},
    }

    async componentDidMount() {
        this.loadData();
        this.timer = setInterval(this.loadData.bind(this), 20000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    async loadData() {
        let stations = this.props.stations.split(",");
        let info = await fetchStationInfo(stations);
        this.setState({stationData: info});
    }

    render() {
        let stations = this.props.stations.split(",");
        return (
            <div className="stations-group">
                {stations.map(s => 
                    <StationInfo stationData={this.state.stationData[s]} key={s}></StationInfo>
                )}
            </div>
        )
    }
}