import {doTypeCheck} from "../utils/types";
import {LinearFunction} from "./math";


/**
 * Represents a method of selecting source and post pairs.
 */
export class SourcePostSelectionMethod {
    type; // String

    constructor(type) {
        doTypeCheck(type, "string");
        this.type = type;
    }

    toJSON() {
        return {
            "type": this.type
        };
    }

    static fromJSON(json) {
        const type = json["type"];
        if (type === "Overall-Ratio")
            return OverallRatioSelectionMethod.fromJSON(json);
        if (type === "Source-Ratios")
            return SourceRatioSelectionMethod.fromJSON(json);
        if (type === "Credibility")
            return CredibilitySelectionMethod.fromJSON(json);
        if (type === "Pre-Defined")
            return PredefinedSelectionMethod.fromJSON(json);
        throw new Error("Unknown SourcePostSelectionMethod type: " + type);
    }
}

/**
 * A method of selecting source and post pairs that only considers
 * trying to match an overall percentage of true posts shown to
 * participants.
 */
export class OverallRatioSelectionMethod extends SourcePostSelectionMethod {
    truePostPercentage; // Number

    constructor(truePostPercentage) {
        super("Overall-Ratio");
        doTypeCheck(truePostPercentage, "number");
        this.truePostPercentage = truePostPercentage;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }

    static fromJSON(json) {
        return new OverallRatioSelectionMethod(
            json["truePostPercentage"]
        );
    }
}

/**
 * A method of selecting source and post pairs that randomly selects
 * a source, and then chooses a true or false post based upon the
 * a true post percentage set for each source.
 */
export class SourceRatioSelectionMethod extends SourcePostSelectionMethod {
    constructor() {
        super("Source-Ratios");
    }

    toJSON() {
        return super.toJSON();
    }

    static fromJSON(json) {
        return new SourceRatioSelectionMethod();
    }
}

/**
 * A method of selecting source and post pairs that randomly selects
 * a source, and then chooses a true or false post based upon the
 * credibility of the source.
 */
export class CredibilitySelectionMethod extends SourcePostSelectionMethod {
    linearRelationship; // LinearFunction

    constructor(linearRelationship) {
        super("Credibility");
        doTypeCheck(linearRelationship, LinearFunction);
        this.linearRelationship = linearRelationship;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "linearRelationship": this.linearRelationship.toJSON()
        };
    }

    static fromJSON(json) {
        return new CredibilitySelectionMethod(
            LinearFunction.fromJSON(json["linearRelationship"])
        );
    }
}

/**
 * A method of selecting source and post pairs where the order of sources
 * and posts is pre-defined and repeated the same for every participant.
 */
export class PredefinedSelectionMethod extends SourcePostSelectionMethod {
    order; // [Source ID, Post ID][]

    constructor(order) {
        super("Pre-Defined");
        doTypeCheck(order, Array);
        this.order = order;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "order": this.order
        };
    }

    static fromJSON(json) {
        return new PredefinedSelectionMethod(
            json["order"]
        );
    }
}
