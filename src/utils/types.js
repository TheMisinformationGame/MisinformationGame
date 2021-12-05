
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
 * Converts {@param index} to a string representing the place of the index in an array.
 * Index 0 becomes "1st".
 * Index 1 becomes "2nd".
 * Index 2 becomes "3rd".
 * etc...
 */
function indexToOrdinalString(index) {
    const number = index + 1;
    const lastDigit = number % 10;

    let suffix;
    if (lastDigit === 1 && number !== 11) {
        suffix = "st";
    } else if (lastDigit === 2 && number !== 12) {
        suffix = "nd";
    } else if (lastDigit === 3 && number !== 13) {
        suffix = "rd";
    } else {
        suffix = "th";
    }
    return number + suffix;
}

/**
 * Throws an error if {@param array} is not an Array, or contains elements
 * that are not of a type matching {@param expectedValueType}.
 *
 * If {@param expectedValueType} is not an Array, then it will check that the array values
 * are an instance of that type. If {@param expectedValueType} is an Array, then it will
 * check if the array values are instances of any of the given types.
 *
 * @param valueName is the optional name to use to refer to the array in the error message.
 */
export function doArrayTypeCheck(array, expectedValueType, valueName) {
    doTypeCheck(array, Array, valueName);

    for (let index = 0; index < array.length; ++index) {
        const value = array[index];
        doTypeCheck(value, expectedValueType, indexToOrdinalString(index) + " value in " + valueName)
    }
}

/**
 * Throws an error if {@param value} is not present in {@param expectedValuesArray}.
 *
 * @param valueName is the optional name to use to refer to the value in the error message.
 */
export function doEnumCheck(value, expectedValuesArray, valueName) {
    doNonNullCheck(value, valueName);
    doNonNullCheck(expectedValuesArray, "expectedValuesArray");
    if (!expectedValuesArray.includes(value)) {
        valueName = valueName || "Value";
        throw new Error(
            valueName + " should be one of [" + expectedValuesArray.join(", ") + "]" +
            ", but instead it was " + value
        );
    }
}

/**
 * Throws an error if {@param value} is not null, and not of a type matching
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

/**
 * Throws an error if {@param array} is not null and is not an Array, or contains
 * elements that are not of a type matching {@param expectedValueType}.
 *
 * If {@param expectedValueType} is not an Array, then it will check that the array values
 * are an instance of that type. If {@param expectedValueType} is an Array, then it will
 * check if the array values are instances of any of the given types.
 *
 * @param valueName is the optional name to use to refer to the array in the error message.
 */
export function doNullableArrayTypeCheck(array, expectedValueType, valueName) {
    if (array === null || array === undefined)
        return;
    doArrayTypeCheck(array, expectedValueType, valueName);
}
