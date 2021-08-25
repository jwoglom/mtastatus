export default async function fetchStationInfo(stations) {
    const endpoint = process.env.REACT_APP_MTASTATUS_ENDPOINT;
    const req = await fetch(endpoint+'/api/stations/'+stations.join(','));
    const data = await req.json();
    console.log(data);

    let ret = {};
    Object.keys(data).forEach((station, i) => {
        const stops = data[station]["stops"];

        let displayedRoutes = new Set();
        stops.forEach((stop, i) => {
            displayedRoutes.add(stop["trip"]["route_id"]);
        });

        const date = (""+new Date()).split(" ")[4];
        ret[station] = {
            name: data[station]["station"]["name"],
            direction: data[station]["station"]["direction"],
            destination: data[station]["station"]["destination"],
            routes: data[station]["station"]["routes"],
            displayedRoutes: displayedRoutes,
            stops: stops,
            updateTime: date
        };
    });

    return ret;
}