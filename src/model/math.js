import {doTypeCheck} from "../utils/types";
import {randNormal} from "../utils/random";


/**
 * A linear function y = mx + c.
 */
export class LinearFunction {
    slope; // Number
    intercept; // Number

    constructor(slope, intercept) {
        doTypeCheck(slope, "number", "Linear Function's Slope");
        doTypeCheck(intercept, "number", "Linear Function's Intercept");

        this.slope = slope;
        this.intercept = intercept;
    }

    get(x) {
        return x * this.slope + this.intercept;
    }

    toJSON() {
        return {
            "slope": this.slope,
            "intercept": this.intercept
        };
    }

    static fromJSON(json) {
        return new LinearFunction(
            json["slope"], json["intercept"]
        );
    }
}

/**
 * Represents a gaussian distribution that is truncated
 * so that no values are generated outside of the range
 * [min, max].
 */
export class TruncatedNormalDistribution {
    mean; // Number
    stdDeviation; // Number
    min; // Number
    max; // Number

    constructor(mean, stdDeviation, min, max) {
        doTypeCheck(mean, "number", "Truncated Normal Distribution's Mean");
        doTypeCheck(stdDeviation, "number", "Truncated Normal Distribution's Std. Deviation");
        doTypeCheck(min, "number", "Truncated Normal Distribution's Minimum Value");
        doTypeCheck(max, "number", "Truncated Normal Distribution's Maximum Value");

        this.mean = mean;
        this.stdDeviation = stdDeviation;
        this.min = min;
        this.max = max;
    }

    /**
     * Randomly samples this distribution.
     */
    sample() {
        if (this.stdDeviation <= 0)
            return Math.max(this.min, Math.min(this.mean, this.max));

        let value;
        let iterations = 0;
        do {
            if (iterations++ >= 100) {
                throw new Error(
                    "Unable to sample value for TruncatedNormalDistribution " +
                    JSON.stringify(this.toJSON())
                );
            }

            value = this.mean + randNormal() * this.stdDeviation;
        } while (value < this.min || value > this.max);
        return value;
    }

    toJSON() {
        return {
            "mean": this.mean,
            "stdDeviation": this.stdDeviation,
            "min": this.min,
            "max": this.max
        };
    }

    static fromJSON(json) {
        return new TruncatedNormalDistribution(
            json["mean"], json["stdDeviation"],
            json["min"], json["max"]
        );
    }

    static exactly(value) {
        return new TruncatedNormalDistribution(value, 0, value, value);
    }

    static zero() {
        return TruncatedNormalDistribution.exactly(0);
    }
}
