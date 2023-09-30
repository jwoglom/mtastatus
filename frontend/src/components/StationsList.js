import React from "react";
import RouteIcon from "./RouteIcon";

export default class StationsList extends React.Component {
    state = {
        showRoutes: []
    }

    matchingRoute(routes) {
        if (this.state.showRoutes.length === 0) return true;
        let routeSet = new Set(routes);

        let matches = true;
        this.state.showRoutes.forEach((route) => {
            if (!routeSet.has(route)) matches = false;
        });

        return matches;
    }

    allRoutes(stations) {
        let routes = new Set();
        if (!stations) return [];

        // eslint-disable-next-line
        Object.entries(stations).map(([code, data]) => {
            data.routes.forEach((route) => routes.add(route));
        });

        console.debug('allroutes', routes);
        return [...routes].sort();
    }
    
    routeFilter(route) {
        let routes = new Set(this.state.showRoutes);
        if (routes.has(route)) {
            routes.delete(route);
        } else {
            routes.add(route);
        }
        this.setState({...this.state, showRoutes: [...routes]});
        console.log("filter:", this.state.showRoutes, routes, route);
    }

    render() {
        const direction = {'N': 'Northbound', 'S': 'Southbound'};

        const stations = this.props.stations;
        const allRoutes = this.allRoutes(stations);
        const currentlyFiltered = new Set(this.state.showRoutes);

        console.log(stations, allRoutes);
        return (
            <div className="stations-list">
                <div>
                    {allRoutes.map((route) => <span key={route} onClick={this.routeFilter.bind(this, route)}>
                        <RouteIcon route_id={route} grayed_out={this.state.showRoutes.length === 0 ? false : !currentlyFiltered.has(route)} />
                    </span>)}
                </div>
                {stations && Object.entries(stations).map(([code, data]) => <React.Fragment key={code}>
                    {this.matchingRoute(data.routes) && <div className="station">
                        {data.routes.sort().map(route => <RouteIcon route_id={route} />)}
                        <a href={"/station/"+code} className="station-stop">
                            {code}: {data.name} to {data.destination || direction[data.direction]} ({data.direction})
                        </a>
                    </div>}
                </React.Fragment>)}
            </div>
        )
    }
};