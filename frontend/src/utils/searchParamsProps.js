export default function buildSearchParamsProps(q) {
    let ret = {};

    if (q.get('showMergedStationView')) {
        ret['showMergedStationView'] = q.get('showMergedStationView') !== 'false';
    }

    let stationInfoProps = {};
    if (q.get('showLastUpdated')) {
        stationInfoProps['showLastUpdated'] = q.get('showLastUpdated') !== 'false';
    }

    function process(q, p, type) {
        if (q.get(p)) {
            if (type == 'int') {
                stationInfoProps[p] = parseInt(q.get(p));
            } else if (type == 'bool') {
                stationInfoProps[p] = q.get(p) !== 'false';
            } else {
                stationInfoProps[p] = q.get(p);
            }
        }
        q.forEach((val, key) => {
            if (key.startsWith(p+'[')) {
                let forCode = key.split('[')[1].split(']')[0];
                ret['stationInfoPropsPerStation'] = ret['stationInfoPropsPerStation'] || {};
                ret['stationInfoPropsPerStation'][forCode] = ret['stationInfoPropsPerStation'][forCode] || {};
                ret['stationInfoPropsPerStation'][forCode][p] = parseInt(q.get(key));
            }
        })
    }

    process(q, 'minTimeMinutes', 'int');
    process(q, 'maxTimeMinutes', 'int');
    process(q, 'maxCount', 'int');
    process(q, 'showLastUpdated', 'bool');
    process(q, 'shortUnits', 'bool');
    process(q, 'showTime', 'bool');

    if (Object.keys(stationInfoProps).length > 0) {
        ret['stationInfoProps'] = stationInfoProps;
    }

    return ret;
}