import React from "react";
import {withRouter} from "react-router-dom";
import buildSearchParamsProps from "../utils/searchParamsProps";
import StationInfo from "./StationInfo";

class MtaStatusStation extends React.Component {
    buildProps() {
        const station = this.props.match.params.station;
        let q = new URLSearchParams(this.props.location.search);

        return {
            station: station,
            ...buildSearchParamsProps(q)['stationInfoProps']
        }
    }
    render() {
        return (
            <StationInfo {...this.buildProps()} />
        )
    }
}

export default withRouter(MtaStatusStation);