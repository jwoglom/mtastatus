import React from "react";
import TimeAgo from 'react-timeago';
import RouteIcon from './RouteIcon';

export default class StationStop extends React.Component {
    imgBase = "/route_icons/";
    async componentDidMount() {
    }

    formatter(value, unit, suffix, epochMilliseconds) {
        function inner() {
            if (unit === 'second') {
                return '<1 minute';
            }

            suffix = '';
            if (unit === 'hour') {
                let totalMins = parseInt((epochMilliseconds - +new Date())/60000);
                let hrs = parseInt(totalMins / 60);
                let addlMins = totalMins - hrs*60;
                let ret = '';
                if (hrs === 1) {
                    ret = hrs+' '+unit+' '+addlMins+' min';
                } else {
                    ret = hrs+' '+unit+'s '+addlMins+' min';
                }
                if (addlMins !== 1) {
                    ret += 's';
                }
                return ret;
            }

            if (value === 1) {
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

    directionLabel(direction) {
        if (direction === 'N') {
            return '↑';
        } else if (direction === 'S') {
            return '↓';
        }
        return '';
    }

    render() {
        const hidden = this.props.hidden;
        const stop = this.props.stop;
        const direction = this.props.direction;

        if (hidden) {
            return (<div className="station-stop hidden"></div>);
        }

        return (
            <div className="station-stop">
                {direction && this.directionLabel(direction)}
                <RouteIcon route_id={stop["trip"]["route_id"]} />
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