/**
 * Samples a random number from a uniform distribution
 * over the range (0, 1).
 */
import {doTypeCheck} from "./types";

function randUniform01Exclusive() {
    let value;
    do {
        value = Math.random();
    } while (value === 0);
    return value;
}

/**
 * Returns a random sample from a gaussian distribution
 * with mean 0 and standard deviation 1.
 *
 * Internally this uses the Box-Muller transform to convert
 * two uniformly random variables to a normally distributed
 * random variable.
 */
export function randNormal() {
    const u = randUniform01Exclusive();
    const v = randUniform01Exclusive();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

/**
 * Generates a string containing {@param digits} integer
 * digits to generate an N-digit integer. The first digit
 * will be a random number from 1-9, and the remaining
 * digits will be random digits from 0-9.
 */
export function randDigits(digits) {
    if (digits < 1)
        throw new Error("Digits must be positive, not " + digits);

    // First digit can be from 1-9.
    let num = "" + Math.floor((Math.random()*9)+1);
    // The remaining digits can be from 0-9.
    for (let digit = 2; digit <= digits; ++digit) {
        num += Math.floor((Math.random()*10));
    }
    return num;
}

/**
 * @return a random element from the items array.
 */
export function randElement(items) {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Returns a random element of {@param array}, with elements
 * filtered by {@param filterFn}. If there are any elements that
 * are preferred by {@param preferenceFn}, they will be selected
 * before any others.
 *
 * @param filterFn (element) => Whether to include the element.
 * @param preferenceFn (element) => Whether the element is preferred for selection.
 */
export function selectFilteredRandomElement(array, filterFn, preferenceFn) {
    return selectFilteredWeightedRandomElement(array, filterFn, preferenceFn, () => 1);
}

/**
 * Returns a random element of {@param array}, with elements filtered
 * by {@param filterFn}, and weighted by {@param weightFn}. If there are
 * any elements that are preferred by {@param preferenceFn}, they will be
 * selected before any others.
 *
 * @param filterFn (element) => Whether to include the element.
 * @param preferenceFn (element) => Whether the element is preferred for selection.
 * @param weightFn (element) => Weighting number.
 *                 If the weighting number is zero, then it will
 *                 be weighted by the mean of all the other weights.
 */
export function selectFilteredWeightedRandomElement(array, filterFn, preferenceFn, weightFn) {
    doTypeCheck(array, Array, "Array of Elements");
    if (array.length === 0)
        throw new Error("Array cannot be empty");

    // Filter out elements, and find all the preferred elements.
    const preferred = [];
    const filtered = [];
    for (let index = 0; index < array.length; ++index) {
        const elem = array[index];
        if (!filterFn(elem))
            continue;

        filtered.push(elem);
        if (preferenceFn(elem)) {
            preferred.push(elem);
        }
    }
    if (filtered.length === 0)
        throw new Error("No elements remaining after filter");

    // If there are preferred elements, use those.
    const collection = (preferred.length > 0 ? preferred : filtered);

    // Filter out elements and compute the weight of the remaining elements.
    const weights = [];
    let weightSum = 0;
    let nonZeroWeights = 0;
    for (let index = 0; index < collection.length; ++index) {
        const elem = collection[index];
        const weight = weightFn(elem);
        doTypeCheck(weight, "number", "Calculated Weight for " + JSON.stringify(elem));
        if (weight < 0)
            throw new Error("Weights cannot be negative: weightFn returned " + weight);

        weights.push(weight);
        weightSum += weight;
        if (weight !== 0) {
            nonZeroWeights += 1;
        }
    }

    // Replace weights that are zero by the mean weight.
    const weightMean = (nonZeroWeights <= 0 ? 1 : weightSum / nonZeroWeights);
    for (let index = 0; index < collection.length; ++index) {
        const weight = weights[index];
        if (weight === 0) {
            weights[index] = weightMean;
            weightSum += weightMean;
        }
    }

    // Select the random element!
    const weightedSelection = Math.random() * weightSum;
    let cumulativeWeight = 0;
    for (let index = 0; index < collection.length; ++index) {
        cumulativeWeight += weights[index];
        if (weightedSelection <= cumulativeWeight)
            return collection[index];
    }
    throw new Error("Weighted selection failed unexpectedly");
}
