#!/usr/bin/env python3

from flask import Flask, Response, request, abort, render_template, jsonify, send_from_directory
from flask_cors import CORS
from underground import SubwayFeed, metadata
from zoneinfo import ZoneInfo
import requests

import time
import csv
import json
import os
import datetime

app = Flask(__name__, static_folder='frontend/build')
CORS(app)

# Log messages with Gunicorn
if not app.debug:
    import logging
    app.logger.addHandler(logging.StreamHandler())
    app.logger.setLevel(logging.INFO)

destinations = json.loads(open("data/destinations.json").read())
# from destinations import build_destinations_map
# destinations = build_destinations_list()

linegroups = ("ACE", "BDFM", "G", "JZ", "NQRW", "L", "1234567", ["SIR"])

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

        if label == "N":
            label = "Northbound"
        elif label == "S":
            label = "Southbound"

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
    grps = set()
    for l in lines:
        for lg in linegroups:
            if l in lg:
                grps.add(''.join(list(lg)))

    stop_dict = {}
    for l in grps:
        try:
            feed = SubwayFeed.get(l[0])
        except ValueError as e:
            raise RuntimeError('Have you specified MTA_API_KEY?') from e
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

def process_stations(stations):
    new = []
    for s in stations:
        if not s.endswith('N') and not s.endswith('S'):
            new.append(s+'N')
            new.append(s+'S')
        else:
            new.append(s)
    return new

def get_stations(lines, sts):
    stops = get_lines(lines)
    data = {}
    for l in stops:
        for s in stops[l]:
            if s in sts:
                if not s in data:
                    data[s] = stops[l][s]
                else:
                    data[s]['stops'] = sort_stops(data[s]['stops'] + stops[l][s]['stops'])
    for s in sts:
        if s not in data:
            data[s] = {
                "station": stations.get(s),
                "stops": []
            }
    return data

def sort_stops(stops):
    return sorted(stops, key=lambda s: s['time'])

@app.route('/api/lines/<path:lines>/stations/<path:stations>')
def api_line_stations_route(lines, stations):
    sts = process_stations(stations.split(','))
    data = get_stations(lines.split(','), sts)
    if request.args.get('alerts'):
        data = augment_alerts(data)
    return jsonify(data)

@app.route('/api/lines/<path:lines>/stations/<path:stations>/tts')
def api_line_stations_tts_route(lines, stations):
    def get_station_param(name, st, default='0'):
        for_st = request.args.get('%s[%s]' % (name, st), default)
        if for_st != default:
            return for_st

        st_base = st
        if st_base.endswith('N') or st_base.endswith('S'):
            st_base = st[:-1]

        for_st_base = request.args.get('%s[%s]' % (name, st_base), default)
        if for_st_base != default:
            return for_st_base

        return request.args.get(name, default)

    sts = process_stations(stations.split(','))
    stations = get_stations(lines.split(','), sts)
    stations_ordered = []
    for st in sts:
        if stations[st]:
            stations_ordered.append([st, stations[st]])

    statements = []
    for code, st in stations_ordered:
        station = st['station']['name']
        direction = st['station']['direction']
        dest = st['station']['destination']
        if '-' in dest:
            if direction == 'N':
                dest = get_station_param('northLabel', code, default='North')
            elif direction == 'S':
                dest = get_station_param('southLabel', code, default='South')

        count = int(get_station_param('count', code, default='0'))
        min_time_mins = int(get_station_param('minTimeMinutes', code, default='0'))
        merge_lines = get_station_param('mergeLines', code, default='true') == 'true'

        stops = st['stops']
        stops.sort(key=lambda x: datetime.datetime.fromisoformat(x['time']))
        times = []
        i = 0
        for stop in stops:
            route = stop['trip']['route_id']
            time = datetime.datetime.fromisoformat(stop['time'])
            diff = round((time - datetime.datetime.now(ZoneInfo('America/New_York'))).seconds/60)
            if diff < min_time_mins:
                continue

            i += 1
            if count == 1:
                statements.append('The next %s-bound %s train at %s is %s minutes away.' % (dest, route, station, diff))
                break
            elif count >= i:
                times.append([route, diff])

        if times and merge_lines:
            routes = [i[0] for i in times]
            statement = 'The next %s-bound %s trains at %s are ' % (dest, ' and '.join(list(set(routes))), station)
            statement += ''.join(['%s, ' % diff[1] for diff in times[:-1]])[:-2]
            statement += ' and %s minutes away.' % times[-1][1]
            statements.append(statement)
        elif times:
            times_per = {}
            for t in times:
                if t[0] not in times_per:
                    times_per[t[0]] = []
                times_per[t[0]].append(t)

            for route, times in times_per.items():
                if direction == 'N':
                    dest = get_station_param('northLabel', '%s-%s' % (route, code), default=dest)
                elif direction == 'S':
                    dest = get_station_param('southLabel', '%s-%s' % (route, code), default=dest)

                skip = get_station_param('skip', '%s-%s' % (route, code), default='false') != 'false'
                if skip:
                    continue

                statement = 'The next %s-bound %s train%s at %s %s ' % (dest, route, 's' if len(times) > 1 else '', station, 'are' if len(times) > 1 else 'is')
                statement += ''.join(['%s, ' % diff[1] for diff in times[:-1]])[:-2]
                statement += ' and' if len(times) > 1 else ''
                statement += ' %s minutes away.' % times[-1][1]
                statements.append(statement)

    return ' \n'.join(statements)


