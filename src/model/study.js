import {doTypeCheck} from "../utils/types";
import {SourcePostSelectionMethod} from "./selectionMethod";
import {TruncatedNormalDistribution} from "./math";
import {StudyImage} from "./images";
import {randDigits} from "../utils/random";
import {odiff} from "../utils/odiff";


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
            "maxPosts": this.maxPosts,
            "followers": this.followers.toJSON(),
            "credibility": this.credibility.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }

    static fromJSON(json) {
        return new BaseSource(
            json["id"], json["name"], json["maxPosts"],
            TruncatedNormalDistribution.fromJSON(json["followers"]),
            TruncatedNormalDistribution.fromJSON(json["credibility"]),
            json["truePostPercentage"]
        );
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

    static fromJSON(json) {
        const baseSource = BaseSource.fromJSON(json);
        return new Source(
            baseSource.id, baseSource.name,
            StudyImage.fromJSON(json["avatar"]),
            baseSource.maxPosts, baseSource.followers,
            baseSource.credibility, baseSource.truePostPercentage
        );
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

    static fromJSON(json) {
        return new PostComment(
            json["sourceID"], json["message"], json["likes"]
        );
    }
}

/**
 * Holds a number for every possible reaction to a post.
 */
export class ReactionValues {
    like; // TruncatedNormalDistribution
    dislike; // TruncatedNormalDistribution
    share; // TruncatedNormalDistribution
    flag; // TruncatedNormalDistribution

    constructor(like, dislike, share, flag) {
        doTypeCheck(like, TruncatedNormalDistribution);
        doTypeCheck(dislike, TruncatedNormalDistribution);
        doTypeCheck(share, TruncatedNormalDistribution);
        doTypeCheck(flag, TruncatedNormalDistribution);
        this.like = like;
        this.dislike = dislike;
        this.share = share;
        this.flag = flag;
    }

    toJSON() {
        return {
            "like": this.like.toJSON(),
            "dislike": this.dislike.toJSON(),
            "share": this.share.toJSON(),
            "flag": this.flag.toJSON()
        };
    }

    static fromJSON(json) {
        return new ReactionValues(
            TruncatedNormalDistribution.fromJSON(json["like"]),
            TruncatedNormalDistribution.fromJSON(json["dislike"]),
            TruncatedNormalDistribution.fromJSON(json["share"]),
            TruncatedNormalDistribution.fromJSON(json["flag"])
        );
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
        doTypeCheck(id, "string");
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

    static commentsToJSON(comments) {
        const commentsJSON = [];
        for (let index = 0; index < comments.length; ++index) {
            commentsJSON.push(comments[index].toJSON())
        }
        return commentsJSON;
    }

    static commentsFromJSON(json) {
        const comments = [];
        for (let index = 0; index < json.length; ++index) {
            comments.push(PostComment.fromJSON(json[index]));
        }
        return comments;
    }

    toJSON() {
        return {
            "id": this.id,
            "headline": this.headline,
            "isTrue": this.isTrue,
            "changesToFollowers": this.changesToFollowers.toJSON(),
            "changesToCredibility": this.changesToCredibility.toJSON(),
            "comments": BasePost.commentsToJSON(this.comments)
        };
    }

    static fromJSON(json) {
        return new BasePost(
            json["id"], json["headline"], json["isTrue"],
            ReactionValues.fromJSON(json["changesToFollowers"]),
            ReactionValues.fromJSON(json["changesToCredibility"]),
            BasePost.commentsFromJSON(json["comments"])
        );
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
        return new BasePost(
            this.id, this.headline, this.isTrue,
            this.changesToFollowers,
            this.changesToCredibility,
            this.comments
        );
    }

    isFullPost() {
        return true;
    }

    static contentToJSON(content) {
        if (typeof content === "string")
            return content;
        return content.toJSON();
    }

    static contentFromJSON(json) {
        if (typeof json === "string")
            return json;
        return StudyImage.fromJSON(json);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            "content": Post.contentToJSON(this.content)
        };
    }

    static fromJSON(json) {
        const basePost = BasePost.fromJSON(json);
        return new Post(
            basePost.id, basePost.headline,
            Post.contentFromJSON(json["content"]),
            basePost.isTrue, basePost.changesToFollowers,
            basePost.changesToCredibility, basePost.comments
        );
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
    completionCodeDigits; // Number
    sourcePostSelectionMethod; // SourcePostSelectionMethod
    sources; // Source[]
    posts; // Post[]

    constructor(
            name, description, introduction,
            prompt, length, debrief,
            genCompletionCode, completionCodeDigits,
            sourcePostSelectionMethod,
            sources, posts) {

        doTypeCheck(name, "string");
        doTypeCheck(description, "string");
        doTypeCheck(introduction, "string");
        doTypeCheck(prompt, "string");
        doTypeCheck(length, "number");
        doTypeCheck(debrief, "string");
        doTypeCheck(genCompletionCode, "boolean");
        doTypeCheck(completionCodeDigits, "number");
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
        this.completionCodeDigits = completionCodeDigits;
        this.sourcePostSelectionMethod = sourcePostSelectionMethod;
        this.sources = sources;
        this.posts = posts;
    }

    /**
     * Once a full source is loaded, this method can be
     * used to replace the old BaseSource.
     */
    replaceSource(source) {
        for (let index = 0; index < this.sources.length; ++index) {
            const existing = this.sources[index];
            if (existing.id === source.id) {
                this.sources[index] = source;
                return;
            }
        }
        throw new Error("Could not find source with ID " + source.id);
    }

    /**
     * Once a full post is loaded, this method can be
     * used to replace the old BasePost.
     */
    replacePost(post) {
        for (let index = 0; index < this.posts.length; ++index) {
            const existing = this.posts[index];
            if (existing.id === post.id) {
                this.posts[index] = post;
                return;
            }
        }
        throw new Error("Could not find post with ID " + post.id);
    }

    /**
     * Generates a random completion code string for this study.
     */
    generateRandomCompletionCode() {
        return randDigits(this.completionCodeDigits);
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

    static sourcesToJSON(sources) {
        const sourcesJSON = [];
        for (let index = 0; index < sources.length; ++index) {
            doTypeCheck(sources[index], BaseSource);
            sourcesJSON.push(sources[index].toJSON());
        }
        return sourcesJSON;
    }

    static sourcesFromJSON(json) {
        const sources = [];
        for (let index = 0; index < json.length; ++index) {
            sources.push(BaseSource.fromJSON(json[index]));
        }
        return sources;
    }

    static postsToJSON(posts) {
        const postsJSON = [];
        for (let index = 0; index < posts.length; ++index) {
            doTypeCheck(posts[index], BasePost);
            postsJSON.push(posts[index].toJSON());
        }
        return postsJSON;
    }

    static postsFromJSON(json) {
        const posts = [];
        for (let index = 0; index < json.length; ++index) {
            posts.push(BasePost.fromJSON(json[index]));
        }
        return posts;
    }

    /**
     * This does _not_ include the full source and post
     * information, just the base information.
     */
    toJSON() {
        return {
            "name": this.name,
            "description": this.description,
            "introduction": this.introduction,
            "prompt": this.prompt,
            "length": this.length,
            "debrief": this.debrief,
            "genCompletionCode": this.genCompletionCode,
            "completionCodeDigits": this.completionCodeDigits,
            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": Study.sourcesToJSON(this.getBaseSources()),
            "posts": Study.postsToJSON(this.getBasePosts())
        }
    }

    static fromJSON(json) {
        return new Study(
            json["name"], json["description"],
            json["introduction"], json["prompt"],
            json["length"], json["debrief"],
            json["genCompletionCode"],
            json["completionCodeDigits"],
            SourcePostSelectionMethod.fromJSON(json["sourcePostSelectionMethod"]),
            Study.sourcesFromJSON(json["sources"]),
            Study.postsFromJSON(json["posts"])
        );
    }
}

/**
 * Converts {@param study} to JSON and back, and
 * returns an array with all of the changes between
 * the original study and the reconstructed one.
 * This should return an empty array if everything
 * is working correctly.
 */
export function getChangesToAndFromJSON(study) {
    // Convert the study to JSON.
    const json = study.toJSON();
    const sourcesJSON = [];
    const postsJSON = [];
    for (let index = 0; index < study.sources.length; ++index) {
        sourcesJSON.push(study.sources[index].toJSON());
    }
    for (let index = 0; index < study.posts.length; ++index) {
        postsJSON.push(study.posts[index].toJSON());
    }

    // Reconstruct the study from the JSON.
    const reconstructedStudy = Study.fromJSON(json);
    for (let index = 0; index < sourcesJSON.length; ++index) {
        reconstructedStudy.replaceSource(Source.fromJSON(sourcesJSON[index]));
    }
    for (let index = 0; index < postsJSON.length; ++index) {
        reconstructedStudy.replacePost(Post.fromJSON(postsJSON[index]));
    }

    // Return the deep differences between them.
    return odiff(study, reconstructedStudy);
}
