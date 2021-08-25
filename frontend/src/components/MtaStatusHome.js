import React from "react";
import {withRouter} from "react-router-dom";
import StationsGroup from "./StationsGroup.js";

const DEFAULT_STATIONS = "A41N,A32,D20";

class MtaStatusHome extends React.Component {
    render() {
        let q = new URLSearchParams(this.props.location.search);
        let stations = q.get('stations');
        if (!stations) {
            stations = process.env.REACT_APP_MTASTATUS_HOME_STATIONS;
        }
        if (!stations) {
            stations = DEFAULT_STATIONS;
        }
        console.log("home stations: "+stations);
        return (
            <StationsGroup stations={stations}></StationsGroup>
        )
    }
}

export default withRouter(MtaStatusHome);