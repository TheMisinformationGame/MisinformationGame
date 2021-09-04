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

    toJSON() {
        throw new Error(
            "I don't know the best way to store this in JSON... base64 maybe? " +
            "Although, that said, storing them in Firebase Storage may be the " +
            "the best solution (it would just be more complicated...)"
        );
    }
}

/**
 * A source that is missing some information, but at least
 * contains enough info to perform the source/post selection.
 */
export class BaseSource {
    id; // String
    name; // String
    maxPosts; // Number
    followers; // TruncatedNormalDistribution
    credibility; // TruncatedNormalDistribution
    truePostPercentage; // null or Number

    constructor(id, name, maxPosts, followers, credibility, truePostPercentage) {
        doTypeCheck(id, "string");
        doTypeCheck(name, "string");
        doTypeCheck(maxPosts, "number");
        doTypeCheck(followers, TruncatedNormalDistribution);
        doTypeCheck(credibility, TruncatedNormalDistribution);
        if (truePostPercentage !== null) {
            doTypeCheck(truePostPercentage, "number");
        }

        this.id = id;
        this.name = name;
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
        this.truePostPercentage = truePostPercentage;
    }

    toBaseSource() {
        return this;
    }

    isFullSource() {
        return false;
    }

    toJSON() {
        return {
            "id": this.id,
            "name": this.name,
            "followers": this.followers.toJSON(),
            "credibility": this.credibility.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }
}

/**
 * A source that can be used for posts or comments.
 */
export class Source extends BaseSource {
    avatar; // Avatar

    constructor(id, name, avatar, maxPosts, followers, credibility, truePostPercentage) {
        super(id, name, maxPosts, followers, credibility, truePostPercentage);
        doTypeCheck(avatar, StudyImage);
        this.avatar = avatar;
    }

    toBaseSource() {
        return new BaseSource(
            this.id, this.name, this.maxPosts,
            this.followers, this.credibility,
            this.truePostPercentage
        );
    }

    isFullSource() {
        return true;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "avatar": this.avatar.toJSON()
        };
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

    toJSON() {
        return {
            "sourceID": this.sourceID,
            "message": this.message,
            "likes": this.likes
        };
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

    toJSON() {
        return {
            "like": this.like,
            "dislike": this.dislike,
            "share": this.share,
            "flag": this.flag
        };
    }
}

/**
 * A post that is missing some information, but at least
 * contains enough info to perform the source/post selection.
 */
export class BasePost {
    id; // String -> [DL] Consider switching to number type
    headline; // String
    isTrue; // Boolean
    changesToFollowers; // ReactionValues
    changesToCredibility; // ReactionValues
    comments; // PostComment[]

    constructor(id, headline, isTrue, changesToFollowers, changesToCredibility, comments) {
        doTypeCheck(id, "number");
        doTypeCheck(headline, "string");
        doTypeCheck(isTrue, "boolean");
        doTypeCheck(changesToFollowers, ReactionValues);
        doTypeCheck(changesToCredibility, ReactionValues);
        doTypeCheck(comments, Array);
        this.id = id;
        this.headline = headline;
        this.isTrue = isTrue;
        this.changesToFollowers = changesToFollowers;
        this.changesToCredibility = changesToCredibility;
        this.comments = comments;
    }

    toBasePost() {
        return this;
    }

    isFullPost() {
        return false;
    }

    toJSON() {
        const commentsJSON = [];
        for (let index = 0; index < this.comments.length; ++index) {
            commentsJSON.push(this.comments[index].toJSON())
        }
        return {
            "id": this.id,
            "headline": this.headline,
            "isTrue": this.isTrue,
            "changesToFollowers": this.changesToFollowers.toJSON(),
            "changesToCredibility": this.changesToCredibility.toJSON(),
            "comments": commentsJSON
        };
    }
}

/**
 * Holds the contents of a post.
 */
export class Post extends BasePost {
    content; // StudyImage or String

    constructor(id, headline, content, isTrue, changesToFollowers, changesToCredibility, comments) {
        super(id, headline, isTrue, changesToFollowers, changesToCredibility, comments);
        doTypeCheck(content, [StudyImage, "string"]);
        this.content = content;
    }

    toBasePost() {
        return new BasePost(this.id, this.headline, this.isTrue);
    }

    isFullPost() {
        return true;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "content": this.content.toJSON()
        };
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

    /**
     * Returns all the stripped-down sources for
     * use in source/post selection.
     * This list will always be available.
     */
    getBaseSources() {
        const base = [];
        for (let index = 0; index < this.sources.length; ++index) {
            base.push(this.sources[index].toBaseSource());
        }
        return base;
    }

    /**
     * Returns all the stripped-down posts
     * for use in source/post selection.
     * This list will always be available.
     */
    getBasePosts() {
        const base = [];
        for (let index = 0; index < this.posts.length; ++index) {
            base.push(this.posts[index].toBasePost());
        }
        return base;
    }

    /**
     * This does _not_ include the full source and post
     * information, just the base information.
     */
    toJSON() {
        const sources = this.getBaseSources();
        const sourceJSONs = [];
        for (let index = 0; index < sources.length; ++index) {
            sourceJSONs.push(sources[index].toJSON());
        }
        const posts = this.getBasePosts();
        const postJSONs = [];
        for (let index = 0; index < posts.length; ++index) {
            postJSONs.push(posts[index].toJSON());
        }
        return {
            "name": this.name,
            "description": this.description,
            "introduction": this.introduction,
            "prompt": this.prompt,
            "length": this.length,
            "debrief": this.debrief,
            "genCompletionCode": this.genCompletionCode,
            "maxCompletionCode": this.maxCompletionCode,
            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": sourceJSONs,
            "posts": postJSONs
        }
    }
}