def get_inferred_lines(sts):
    lines = set()
    for s in sts:
        st = stations.get(s)
        if st:
            for r in st["routes"]:
                lines.add(r)

    return lines

@app.route('/api/stations/<path:stations>')
def api_stations_route(stations):
    sts = process_stations(stations.split(','))
    inferred_lines = get_inferred_lines(sts)
    data = get_stations(inferred_lines, sts)
    if request.args.get('alerts'):
        data = augment_alerts(data)
    return jsonify(data)

@app.route('/api/stations_list')
def api_stations_list_route():
    return jsonify(stations)

SUBWAY_ALERTS_JSON = 'https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts.json'
_alerts_json = None
_alerts_json_ts = None
def fetch_alerts_json():
    global _alerts_json, _alerts_json_ts

    if _alerts_json and time.time() - _alerts_json_ts <= 30:
        return _alerts_json

    r = requests.get(SUBWAY_ALERTS_JSON, headers={'x-api-key': os.getenv('MTA_API_KEY')})
    if r.status_code // 100 != 2:
        raise RuntimeError(f'HTTP {r.status_code} from subway alerts JSON: {r.text}')

    out = r.json()
    _alerts_json = out
    _alerts_json_ts = time.time()

    return out


def get_alerts():
    def parse_translations(obj):
        trans = {}
        for tr in obj['translation']:
            trans[tr.get('language')] = tr.get('text')

        return trans

    def parse_entities(entities):
        affected_lines = []
        affected_stations = []
        for obj in entities:
            if obj.get('agency_id', '') != 'MTASBWY':
                continue
            if 'route_id' in obj:
                affected_lines.append(obj['route_id'])
            if 'stop_id' in obj:
                affected_stations.append(obj['stop_id'])

        return affected_lines, affected_stations


    raw = fetch_alerts_json()
    alerts = []
    ts = raw['header']['timestamp']
    for entity in raw.get('entity', []):
        alert_type = None
        display_before_active = 0
        active_period_text = None
        station_alternatives = None

        mercury_alert = entity['alert'].get('transit_realtime.mercury_alert')
        if mercury_alert:
            alert_type = mercury_alert.get('alert_type')
            display_before_active = mercury_alert.get('display_before_active', 0)

            active_period_text_ = mercury_alert.get('human_readable_active_period')
            if active_period_text_:
                active_period_text = parse_translations(active_period_text_)

            station_alternatives = []
            station_alternatives_ = mercury_alert.get('station_alternative', [])
            for st in station_alternatives_:
                affected_lines = None
                affected_stations = None
                affected_entity_ = st.get('affected_entity')
                if affected_entity_:
                    affected_lines, affected_stations = parse_entities([affected_entity_])

                notes = None
                notes_ = st.get('notes')
                if notes_:
                    notes = parse_translations(notes_)

                station_alternatives.append({
                    'affected_lines': affected_lines,
                    'affected_stations': affected_stations,
                    'notes': notes
                })



        is_active = False
        for pd in entity['alert'].get('active_period', []):
            if 'end' in pd:
                if pd['start'] - display_before_active <= ts and ts <= pd['end']:
                    is_active = True
            elif pd['start'] - display_before_active <= ts:
                is_active = True
        if not is_active:
            continue

        affected_lines, affected_stations = parse_entities(entity['alert'].get('informed_entity', []))

        header_text = None
        header_text_ = entity['alert'].get('header_text')
        if header_text_:
            header_text = parse_translations(header_text_)

        description_text = None
        description_text_ = entity['alert'].get('description_text')
        if description_text_:
            description_text = parse_translations(description_text_)

        parsed = {
            'alert_type': alert_type,
            'active_period_text': active_period_text,
            'is_active': is_active,
            'affected_lines': affected_lines,
            'affected_stations': affected_stations,
            'header_text': header_text,
            'description_text': description_text,
            'station_alternatives': station_alternatives
        }
        alerts.append(parsed)

    return alerts

def filter_alerts(filter_lines=None, filter_stations=None):
    alerts = get_alerts()
    def arr_includes(base, query):
        return any([q in base for q in (query or [])])

    out = []
    for a in alerts:
        include = False
        if arr_includes(a.get('affected_lines', []), filter_lines):
            include = True
        if arr_includes(a.get('affected_stations', []), filter_stations):
            include = True
        if include:
            out.append(a)

    return out

# input data shape: {"stationID": {"station": .., "stops": ..}}
def augment_alerts(data):
    for station_id, vals in data.items():
        lines = list(set([i["trip"]["route_id"] for i in vals["stops"]]))
        vals["alerts"] = filter_alerts(filter_stations=[station_id], filter_lines=lines)

    return data

@app.route('/api/alerts')
def api_alerts_route():
    return jsonify(get_alerts())

@app.route('/api/alerts/lines/<path:lines>')
def api_alerts_lines_route(lines):
    return jsonify(filter_alerts(filter_lines=lines.split(',')))

@app.route('/api/alerts/stations/<path:stations>')
def api_alerts_stations_route(stations):
    return jsonify(filter_alerts(filter_stations=stations.split(',')))

@app.route('/api/alerts/lines/<path:lines>/stations/<path:stations>')
def api_alerts_lines_stations_route(lines, stations):
    return jsonify(filter_alerts(filter_lines=lines.split(','), filter_stations=stations.split(',')))

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run('0.0.0.0', port=8400)