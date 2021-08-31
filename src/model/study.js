import {doTypeCheck} from "../utils/types";
import {SourcePostSelectionMethod} from "./selectionMethod";
import {TruncatedNormalDistribution} from "./math";


/**
 * Represents an image such as a post or an avatar.
 */
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

/**
 * A source that can be used for posts or comments.
 */
export class Source {
    id; // String
    name; // String
    avatar; // Avatar
    maxPosts; // Number
    followers; // TruncatedNormalDistribution
    credibility; // TruncatedNormalDistribution
    truePostPercentage; // null or Number

    constructor(id, name, avatar, maxPosts, followers, credibility, truePostPercentage) {
        doTypeCheck(id, "string");
        doTypeCheck(name, "string");
        doTypeCheck(avatar, StudyImage);
        doTypeCheck(maxPosts, "number");
        doTypeCheck(followers, TruncatedNormalDistribution);
        doTypeCheck(credibility, TruncatedNormalDistribution);
        if (truePostPercentage !== null) {
            doTypeCheck(truePostPercentage, "number");
        }

        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
        this.truePostPercentage = truePostPercentage;
    }
}

/**
 * A comment that a source made on a post.
 */
export class PostComment {
    sourceID; // String
    message; // String
    likes; // Number

    constructor(sourceID, message, likes) {
        doTypeCheck(sourceID, "string");
        doTypeCheck(message, "string");
        doTypeCheck(likes, "number");

        this.sourceID = sourceID;
        this.message = message;
        this.likes = likes;
    }
}

/**
 * Holds a number for every possible reaction to a post.
 */
export class ReactionValues {
    like; // Number
    dislike; // Number
    share; // Number
    flag; // Number

    constructor(like, dislike, share, flag) {
        doTypeCheck(like, "number");
        doTypeCheck(dislike, "number");
        doTypeCheck(share, "number");
        doTypeCheck(flag, "number");

        this.like = like;
        this.dislike = dislike;
        this.share = share;
        this.flag = flag;
    }
}

/**
 * Holds the contents of a post.
 */
export class Post {
    id; // String -> [DL] Consider switching to number type
    headline; // String
    content; // StudyImage or String
    isTrue; // Boolean
    changesToFollowers; // ReactionValues
    changesToCredibility; // ReactionValues
    comments; // PostComment[]

    constructor(id, headline, content, isTrue, changesToFollowers, changesToCredibility, comments) {
        doTypeCheck(id, "number");
        doTypeCheck(headline, "string");
        doTypeCheck(content, [StudyImage, "string"]);
        doTypeCheck(isTrue, "boolean");
        doTypeCheck(changesToFollowers, ReactionValues);
        doTypeCheck(changesToCredibility, ReactionValues);
        doTypeCheck(comments, Array);

        this.id = id;
        this.headline = headline;
        this.content = content;
        this.isTrue = isTrue;
        this.changesToFollowers = changesToFollowers;
        this.changesToCredibility = changesToCredibility;
    }
}

/**
 * Holds the entire specification of a study.
 */
export class Study {
    name; // String
    description; // String
    introduction; // String
    prompt; // String
    length; // Number
    debrief; // String
    genCompletionCode; // Boolean
    maxCompletionCode; // Number
    sourcePostSelectionMethod; // SourcePostSelectionMethod
    sources; // Source[]
    posts; // Post[]

    constructor(name, description, introduction,
                prompt, length, debrief,
                genCompletionCode, maxCompletionCode,
                sourcePostSelectionMethod,
                sources, posts) {

        doTypeCheck(name, "string");
        doTypeCheck(description, "string");
        doTypeCheck(introduction, "string");
        doTypeCheck(prompt, "string");
        doTypeCheck(length, "number");
        doTypeCheck(debrief, "string");
        doTypeCheck(genCompletionCode, "boolean");
        doTypeCheck(maxCompletionCode, "number");
        doTypeCheck(sourcePostSelectionMethod, SourcePostSelectionMethod);
        doTypeCheck(sources, Array);
        doTypeCheck(posts, Array);

        this.name = name;
        this.description = description;
        this.introduction = introduction;
        this.prompt = prompt;
        this.length = length;
        this.debrief = debrief;
        this.genCompletionCode = genCompletionCode;
        this.maxCompletionCode = maxCompletionCode;
        this.sourcePostSelectionMethod = sourcePostSelectionMethod;
        this.sources = sources;
        this.posts = posts;
    }
}
