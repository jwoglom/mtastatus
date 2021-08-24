import React from "react";

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
                {name} ({destination})
                <span>
                    {(routes||[]).map((route, i) =>
                        displayedRoutes.has(route) && <img src={this.imgBase+route+".svg"} width="20" alt={route} key={route} className={displayedRoutes.has(route) ? 'displayed': 'notDisplayed'} />)}
                    {(routes||[]).map((route, i) =>
                        !displayedRoutes.has(route) && <img src={this.imgBase+route+".svg"} width="20" alt={route} key={route} className={displayedRoutes.has(route) ? 'displayed': 'notDisplayed'} />)}
                </span>
            </h1>
        )
    }
}