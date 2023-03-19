/**
 * Rounds the given value in the direction given.
 * - If direction is positive, the value will be rounded up.
 * - If direction is negative, the value will be rounded down.
 * - If direction is zero, the value will be rounded to the
 *   closest integer.
 */
export function roundInDir(value, direction) {
    if (direction < 0)
        return Math.floor(value);
    if (direction > 0)
        return Math.ceil(value);
    return Math.round(value);
}
