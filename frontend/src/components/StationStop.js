import React from "react";
import TimeAgo from 'react-timeago';
import RouteIcon from './RouteIcon';

export default class StationStop extends React.Component {
    imgBase = "/route_icons/";
    async componentDidMount() {
    }

    formatter(value, unit, suffix, epochMilliseconds) {
        function inner(props) {
            if (unit === 'second') {
                if (props.shortUnits) {
                    return '<1 min';
                }

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

            if (unit === 'minute' && props.shortUnits) {
                unit = 'min';
            }

            if (value === 1) {
                return value+' '+unit+suffix;
            }
            return value+' '+unit+'s';
        }

        return (
            <span title={""+new Date(epochMilliseconds)}>
                {inner(this.props)}
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

    hrMin(time) {
        const t = new Date(time);
        let h = t.getHours();
        if (h > 12) h-=12;
        let m = t.getMinutes();
        if (m < 10) m="0"+m;
        return h+":"+m;
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
                <RouteIcon route_id={stop["trip"]["route_id"]} />
                <span className="time">
                    <TimeAgo date={stop["time"]} formatter={this.formatter.bind(this)}></TimeAgo>
                    {this.props.showTime && <span className="time-hrmin">
                        {this.hrMin(stop["time"])}
                    </span>}
                </span>
                <span className="title">
                    {!direction && stop["title"] && stop["title"]}
                    {direction && this.directionLabel(direction)}
                </span>
            </div>
        )
    }
}

StationStop.defaultProps = {
    shortUnits: false,
    showTime: false
};