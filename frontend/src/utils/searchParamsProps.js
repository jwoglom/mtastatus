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
        function processCast(p) {
            if (type === 'int') {
                return parseInt(q.get(p));
            } else if (type === 'bool') {
                return q.get(p) !== 'false' && q.get(p) !== '0';
            } else if (type === 'list') {
                return (q.get(p) || '').split(',');
            } else {
                return q.get(p);
            }
        }
        if (q.get(p)) {
            stationInfoProps[p] = processCast(p);
        }
        q.forEach((val, key) => {
            if (key.startsWith(p+'[')) {
                let forCode = key.split('[')[1].split(']')[0];
                ret['stationInfoPropsPerStation'] = ret['stationInfoPropsPerStation'] || {};
                ret['stationInfoPropsPerStation'][forCode] = ret['stationInfoPropsPerStation'][forCode] || {};
                ret['stationInfoPropsPerStation'][forCode][p] = processCast(key);
            }
        })
    }

    process(q, 'minTimeMinutes', 'int');
    process(q, 'maxTimeMinutes', 'int');
    process(q, 'maxCount', 'int');
    process(q, 'showLastUpdated', 'bool');
    process(q, 'shortUnits', 'bool');
    process(q, 'showTime', 'bool');
    process(q, 'showAlerts', 'bool');
    process(q, 'condensedAlerts', 'bool');
    process(q, 'hideAlertIds', 'list');

    if (Object.keys(stationInfoProps).length > 0) {
        ret['stationInfoProps'] = stationInfoProps;
    }

    return ret;
}