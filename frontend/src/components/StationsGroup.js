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
        let individualStations = this.props.stations.replace(/ /g,'+').split(/;|,|\+|\|/);
        let info = await fetchStationInfo(individualStations);
        console.debug("setting sessionData:", info);
        this.setState({stationData: info});
    }

    renderItemInGroup(s) {
        let parsedS = s;

        // `235` becomes `235N|235S`
        if (!(s in this.state.stationData) && 
            !s.endsWith('N') && 
            !s.endsWith('S') && 
            s.indexOf('|') === -1 && 
            s.indexOf('+') === -1 && 
            !this.props.showMergedStationView)
        {
            parsedS = s+'N|'+s+'S';
        }

        // `235+D24` becomes `235N+D24N|235S+D24S`
        if (!(s in this.state.stationData) &&
            s.indexOf('+') !== -1 &&
            s.indexOf('|') === -1)
        {
            let left = [];
            let right = [];
            let fix = false;
            s.split('+').forEach(p => {
                if (!p.endsWith('N') || !p.endsWith('S')) {
                    fix = true;
                    left.push(p+'N');
                    right.push(p+'S')
                } else {
                    left.push(p);
                    right.push(p);
                }
            });
            if (fix) {
                parsedS = left.join('+')+'|'+right.join('+');
            }
        }

        function processStationString(singleOrPlus) {
            return this.state.stationData[singleOrPlus] ? this.state.stationData[singleOrPlus] : mergeStationInfo(singleOrPlus, this.state.stationData)
        }

        if (parsedS.indexOf('|') > -1) {
            let [nb, sb] = parsedS.split('|');

            return (
                <DualStationInfo
                    stationData={{
                        nb: processStationString.apply(this, [nb]),
                        sb: processStationString.apply(this, [sb])
                    }}
                    key={parsedS}
                    showLastUpdated={false}
                    {...this.props.stationInfoProps}
                    {...this.props.stationInfoPropsPerStation[s] ? this.props.stationInfoPropsPerStation[s] : {}} />
            );
        }
        return (
            <StationInfo 
                stationData={processStationString.apply(this, [s])} 
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
        let stationGroups = this.props.stations.replace(/ /g, '+').split(";");
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