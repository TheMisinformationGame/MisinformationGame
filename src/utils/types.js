/**
 * Returns whether {@param value} has a type matching {@param expectedType}.
 *
 * If {@param expectedType} is not an Array, then it will check that {@param value}
 * is an instance of that type. If {@param expectedType} is an Array, then it will
 * check if {@param value} is an instance of any of the given types.
 */
export function isOfType(value, expectedType) {
    if (expectedType instanceof Array) {
        for (let key in expectedType) {
            if (!expectedType.hasOwnProperty(key))
                continue;
            if (isOfType(value, expectedType[key]))
                return true;
        }
        return false;
    }
    if (typeof expectedType === "string")
        return typeof value === expectedType;
    return value instanceof expectedType;
}

/**
 * Throws an error if {@param value} is null or undefined.
 */
export function doNonNullCheck(value) {
    if (value === null || value === undefined) {
        throw Error("Expected value to be non-null")
    }
}

/**
 * Throws an error if {@param value} if not of a type matching {@param expectedType}.
 *
 * If {@param expectedType} is not an Array, then it will check that {@param value}
 * is an instance of that type. If {@param expectedType} is an Array, then it will
 * check if {@param value} is an instance of any of the given types.
 */
export function doTypeCheck(value, expectedType) {
    doNonNullCheck(value);
    if (!isOfType(value, expectedType)) {
        throw Error("Expected " + JSON.stringify(value) + " to match type " + expectedType);
    }
}
