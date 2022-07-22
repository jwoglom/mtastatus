export default function mergeStationInfo(station, info) {
    console.debug('mergeStationInfo', station);
    if (station.indexOf('+') === -1) {
        return innerMerge([station+"N", station+"S"], info);
    }

    let rawParts = station.split('+');
    let parts = [];
    rawParts.forEach(p => {
        if (!p.endsWith("N") && !p.endsWith("S")) {
            parts.push(p+"N");
            parts.push(p+"S");
        } else {
            parts.push(p);
        }
    })
    
    return innerMerge(parts, info);
}

function innerMerge(codes, info) {
    if (!info || Object.keys(info).length === 0) {
        return undefined;
    }

    for (let i=0; i<codes.length; i++) {
        if (!info[codes[i]]) {
            console.error("Could not find "+codes[i]+" in mergeStationInfo:", info);
            return undefined;
        }
    }

    let infos = codes.map(code => info[code]);

    console.debug("innerMerge", codes, infos, info);
    let stops = [];
    let names = [];
    let directions = [];
    let destinations = [];
    let routes = [];
    let displayedRoutes = new Set();
    infos.forEach((dir) => {
        console.debug("innerMerge loop", dir);
        // eslint-disable-next-line
        dir.stops.map(s => {
            let stop = Object.assign({}, s);
            stop["title"] = dir.destination;
            stops.push(stop);
        });
        if (names.indexOf(dir.name) === -1) {
            names.push(dir.name);
        }
        if (directions.indexOf(dir.direction) === -1) {
            directions.push(dir.direction);
        }
        if (destinations.indexOf(dir.destination) === -1) {
            destinations.push(dir.destination);
        }
        dir.routes.forEach(r => {
            if (routes.indexOf(r) === -1) {
                routes.push(r);
            }
        });
        dir.displayedRoutes.forEach(r => {
            displayedRoutes.add(r);
        });
    });
    stops.sort((a, b) => new Date(a["time"]) - new Date(b["time"]));
    routes.sort();
    let filteredDests = destinations.filter(d => d !== 'Northbound' && d !== 'Southbound');
    if (filteredDests.length > 0) {
        destinations = filteredDests;
    }

    console.debug("innerMergeStops", stops, names, directions, destinations, routes)

    return {
        name: names.join(" - "),
        direction: directions.join(" - "),
        destination: destinations.join(" - "),
        routes: routes,
        displayedRoutes: displayedRoutes,
        stops: stops,
        updateTime: infos[0].updateTime
    };
}