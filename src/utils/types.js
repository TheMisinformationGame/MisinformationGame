
/**
 * Returns the name of the type {@param type}.
 */
export function typeToString(type) {
    if (type instanceof Array) {
        if (type.length === 0)
            return "[No types specified]";

        let types = "[";
        for (let index = 0; index < type.length; ++index) {
            if (index !== 0) {
                types += " or ";
            }
            types += typeToString(type[index]);
        }
        types += "]";
        return types;
    }
    return isOfType(type, "string") ? type : type.name;
}

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
 * @param valueName is the optional name to use to refer to the value in the error message.
 */
export function doNonNullCheck(value, valueName) {
    valueName = valueName || "Value";
    if (value === null)
        throw Error(valueName + " should not be null")
    if (value === undefined)
        throw Error(valueName + " is missing")
}

/**
 * Throws an error if {@param value} if not of a type matching {@param expectedType}.
 *
 * If {@param expectedType} is not an Array, then it will check that {@param value}
 * is an instance of that type. If {@param expectedType} is an Array, then it will
 * check if {@param value} is an instance of any of the given types.
 *
 * @param valueName is the optional name to use to refer to the value in the error message.
 */
export function doTypeCheck(value, expectedType, valueName) {
    doNonNullCheck(value, valueName);
    if (!isOfType(value, expectedType)) {
        valueName = valueName || "Value";
        throw new Error(
            valueName + " should be of type " + typeToString(expectedType) +
            ", but it had type " + typeToString(value.constructor)
        );
    }
}

/**
 * Throws an error if {@param value} if its not null, and not of a type matching
 * {@param expectedType}.
 *
 * If {@param expectedType} is not an Array, then it will check that {@param value}
 * is an instance of that type. If {@param expectedType} is an Array, then it will
 * check if {@param value} is an instance of any of the given types.
 *
 * @param valueName is the optional name to use to refer to the value in the error message.
 */
export function doNullableTypeCheck(value, expectedType, valueName) {
    if (value === null || value === undefined)
        return;
    doTypeCheck(value, expectedType, valueName);
}
