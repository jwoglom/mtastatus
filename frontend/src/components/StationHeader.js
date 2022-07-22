import React from "react";
import routeGroupSort from "../utils/routeGroupSort";

import RouteIcon from "./RouteIcon";

export default class StationHeader extends React.Component {
    imgBase = "https://new.mta.info/themes/custom/bootstrap_mta/images/icons/"
    async componentDidMount() {
    }

    dashToNewline(text) {
        if (text.indexOf('-') === -1) {
            return text;
        }
        let parts = text.split('-');
        function buildUpdated(parts, MAX) {
            let updated = [];
            let curPart = '';
            for (var i=0; i<parts.length; i++) {
                let newPart = parts[i];
                if (curPart.length > 0) {
                    newPart = curPart + '/' + newPart;
                }
                if (newPart.length < MAX) {
                    curPart = newPart;
                } else {
                    updated.push(curPart);
                    curPart = parts[i];
                }
                console.log(newPart, curPart);
            }
            if (curPart.length > 0) {
                updated.push(curPart);
            }
            return updated;
        }

        let updated = buildUpdated(parts, 18);
        if (updated.length > 2) {
            updated = buildUpdated(parts, 21);
        }

        return updated.map((t, i) => <React.Fragment key={t}>
            {t}{i < updated.length-1 && <>/ <br /></>}
        </React.Fragment>)
    }

    renderRoutes(routes, displayedRoutes) {
        return (
            <span className="header-routes">
                {routeGroupSort(routes||[]).map((route, i) =>
                    displayedRoutes.has(route) &&
                    <RouteIcon route_id={route} grayed_out={false} key={i} />)}
                {routeGroupSort(routes||[]).map((route, i) =>
                    !displayedRoutes.has(route) && 
                    <RouteIcon route_id={route} grayed_out={true} key={i} />)}
            </span>
        )
    }

    render() {
        const name = this.props.name;
        const direction = this.props.direction;
        const dualDirection = this.props.dualDirection;
        const destination = this.props.destination;
        
        const routes = this.props.routes;
        let displayedRoutes = this.props.displayedRoutes;

        if (!name) {
            return (<div></div>);
        }

        return (
            <h1>
                {dualDirection && <>
                    {typeof name === 'string' && <div className="header-name">
                        {name}
                    </div>}
                    <div className="header-dest-dual">
                        {typeof name !== 'string' && <>
                            <div className="header-name">
                                {name[0]}
                                <br /><br />
                            </div>

                            <div className="header-name">
                                {name[1]}
                                <br /><br />
                            </div>
                        </>}
                        <div className={"header-dest "+direction} title={destination[0]}>
                            {this.dashToNewline(destination[0])}
                        </div>
                        <div className={"header-dest "+direction} title={destination[1]}>
                            {this.dashToNewline(destination[1])}
                        </div>

                        <div>
                            {this.renderRoutes(routes[0], displayedRoutes[0])}
                        </div>
                        <div>
                            {this.renderRoutes(routes[1], displayedRoutes[1])}
                        </div>
                    </div>
                </>}

                {!dualDirection && <>
                    <div className="header-name">
                        {name}
                    </div>
                    {this.renderRoutes(routes, displayedRoutes)}
                    <span className={"header-dest "+direction} title={destination}>
                        {destination}
                    </span>
                </>}
            </h1>
        )
    }
}

StationHeader.defaultProps = {
    dualDirection: false,
};