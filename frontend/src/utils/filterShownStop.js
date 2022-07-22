
export function showStop(props, stop, i) {
    let time = new Date(stop["time"]);
    let minDiff = (time - new Date()) / 60000;

    if (!props.maxTimeMinutes) {
        return true;
    }

    if (minDiff > props.maxTimeMinutes) {
        return false;
    }

    if (props.minTimeMinutes !== undefined && minDiff < props.minTimeMinutes) {
        return false;
    }

    if (!props.maxCount) {
        return true;
    }

    if (i >= props.maxCount) {
        return false;
    }

    return true;
}

export function filterToShownStops(props, stops) {
    let count = 0;
    return stops.filter((stop) => {
        let ok = showStop.apply(this, [props, stop, count]);
        if (ok) {
            count++;
        }
        return ok;
    });
}