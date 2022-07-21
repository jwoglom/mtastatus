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
        return text.replace('-','/-').split('-').map((t) => <React.Fragment key={t}>
            {t}<br />
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
                        <div className={"header-dest "+direction}>
                            {this.dashToNewline(destination[0])}
                        </div>
                        <div className={"header-dest "+direction}>
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
                    <span className={"header-dest "+direction}>
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