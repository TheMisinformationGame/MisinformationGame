import {doTypeCheck} from "../utils/types";
import {LinearFunction} from "./math";


/**
 * Represents a method of selecting source and post pairs.
 */
export class SourcePostSelectionMethod {
    name; // String

    constructor(name) {
        doTypeCheck(name, "string");
        this.name = name;
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
}
