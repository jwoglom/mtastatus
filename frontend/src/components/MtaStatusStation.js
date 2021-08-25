import React from "react";
import {withRouter} from "react-router-dom";
import StationInfo from "./StationInfo";

class MtaStatusStation extends React.Component {
    render() {
        let station = this.props.match.params.station;
        console.log("station: "+station);
        return (
            <StationInfo station={station}></StationInfo>
        )
    }
}

export default withRouter(MtaStatusStation);