import {compressJsonKeyMap} from "./compressJsonKeyMap";

const compressVersionKey = ":compressJson.version";
const compressDataKey = ":compressJson.data";
const compressDebug = false;

function buildReverseKeyMap(keyMap) {
    const reverseKeyMap = {};
    for (let key in keyMap) {
        if (!keyMap.hasOwnProperty(key))
            continue;

        const value = keyMap[key];
        if (reverseKeyMap.hasOwnProperty(value))
            throw new Error("Duplicate value " + value + " for keys " + key + ", " + reverseKeyMap[value]);

        reverseKeyMap[value] = key;
    }
    return reverseKeyMap;
}

function verifyReverseCompressKeyMap(keyMap) {
    const reverseKeyMap = buildReverseKeyMap(keyMap);
    if (Object.keys(keyMap).length !== Object.keys(reverseKeyMap).length)
        throw new Error("Reverse key-map has different number of elements than original key-map")
}

function mapKey(key, keyMap, unmappedKeys) {
    if (key.length === 0)
        return "";
    if (keyMap.hasOwnProperty(key))
        return keyMap[key];

    unmappedKeys.add(key);
    return "." + key;
}

function unmapKey(mappedKey, reverseKeyMap) {
    if (mappedKey.length === 0)
        return "";
    if (mappedKey[0] === ".")
        return mappedKey.substring(1);
    if (reverseKeyMap.hasOwnProperty(mappedKey))
        return reverseKeyMap[mappedKey];

    throw new Error("Unable to unmap key " + mappedKey);
}

/**
 * Compresses the given JSON object so that it can
 * be stored within less space in Firebase.
 */
export function compressJson(json, skipRootLevelKeys) {
    verifyReverseCompressKeyMap(compressJsonKeyMap);
    const result = {};
    result[compressVersionKey] = 1;
    if (skipRootLevelKeys) {
        for (let index = 0; index < skipRootLevelKeys.length; ++index) {
            const key = skipRootLevelKeys[index];
            if (!json.hasOwnProperty(key))
                throw new Error("JSON has no key " + key + " to skip");
            if (result.hasOwnProperty(key))
                throw new Error("Result object already contains key " + key);

            result[key] = json[key];
        }
    }

    const unmappedKeys = new Set();
    result[compressDataKey] = compressJsonPiece(json, compressJsonKeyMap, skipRootLevelKeys, unmappedKeys);
    if (unmappedKeys.size > 0 && compressDebug) {
        console.error("There are unmapped compression keys: " + Array.from(unmappedKeys))
    }
    return result;
}

function compressJsonPiece(jsonPiece, keyMap, skipRootLevelKeys, unmappedKeys) {
    if (jsonPiece === null)
        return null;
    if (jsonPiece === undefined)
        throw new Error("undefined values are not supported in JSON");

    if (Array.isArray(jsonPiece)) {
        const result = []
        for (let index = 0; index < jsonPiece.length; ++index) {
            const value = jsonPiece[index];
            result.push(compressJsonPiece(value, keyMap, null, unmappedKeys));
        }
        return result;
    }
    if (jsonPiece.constructor !== Object)
        return jsonPiece;

    const result = {};
    for (let key in jsonPiece) {
        if (!jsonPiece.hasOwnProperty(key))
            continue;
        if (skipRootLevelKeys && skipRootLevelKeys.includes(key))
            continue;

        const mappedKey = mapKey(key, keyMap, unmappedKeys);
        if (result.hasOwnProperty(mappedKey))
            throw new Error("Mapped key already exists in output object: " + mappedKey);

        const value = jsonPiece[key];
        result[mappedKey] = compressJsonPiece(value, keyMap, null, unmappedKeys);
    }
    return result;
}

/**
 * Decompresses the given JSON object that was
 * compressed using compressJson.
 */
export function decompressJson(json) {
    // Wasn't compressed.
    if (!json.hasOwnProperty(compressVersionKey) || !json.hasOwnProperty(compressDataKey))
        return json;

    const reverseKeyMap = buildReverseKeyMap(compressJsonKeyMap);
    const compressionVersion = json[compressVersionKey];
    const compressionData = json[compressDataKey];

    let result;
    if (compressionVersion === 1) {
        result = decompressJsonVersion1(compressionData, reverseKeyMap);
    } else {
        throw new Error("Unknown compression version " + compressionVersion);
    }

    // Collect values that weren't compressed.
    for (let key in json) {
        if (!json.hasOwnProperty(key))
            continue;
        if (key === compressVersionKey || key === compressDataKey)
            continue;

        result[key] = json[key];
    }
    return result;
}

function decompressJsonVersion1(jsonPiece, reverseKeyMap) {
    if (jsonPiece === null)
        return null;
    if (jsonPiece === undefined)
        throw new Error("undefined values are not supported in JSON");

    if (Array.isArray(jsonPiece)) {
        const result = []
        for (let index = 0; index < jsonPiece.length; ++index) {
            const value = jsonPiece[index];
            result.push(decompressJsonVersion1(value, reverseKeyMap));
        }
        return result;
    }
    if (jsonPiece.constructor !== Object)
        return jsonPiece;

    const result = {};
    for (let key in jsonPiece) {
        if (!jsonPiece.hasOwnProperty(key))
            continue;

        const unmappedKey = unmapKey(key, reverseKeyMap);
        result[unmappedKey] = decompressJsonVersion1(jsonPiece[key], reverseKeyMap);
    }
    return result;
}
