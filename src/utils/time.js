
/**
 * Returns the number of seconds since the UNIX epoch time.
 */
export function getUnixEpochTimeSeconds() {
    return Math.round(new Date().getTime() / 1000);
}

/**
 * Returns a new Date object representing the date with
 * a UNIX epoch time of {@param unixEpochTimeSeconds}.
 */
export function createDateFromUnixEpochTimeSeconds(unixEpochTimeSeconds) {
    return new Date(unixEpochTimeSeconds * 1000);
}

/**
 * Returns {@param date} formatted using the en-GB locale, and the UTC time zone.
 */
export function formatUTCDate(date) {
    return date.toLocaleString("en-GB", {timeZone: "UTC"});
}


/**
 * Returns a timestamp in milliseconds that can be used to
 * accurately measure durations between events.
 */
export const getPerformanceTime = (
    (window.performance.now && (() => window.performance.now())) ||
    (window.performance.webkitNow && (() => window.performance.webkitNow())) ||
    (() => new Date().getTime())
);
