# mtastatus

Dashboard which displays MTA New York City Subway train arrival times for a provided set of stations.

## Setup

* [Obtain a MTA API key](https://new.mta.info/developers)
* Clone repo:
```bash
git clone https://github.com/jwoglom/mtastatus
cd mtastatus
```
* Install Pipenv with pip on a system with Python already installed:
```bash
pip3 install pipenv
```
* Install Python server dependencies:
```bash
pipenv install
```
* Launch Python server which processes the MTA API:
```bash
MTA_API_KEY=xxx pipenv run mtastatus
```
* Install frontend React dependencies:
```bash
cd frontend
npm install
```
* Run React app, and give it the URL to the running Python API server:
```bash
REACT_APP_MTASTATUS_ENDPOINT=http://localhost:8400 npm start
```
* Open the React app on port 3000

## Terminology

### Station Codes
Station Stop IDs can be determined by looking for a station name in `data/stops.txt`.
Station codes which end with a `N` or `S` refer to the northbound or southbound platform for the overall station.

For example, **23 St** on the 4/5/6 trains has base station code `634`. `634N` refers to the northbound and `634S` the southbound platform.

Note that transfer stations contain separate station codes for the separate trunk lines which run through them.
For example, there are 2 station codes for **W 4 St**: `A32` for the A/C/E trains, and `D20` for the B/D/F/M trains.
Each has its own `N` and `S` variant.

MTAStatus supports providing either the overarching station code or the specific platform code.
If the former is displayed, information across both platforms will be condensed into one panel.

### Station Groupings
Station IDs can be delimited with commas (`,`), semicolons (`;`), and pipes (`|`) to create a station grouping.

* A **comma** (`,`) creates a new pane to the right of the previous one.
* A **semicolon** (`;`) creates a new row of panes.
* A **pipe** (`|`) allows you to provide two different station IDs to be displayed within the same pane.
  This is done by default when you provide an overarching station code in order to display both the northbound and southbound platforms.

## URL Endpoints
You can provide these station IDs in a few different ways:

### Default home screen
Run the React app with the `REACT_APP_MTASTATUS_HOME_STATIONS` environment variable set to a station grouping to control what appears by default on the index page.

### Station Grouping Link
Link to `/stations/<grouping>` to specify a custom station grouping.

### Station-specific Link
Link to `/station/<station>` with a specific station ID to view details for just that station.

Note that if a non-`N`/`S` station code is provided (e.g. `634`), it will merge trains across destinations for that station into one list.

### Dual-station link
To instead see the northbound and southbound trains separated, use `/dualstation/634N/634S`.
A station grouping URL of `/stations/634` will display the same content.

## Custom Parameters
You can specify via GET arguments:

* showMergedStationView: for a non-`N`/`S` station code, defaults to showing `<code>N|<code>S` in the same pane when just the base station `<code>` is provided inside a grouping.
* showLastUpdated: allows disabling the last updated timestamp
* minTimeMinutes: hides trains which have ETAs shorter than this number of minutes for each station
* maxTimeMinutes: hides trains which have ETAs longer than this number of minutes for each station
* maxCount: hides more than the given number of ETAs for each station




