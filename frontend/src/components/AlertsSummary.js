import React from "react";
import RouteIcon from "./RouteIcon";
import { renderText } from "../utils/renderText";

export default class AlertsSummary extends React.Component {
    render() {
        const alerts = this.props.alerts || [];
        const hideAlertIds = this.props.hideAlertIds || [];
        const condensed = this.props.condensed || false;

        return <div>
            {alerts
                .map(alert => <>
                    {hideAlertIds.indexOf(alert.id) === -1 &&
                        <div key={alert.id} data-id={alert.id}>
                            <b>{alert.affected_lines && alert.affected_lines.map(route => <RouteIcon key={route} route_id={route} inline={true} />)} ⚠ {alert.alert_type}{!condensed && ':'} </b>
                            {!condensed && <span title={alert.description_text && alert.description_text.en}>
                                {renderText(alert.header_text.en)}
                            </span>}
                        </div>
                    }
                    </>
                )}
        </div>
    }
}