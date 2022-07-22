import requests
import urllib
import sourcemap
import io
import pyjson5

from bs4 import BeautifulSoup

MTA_MAP = 'https://map.mta.info'

def get_mtamap_js_url():
    mtamap = requests.get(MTA_MAP)
    soup = BeautifulSoup(mtamap.text, 'html.parser')
    for s in soup.find_all('script'):
        if 'src' in s.attrs and 'js/main' in s.attrs['src']:
            return urllib.parse.urljoin(MTA_MAP, s.attrs['src'])

def get_srcmap(jsurl, js):
    mappath = sourcemap.discover(js)
    path = urllib.parse.urljoin(jsurl, mappath)
    mapcontents = requests.get(path).text
    index = sourcemap.load(io.StringIO(mapcontents))
    return index

def find_js_define(index, jsc):
    tokens = list(filter(None, [x if x.name == 'stationsUnified' and x.src.endswith('stations-unified.ts') else None for x in index.index.values()]))
    if len(tokens) != 1:
        return None
    token = tokens[0]
    jslines = jsc.splitlines()
    ln = jslines[token.dst_line]
    tk = ln[token.dst_col:]
    return tk

def find_dest_list(define):
    values = define.split('=', 1)[1]
    stk = []
    OPEN = '[{'
    CLOSE = ']}'
    for i, v in enumerate(values):
        if v in '[{':
            stk.append(v)
        elif v in ']}':
            p = stk.pop()
            if CLOSE.index(v) != OPEN.index(p):
                raise ValueError('unexpected brace')
        
        if len(stk) == 0:
            return values[:1+i]

def parse_js(raw):
    return pyjson5.decode(raw)

def build_destinations_map():
    jsurl = get_mtamap_js_url()
    jscontents = requests.get(jsurl).text
    index = get_srcmap(jsurl, jscontents)
    define = find_js_define(index, jscontents)
    dests_raw = find_dest_list(define)
    dests_list = parse_js(dests_raw)
    
    dests = {}
    for item in dests_list:
        dests[item['stopId']] = item

    return dests

if __name__ == '__main__':
    import pprint
    pprint.pprint(build_destinations_map())
    import json
    open("data/destinations.json", "w").write(json.dumps(build_destinations_map()))