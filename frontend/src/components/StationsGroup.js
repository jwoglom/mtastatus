import React from "react";
import StationInfo from "./StationInfo.js";

export default class StationsGroup extends React.Component {
    render() {
        console.log(this.props);
        return (
            <div>
                {this.props.stations.split(",").map(s => 
                    <StationInfo station={s}></StationInfo>
                )}
            </div>
        )
    }
}