import React from "react";
import RouteIcon from "./RouteIcon";
import { renderText } from "../utils/renderText";

export default class AlertsSummary extends React.Component {
    render() {
        const alerts = this.props.alerts || [];

        return <div>
            {alerts
                .map(alert => 
                    <div key={alert.id}>
                        <b>{alert.affected_lines && alert.affected_lines.map(route => <RouteIcon key={route} route_id={route} inline={true} />)} ⚠ {(alert.active_period_text && alert.active_period_text.en) || alert.alert_type} </b>
                        {renderText(alert.header_text.en)}
                    </div>
                )}
        </div>
    }
}