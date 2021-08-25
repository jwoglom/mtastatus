import React from "react";
import {withRouter} from "react-router-dom";
import StationsGroup from "./StationsGroup.js";

const HOME_STATIONS = process.env.REACT_APP_MTASTATUS_HOME_STATIONS;

class MtaStatusHome extends React.Component {
    render() {
        let q = new URLSearchParams(this.props.location.search);
        let stations = q.get('stations');
        if (!stations) {
            stations = HOME_STATIONS;
        }
        console.log("home stations: "+stations);
        return (
            <StationsGroup stations={stations}></StationsGroup>
        )
    }
}

export default withRouter(MtaStatusHome);