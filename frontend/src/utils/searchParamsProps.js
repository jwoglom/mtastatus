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
        q.forEach((val, key) => {
            if (key.startsWith(p[i]+'[')) {
                let forCode = key.split('[')[1].split(']')[0];
                ret['stationInfoPropsPerStation'] = ret['stationInfoPropsPerStation'] || {};
                ret['stationInfoPropsPerStation'][forCode] = ret['stationInfoPropsPerStation'][forCode] || {};
                ret['stationInfoPropsPerStation'][forCode][p[i]] = parseInt(q.get(key));
            }
        })
    }

    if (Object.keys(stationInfoProps).length > 0) {
        ret['stationInfoProps'] = stationInfoProps;
    }

    return ret;
}