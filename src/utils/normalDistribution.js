
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
