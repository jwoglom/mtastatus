import React from "react";
import {withRouter} from "react-router-dom";
import buildSearchParamsProps from "../utils/searchParamsProps";
import StationsGroup from "./StationsGroup.js";

const DEFAULT_STATIONS = "A41;A32N,D20N";

class MtaStatusHome extends React.Component {
    state = {
        props: null
    }

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(this.props.location.search) !== JSON.stringify(prevProps.location.search)) {
            this.setState({props: this.buildProps()});
        }
    }

    buildProps() {
        let q = new URLSearchParams(this.props.location.search);
        let stations = q.get('stations');
        if (!stations) {
            stations = process.env.REACT_APP_MTASTATUS_HOME_STATIONS;
        }
        if (!stations) {
            console.info("Using hardcoded stations: " + DEFAULT_STATIONS);
            stations = DEFAULT_STATIONS;
        } else {
            console.info("Using environment stations: " + stations);
        }

        let ret = {
            stations: stations,
            ...buildSearchParamsProps(q)
        };

        console.info("buildProps", ret);
        return ret;
    }

    render() {
        return (
            <StationsGroup {...(this.state.props || this.buildProps())}></StationsGroup>
        )
    }
}

export default withRouter(MtaStatusHome);