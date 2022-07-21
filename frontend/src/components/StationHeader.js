import React from "react";
import routeGroupSort from "../utils/routeGroupSort";

import RouteIcon from "./RouteIcon";

export default class StationHeader extends React.Component {
    imgBase = "https://new.mta.info/themes/custom/bootstrap_mta/images/icons/"
    async componentDidMount() {
    }

    render() {
        const name = this.props.name;
        const direction = this.props.direction;
        const destination = this.props.destination;
        const routes = this.props.routes;
        let displayedRoutes = this.props.displayedRoutes;
        if (!name) {
            return (<div></div>);
        }
        console.info('routes: '+Array.from(displayedRoutes));

        return (
            <h1>
                <div className="header-name">
                    {name}
                </div>
                <span className="header-routes">
                    {routeGroupSort(routes||[]).map((route, i) =>
                        displayedRoutes.has(route) &&
                        <RouteIcon route_id={route} grayed_out={false} key={i} />)}
                    {routeGroupSort(routes||[]).map((route, i) =>
                        !displayedRoutes.has(route) && 
                        <RouteIcon route_id={route} grayed_out={true} key={i} />)}
                </span>
                <span className={"header-dest "+direction}>
                    {destination}
                </span>
            </h1>
        )
    }
}