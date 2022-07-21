import React from "react";

export default class RouteIcon extends React.Component {
    imgBase = "/route_icons/";

    render() {
        const route_id = this.props.route_id;
        const grayed_out = this.props.grayed_out;

        return <img 
            src={this.imgBase+route_id+".svg"}  
            height="20"
            alt={route_id} 
            valign="middle" 
            className={"bullet " + (grayed_out ? 'notDisplayed': 'displayed')} />;
    }
}