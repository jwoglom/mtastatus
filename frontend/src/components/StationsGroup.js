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
        let parsedS = s;
        if (!(s in this.state.stationData) && !s.endsWith('N') && !s.endsWith('S') && !this.props.showMergedStationView) {
            parsedS = s+'N|'+s+'S';
        }

        if (parsedS.indexOf('|') > -1) {
            let [nb, sb] = parsedS.split('|');

            return (
                <DualStationInfo
                    stationData={{
                        nb: this.state.stationData[nb] ? this.state.stationData[nb] : mergeStationInfo(nb, this.state.stationData),
                        sb: this.state.stationData[sb] ? this.state.stationData[sb] : mergeStationInfo(sb, this.state.stationData)
                    }}
                    key={parsedS}
                    showLastUpdated={false}
                    {...this.props.stationInfoProps}
                    {...this.props.stationInfoPropsPerStation[s] ? this.props.stationInfoPropsPerStation[s] : {}} />
            );
        }
        return (
            <StationInfo 
                stationData={this.state.stationData[s] ? 
                    this.state.stationData[s] : 
                    mergeStationInfo(s, this.state.stationData)} 
                key={s} 
                showLastUpdated={false}
                {...this.props.stationInfoProps}
                {...this.props.stationInfoPropsPerStation[s] ? this.props.stationInfoPropsPerStation[s] : {}} />
        )
    }

    lastUpdated() {
        let date = '';
        if (!this.state.stationData) {
            return date;
        }
        // eslint-disable-next-line
        Object.entries(this.state.stationData).map((entry) => {
            let data = entry[1];
            if (date === '' || data.updateTime < date) {
                date = data.updateTime;
            }
        });
        return date;
    }

    render() {
        let stationGroups = this.props.stations.split(";");
        let lastUpdated = this.lastUpdated();
        return (
            <>
                <div className="groups-container" onClick={this.loadData.bind(this)}>
                    {stationGroups.map(group =>
                        <div className="stations-group" key={group}>
                            {group.split(",").map(s => this.renderItemInGroup(s))}
                        </div>
                    )}
                </div>

                {lastUpdated && <div className="bottom-lastupdated">
                    Last updated: {lastUpdated}
                </div>}
            </>
        )
    }
}

StationsGroup.defaultProps = {
    showMergedStationView: false,
    stationInfoProps: {},
    stationInfoPropsPerStation: {}
}