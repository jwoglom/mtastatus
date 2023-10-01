import React from "react";
import RouteIcon from "../components/RouteIcon";

export function renderText(text) {
    const lines = ["A", "C", "E", "B", "D", "F", "M", "G", "J", "Z", "N", "Q", "R", "W", "L", "1", "2", "3", "4", "5", "6", "7", "SIR"];
    let splits = [];
    for (let i=0; i<lines.length; i++) {
        if (text.indexOf('['+lines[i]+']') !== -1) {
            splits.push(<RouteIcon route_id={lines[i]} inline={true} />);
            text = text.replace('['+lines[i]+']', ';;;');
        }
    }

    let textparts = text.split(';;;');
    let final = [];
    for (let i=0; i<textparts.length; i++) {
        final.push(<span>{textparts[i]}</span>);
        if (i < splits.length) {
            final.push(splits[i]);
        }
    }

    return <span style={{lineHeight: '20px'}}>{final}</span>;
}