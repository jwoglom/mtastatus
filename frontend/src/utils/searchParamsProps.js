export default function buildSearchParamsProps(q) {
    let ret = {};

    if (q.get('showMergedStationView')) {
        ret['showMergedStationView'] = q.get('showMergedStationView') !== 'false';
    }

    let stationInfoProps = {};
    if (q.get('showLastUpdated')) {
        stationInfoProps['showLastUpdated'] = q.get('showLastUpdated') !== 'false';
    }

    let p;
    for (let i in p=['minTimeMinutes', 'maxTimeMinutes', 'maxCount']) {
        if (q.get(p[i])) {
            stationInfoProps[p[i]] = parseInt(q.get(p[i]));
        }
    }

    if (Object.keys(stationInfoProps).length > 0) {
        ret['stationInfoProps'] = stationInfoProps;
    }

    return ret;
}