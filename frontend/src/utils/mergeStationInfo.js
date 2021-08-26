export default function mergeStationInfo(station, info) {
    if (!info || Object.keys(info).length == 0) {
        return undefined;
    }

    let north = info[station+"N"];
    let south = info[station+"S"];
    if (!north || !south) {
        console.error(info, station);
        return undefined;
    }
    let stops = [];
    north.stops.map(s => {
        let stop = Object.assign({}, s);
        stop["title"] = north.destination;
        stops.push(stop);
    });
    south.stops.map(s => {
        let stop = Object.assign({}, s);
        stop["title"] = south.destination;
        stops.push(stop);
    });
    stops.sort((a, b) => new Date(a["time"]) - new Date(b["time"]));
    return {
        name: north.name,
        direction: "",
        destination: north.destination+" / "+south.destination,
        routes: north.routes,
        displayedRoutes: north.displayedRoutes,
        stops: stops,
        updateTime: north.updateTime
    };
}