import {doTypeCheck} from "../utils/types";
import {randNormal} from "../utils/normalDistribution";


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
        doTypeCheck(mean, "number");
        doTypeCheck(stdDeviation, "number");
        doTypeCheck(min, "number");
        doTypeCheck(max, "number");

        this.mean = mean;
        this.stdDeviation = stdDeviation;
        this.min = min;
        this.max = max;
    }

    /**
     * Randomly samples this distribution.
     */
    sample() {
        let value;
        do {
            value = this.mean + randNormal() * this.stdDeviation;
        } while (value < this.min || value > this.max);
        return value;
    }
}

export class StudyImage {
    buffer; // Uint8Array
    type; // String

    constructor(buffer, type) {
        doTypeCheck(buffer, Uint8Array);
        doTypeCheck(type, "string");

        this.buffer = buffer;
        this.type = type;
    }

    createImage() {
        const image = new Image();
        image.src = URL.createObjectURL(
            new Blob([this.buffer.buffer], { type: this.type })
        );
        return image;
    }

    static fromExcelImage(excelImage) {
        return new StudyImage(excelImage.buffer, "image/" + excelImage.extension);
    }
}

export class Source {
    id; // String
    name; // String
    avatar; // Avatar
    maxPosts; // Number
    followers; // TruncatedNormalDistribution
    credibility; // TruncatedNormalDistribution

    constructor(id, name, avatar, maxPosts, followers, credibility) {
        doTypeCheck(id, "string");
        doTypeCheck(name, "string");
        doTypeCheck(avatar, StudyImage);
        doTypeCheck(maxPosts, "number");
        doTypeCheck(followers, TruncatedNormalDistribution);
        doTypeCheck(credibility, TruncatedNormalDistribution);

        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
    }
}

export class Study {
    name; // String
    description; // String
    introduction; // String
    prompt; // String
    length; // Number
    debrief; // String
    genCompletionCode; // Boolean
    maxCompletionCode; // Number
    sources; // Source[]

    constructor(name, description, introduction, prompt, length, debrief,
                genCompletionCode, maxCompletionCode) {

        doTypeCheck(name, "string");
        doTypeCheck(description, "string");
        doTypeCheck(introduction, "string");
        doTypeCheck(prompt, "string");
        doTypeCheck(length, "number");
        doTypeCheck(debrief, "string");
        doTypeCheck(genCompletionCode, "boolean");
        doTypeCheck(maxCompletionCode, "number");

        this.name = name;
        this.description = description;
        this.introduction = introduction;
        this.prompt = prompt;
        this.length = length;
        this.debrief = debrief;
        this.genCompletionCode = genCompletionCode;
        this.maxCompletionCode = maxCompletionCode;
        this.sources = [];
    }

    addSource(source) {
        doTypeCheck(source, Source);
        this.sources.push(source);
    }
}
