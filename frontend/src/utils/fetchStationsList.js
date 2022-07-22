export async function fetchStationsList() {
    const endpoint = process.env.REACT_APP_MTASTATUS_ENDPOINT;
    const req = await fetch(endpoint+'/api/stations_list');
    const data = await req.json();

    return data;
}