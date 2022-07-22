import React from "react";
import {withRouter} from "react-router-dom";
import buildSearchParamsProps from "../utils/searchParamsProps";
import DualStationInfo from "./DualStationInfo";

class MtaStatusDualStation extends React.Component {
    buildProps() {
        const nbStation = this.props.match.params.nbStation;
        const sbStation = this.props.match.params.sbStation;
        let q = new URLSearchParams(this.props.location.search);

        return {
            nbStation,
            sbStation,
            ...buildSearchParamsProps(q)['stationInfoProps']
        }
    }
    render() {
        const props = this.buildProps();
        console.log(props);
        return (
            <DualStationInfo {...props} />
        )
    }
}

export default withRouter(MtaStatusDualStation);