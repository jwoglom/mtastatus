import React from "react";
import {fetchStationInfo} from "../utils/fetchStationInfo";
import mergeStationInfo from "../utils/mergeStationInfo";
import StationInfo from "./StationInfo";
import DualStationInfo from "./DualStationInfo";

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
        let individualStations = this.props.stations.split(/;|,|\|/);
        let info = await fetchStationInfo(individualStations);
        console.debug("setting sessionData:", info);
        this.setState({stationData: info});
    }

    renderItemInGroup(s) {
        if (!(s in this.state.stationData) && !s.endsWith('N') && !s.endsWith('S') && !this.props.showMergedStationView) {
            s = s+'N|'+s+'S';
        }

        if (s.indexOf('|') > -1) {
            let [nb, sb] = s.split('|');

            return (
                <DualStationInfo stationData={{
                    nb: this.state.stationData[nb] ? this.state.stationData[nb] : mergeStationInfo(nb, this.state.stationData),
                    sb: this.state.stationData[sb] ? this.state.stationData[sb] : mergeStationInfo(sb, this.state.stationData)
                }} key={s} {...this.props.stationInfoProps} />
            );
        }
        return (
            <StationInfo 
                stationData={this.state.stationData[s] ? 
                    this.state.stationData[s] : 
                    mergeStationInfo(s, this.state.stationData)} 
                key={s} {...this.props.stationInfoProps} />
        )
    }

    render() {
        let stationGroups = this.props.stations.split(";");
        return (
            <div className="groups-container" onClick={this.loadData.bind(this)}>
                {stationGroups.map(group =>
                    <div className="stations-group" key={group}>
                        {group.split(",").map(s => this.renderItemInGroup(s))}
                    </div>
                )}
                </div>
        )
    }
}

StationsGroup.defaultProps = {
    showMergedStationView: false,
    stationInfoProps: {}
}