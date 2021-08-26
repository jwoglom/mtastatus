import React from "react";
import TimeAgo from 'react-timeago';

export default class StationStop extends React.Component {
    imgBase = "https://new.mta.info/themes/custom/bootstrap_mta/images/icons/"
    async componentDidMount() {
    }

    formatter(value, unit, suffix, epochMilliseconds) {
        function inner() {
            if (unit == 'second') {
                return '<1 minute';
            }

            suffix = '';
            if (unit == 'hour') {
                let totalMins = parseInt((epochMilliseconds - +new Date())/60000);
                let hrs = parseInt(totalMins / 60);
                let addlMins = totalMins - hrs*60;
                let ret = '';
                if (hrs == 1) {
                    ret = hrs+' '+unit+' '+addlMins+' min';
                } else {
                    ret = hrs+' '+unit+'s '+addlMins+' min';
                }
                if (addlMins != 1) {
                    ret += 's';
                }
                return ret;
            }

            if (value == 1) {
                return value+' '+unit+suffix;
            }
            return value+' '+unit+'s';
        }

        return (
            <span title={""+new Date(epochMilliseconds)}>
                {inner()}
            </span>
        );

    }

    render() {
        const stop = this.props.stop;

        return (
            <div className="station-stop">
                <img 
                    src={this.imgBase+stop["trip"]["route_id"]+".svg"} 
                    width="20" 
                    alt={stop["trip"]["route_id"]} 
                    valign="middle" 
                    className="bullet" />
                <span className="time">
                    <TimeAgo date={stop["time"]} formatter={this.formatter}></TimeAgo>
                </span>
                {stop["title"] && <span className="title">
                    {stop["title"]}
                </span>}
            </div>
        )
    }
}