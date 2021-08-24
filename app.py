#!/usr/bin/env python3

from flask import Flask, Response, request, abort, render_template, jsonify
from underground import SubwayFeed
import csv

app = Flask(__name__, static_url_path='/static')

# Log messages with Gunicorn
if not app.debug:
    import logging
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

def build_stations_map():
    stations = {}
    textfile = open("data/stops.txt")
    for stop in csv.DictReader(textfile):
        if stop["location_type"] == "1":
            continue

        stations[stop["stop_id"]] = {
            "name": stop["stop_name"],
            "direction": stop["stop_id"][-1]
        }
    
    return stations

stations = build_stations_map()

def get_lines(lines):
    stop_dict = {}
    for l in lines:
        feed = SubwayFeed.get(l)
        stop_dict.update(feed.extract_stop_dict())

    stops = {}
    for l in stop_dict:
        stops[l] = {}
        for s in stop_dict[l]:
            stops[l][s] = {
                "station": stations.get(s),
                "stops": [{"time": str(dt), "line": l} for dt in stop_dict[l][s]]
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
                
                if len(stops[l][s]) > 0:
                    if not 'lines' in data[s]:
                        data[s]['lines'] = [l]
                    else:
                        data[s]['lines'].append(l)
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