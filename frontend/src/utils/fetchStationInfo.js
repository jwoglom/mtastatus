export async function fetchStationInfo(stations, options) {
    const endpoint = process.env.REACT_APP_MTASTATUS_ENDPOINT;
    let query = '';
    if (options && options.alerts) {
        query += 'alerts=1&';
    }
    const req = await fetch(endpoint+'/api/stations/'+stations.join(',')+'?' + query);
    const data = await req.json();
    console.log("fetchStationInfo:", stations, data);

    let ret = {};
    Object.keys(data).forEach((station, i) => {
        if (typeof data[station] === 'undefined') {
            throw new Error('Station '+station+' not found in data: ' + Object.keys(data))
        }
        const stops = data[station]["stops"];
        const date = (""+new Date()).split(" ")[4];
        ret[station] = {
            name: data[station]["station"]["name"],
            direction: data[station]["station"]["direction"],
            destination: data[station]["station"]["destination"],
            routes: data[station]["station"]["routes"],
            displayedRoutes: makeDisplayedRoutes(stops),
            stops: stops,
            updateTime: date,
            alerts: data[station]["alerts"]
        };
    });

    return ret;
}

export function makeDisplayedRoutes(stops) {
    let displayedRoutes = new Set();
    stops.forEach((stop, i) => {
        displayedRoutes.add(stop["trip"]["route_id"]);
    });

    return displayedRoutes;
}
