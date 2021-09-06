
/**
 * Samples a random number from a uniform distribution
 * over the range (0, 1).
 */
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
