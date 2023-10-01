import React from "react";
import RouteIcon from "./RouteIcon";
import { renderText } from "../utils/renderText";

export default class AlertsSummary extends React.Component {
    render() {
        const alerts = this.props.alerts || [];
        const condensed = this.props.condensed || false;

        return <div>
            {alerts
                .map(alert => 
                    <div key={alert.id}>
                        <b>{alert.affected_lines && alert.affected_lines.map(route => <RouteIcon key={route} route_id={route} inline={true} />)} ⚠ {alert.alert_type}{!condensed && ':'} </b>
                        {!condensed && <>
                            {renderText(alert.header_text.en)}
                        </>}
                    </div>
                )}
        </div>
    }
}