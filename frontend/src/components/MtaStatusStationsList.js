import React from "react";
import {withRouter} from "react-router-dom";
import { fetchStationsList } from "../utils/fetchStationsList";
import StationsList from "./StationsList";

class MtaStatusStationsList extends React.Component {
    async loadData() {
        let info = await fetchStationsList();
        this.setState({stations: info})
    }


    async componentDidMount() {
        this.loadData();
    }

    render() {
        return (
            <StationsList {...this.state} />
        )
    }
}

export default withRouter(MtaStatusStationsList);