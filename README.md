# mtastatus

Dashboard which displays MTA New York City Subway train arrival times for a provided set of stations.
Built to be extremely customizable, and perfect for a wall-mounted display.

<img width="900" alt="Screenshot" src="https://user-images.githubusercontent.com/192620/180371882-b853ab36-4671-421a-822a-9736078d52b8.png">


## Setup

The app consists of a Python backend API implemented in Flask and a frontend UI implemented in React.

Setup instructions:

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
Station Stop IDs can be determined by looking for a station name in `data/stops.txt`, or by viewing the `/stations` endpoint on the React app.
Station codes which end with a `N` or `S` refer to the northbound or southbound platform for the overall station.

For example, **23 St** on the 4/5/6 trains has base station code `634`. `634N` refers to the northbound and `634S` the southbound platform.

Note that transfer stations contain separate station codes for the separate trunk lines which run through them.
For example, there are 2 station codes for **W 4 St**: `A32` for the A/C/E trains, and `D20` for the B/D/F/M trains.
Each has its own `N` and `S` variant.

MTAStatus supports providing either the overarching station code or the specific platform code.
If the former is displayed, information across both platforms will be condensed into one panel.

### Station Groupings
Station IDs can be delimited with commas (`,`), semicolons (`;`), pipes (`|`), and pluses (`+`) to create a station grouping.

They are processed in this order:

* A **semicolon** (`;`) creates a new row of panes.
* A **comma** (`,`) creates a new pane to the right of the previous one.
* A **pipe** (`|`) allows you to provide two different station IDs to be displayed within the same pane.
  This is done by default when you provide an overarching station code in order to display both the northbound and southbound platforms.
* A **plus** (`+`) allows two stations with different IDs to be merged together and treated like a single ID.
  This can be used to merge together IDs of combined stations.

For example:

* To show **Jay St-Metrotech** (`A41`) next to **High St** (`A40`), you can use grouping `A41,A40`.
* To add the northbound platform of **Hoyt-Schermerhorn Sts** (`A42N`) to the row below, you can use grouping `A41,A40;A42N`
* To show the northbound platform of **Smith-9th Sts** (`F22N`) within the same pane as the northbound platform of **Jay St-Metrotech** (`A41N`), you can use grouping `F22N|A41N`
* To show the A/C/E platforms at **W 4 St** (`A32`) combined with the B/D/F/M platforms (`D20`), you can use grouping `A32+D20`

## URL Endpoints
You can provide these station IDs in a few different ways:

### Default home screen
Run the React app with the `REACT_APP_MTASTATUS_HOME_STATIONS` environment variable set to a station grouping to control what appears by default on the index page.

### Station-specific Link
Link to `/station/<station>` with a specific station ID to view details for just that station.
This can be easily iframe'd as the station contents takes up the entire page.

http://localhost:3000/station/A41N

<img width="400" alt="image" src="https://user-images.githubusercontent.com/192620/180370523-10c62b93-00d6-4b96-8b68-fbc997a6de07.png">

Note that if a non-`N`/`S` station code is provided (e.g. `A41` versus `A41S`), it will merge trains across both destinations for that station into one list. (If you want to see them separately, use `/dualstation/<code>N/<code>S` or `/stations/<code>`)

http://localhost:3000/station/A41

<img width="600" alt="image" src="https://user-images.githubusercontent.com/192620/180370487-e0600b5a-fe00-4f70-8d57-40b3be5380ab.png">

### Dual-station link
To merge two `N`/`S` platform codes into one panel, use `/dualstation/F22N/A41N`.
This is equivalent to a station grouping URL of `/stations/F22N|A41N`, just without any flexbox margins/centering.

http://localhost:3000/dualstation/F22N/A41N

<img width="600" alt="image" src="https://user-images.githubusercontent.com/192620/180371516-a0b82394-540a-4de3-bdb3-b66b6e3c8bce.png">


### Station Grouping Link
Link to `/stations/<grouping>` to specify a custom station grouping.

http://localhost:3000/stations/A41,A40S%7CA41N,A40;A41N,A41S,A40N,A40S

<img width="600" alt="image" src="https://user-images.githubusercontent.com/192620/180370849-57b93a49-cabc-4869-abef-3c4f0ec4527b.png">


## Custom Parameters
You can specify via GET arguments:

* showMergedStationView: for a non-`N`/`S` station code, defaults to showing `<code>N|<code>S` in the same pane when just the base station `<code>` is provided inside a grouping.
* showLastUpdated: allows disabling the last updated timestamp
* minTimeMinutes: hides trains which have ETAs shorter than this number of minutes for each station
* maxTimeMinutes: hides trains which have ETAs longer than this number of minutes for each station
* maxCount: hides more than the given number of ETAs for each station
* showTime: show the estimated arrival clock time next to the relative time estimation
* showAlerts: show station alerts underneath arrival times
* condensedAlerts: only show the title of each alert and not the full contents
* shortUnits: show shorter unit texts (e.g. "mins" not "minutes")




