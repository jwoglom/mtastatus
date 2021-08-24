#!/usr/bin/env python3

from flask import Flask, Response, request, abort, render_template, jsonify
from flask_cors import CORS
from underground import SubwayFeed, metadata

import csv
import json

app = Flask(__name__, static_url_path='/static')
CORS(app)

# Log messages with Gunicorn
if not app.debug:
    import logging
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

destinations = json.loads(open("data/destinations.json").read())
# from destinations import build_destinations_map
# destinations = build_destinations_list()

def build_stations_map():
    stations = {}
    textfile = open("data/stops.txt")
    for stop in csv.DictReader(textfile):
        if stop["location_type"] == "1":
            continue

        direction = stop["stop_id"][-1]
        label = direction
        routes = []

        dest = destinations.get(stop["stop_id"][:-1])
        if dest:
            if direction == "N":
                label = dest["North_Direction_Label"]
            elif direction == "S":
                label = dest["South_Direction_Label"]
            
            routes = dest["Daytime_Routes_Array"]

        stations[stop["stop_id"]] = {
            "name": stop["stop_name"],
            "direction": direction,
            "destination": label,
            "routes": routes
        }
    
    return stations

stations = build_stations_map()

def extract_stop_dict(self, timezone=metadata.DEFAULT_TIMEZONE):
    from operator import attrgetter
    import pydantic
    import pytz

    # filter down data to trips with an update
    entities_with_updates = filter(lambda x: x.trip_update is not None, self.entity)
    trip_updates = map(attrgetter("trip_update"), entities_with_updates)

    # grab the updates with routes and stop times
    trip_updates_with_stops = filter(
        lambda x: x.trip.route_is_assigned and x.stop_time_update is not None,
        trip_updates,
    )
    # create (route, stop, time) tuples from each trip
    stops_flat = (
        (
            trip.trip.route_id_mapped,
            stop.stop_id,
            (stop.depart_or_arrive).time.astimezone(pytz.timezone(timezone)),
            trip.trip
        )
        for trip in trip_updates_with_stops
        for stop in trip.stop_time_update
        if stop.depart_or_arrive is not None
        and stop.depart_or_arrive.time >= self.header.timestamp
    )

    # group into a dict like {route: stop: [t1, t2]}
    stops_grouped = dict()

    for route_id, stop_id, departure, trip in stops_flat:
        if route_id not in stops_grouped:
            stops_grouped[route_id] = dict()

        if stop_id not in stops_grouped[route_id]:
            stops_grouped[route_id][stop_id] = []

        stops_grouped[route_id][stop_id].append({
            "time": departure,
            "trip": {
                "trip_id": trip.trip_id,
                "start_time": str(trip.start_time),
                "start_date": trip.start_date,
                "route_id": trip.route_id

            }
        })

    return stops_grouped

def get_lines(lines):
    stop_dict = {}
    for l in lines:
        feed = SubwayFeed.get(l)
        stop_dict.update(extract_stop_dict(feed))

    stops = {}
    for l in stop_dict:
        stops[l] = {}
        for s in stop_dict[l]:
            stops[l][s] = {
                "station": stations.get(s),
                "stops": [{"time": str(dt["time"]), "trip": dt["trip"]} for dt in stop_dict[l][s]]
            }
    
    return stops

@app.route('/api/lines/<path:lines>')
def api_lines_route(lines):
    return jsonify(get_lines(lines.split(',')))

def get_stations(lines, stations):
    print(lines, stations)
    new = []
    for s in stations:
        if not s.endswith('N') and not s.endswith('S'):
            new.append(s+'N')
            new.append(s+'S')
        else:
            new.append(s)
    stations = new

    stops = get_lines(lines)
    data = {}
    for l in stops:
        for s in stops[l]:
            if s in stations:
                print(stops[l][s])
                if not s in data:
                    data[s] = stops[l][s]
                else:
                    data[s]['stops'] = sort_stops(data[s]['stops'] + stops[l][s]['stops'])
    return data

def sort_stops(stops):
    return sorted(stops, key=lambda s: s['time'])

@app.route('/api/lines/<path:lines>/stations/<path:stations>')
def api_stations_route(lines, stations):
    return jsonify(get_stations(lines.split(','), stations.split(',')))

@app.route('/')
def index_route():
    stations = request.args.getlist("station")
    return render_template("index.html", stations=stations)

if __name__ == '__main__':
    app.run('0.0.0.0', port=8400)