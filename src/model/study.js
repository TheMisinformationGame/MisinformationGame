import {doNonNullCheck, doNullableTypeCheck, doTypeCheck, isOfType} from "../utils/types";
import {SourcePostSelectionMethod} from "./selectionMethod";
import {TruncatedNormalDistribution} from "./math";
import {StudyImage, StudyImageMetadata} from "./images";
import {randDigits} from "../utils/random";
import {odiff} from "../utils/odiff";


/**
 * A source that is missing some information, but at least
 * contains enough info to perform the source/post selection.
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
        doTypeCheck(id, "string", "Source ID");
        doTypeCheck(avatar, [StudyImage, StudyImageMetadata], "Source Avatar");
        doTypeCheck(name, "string", "Source Name");
        doTypeCheck(maxPosts, "number", "Source Maximum Posts");
        doTypeCheck(followers, TruncatedNormalDistribution, "Source Initial Followers");
        doTypeCheck(credibility, TruncatedNormalDistribution, "Source Initial Credibility");
        doNullableTypeCheck(truePostPercentage, "number", "Source True Post Percentage");

        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
        this.truePostPercentage = truePostPercentage;
    }

    toJSON() {
        return {
            "id": this.id,
            "name": this.name,
            "avatar": this.avatar.toMetadata().toJSON(),
            "maxPosts": this.maxPosts,
            "followers": this.followers.toJSON(),
            "credibility": this.credibility.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }

    static fromJSON(json) {
        return new Source(
            json["id"], json["name"],
            StudyImageMetadata.fromJSON(json["avatar"]),
            json["maxPosts"],
            TruncatedNormalDistribution.fromJSON(json["followers"]),
            TruncatedNormalDistribution.fromJSON(json["credibility"]),
            json["truePostPercentage"]
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
        doTypeCheck(sourceID, "string", "Comment's Source ID");
        doTypeCheck(message, "string", "Comment's Message");
        doTypeCheck(likes, "number", "Comment Likes");
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
        doTypeCheck(like, TruncatedNormalDistribution, "Reaction Value for a Like");
        doTypeCheck(dislike, TruncatedNormalDistribution, "Reaction Value for a Dislike");
        doTypeCheck(share, TruncatedNormalDistribution, "Reaction Value for a Share");
        doTypeCheck(flag, TruncatedNormalDistribution, "Reaction Value for a Flag");
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
export class Post {
    id; // String
    headline; // String
    content; // StudyImage, StudyImageMetadata, or String
    isTrue; // Boolean
    changesToFollowers; // ReactionValues
    changesToCredibility; // ReactionValues
    comments; // PostComment[]

    constructor(id, headline, content, isTrue, changesToFollowers, changesToCredibility, comments) {
        doTypeCheck(id, "string", "Post ID");
        doTypeCheck(headline, "string", "Post Headline");
        doTypeCheck(content, [StudyImage, StudyImageMetadata, "string"], "Post Content");
        doTypeCheck(isTrue, "boolean", "Whether the post is true");
        doTypeCheck(changesToFollowers, ReactionValues, "Post's Change to Followers");
        doTypeCheck(changesToCredibility, ReactionValues, "Post's Change to Credibility");
        doTypeCheck(comments, Array, "Post's Comments");
        this.id = id;
        this.headline = headline;
        this.content = content;
        this.isTrue = isTrue;
        this.changesToFollowers = changesToFollowers;
        this.changesToCredibility = changesToCredibility;
        this.comments = comments;
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
        let contentJSON = this.content;
        if (isOfType(contentJSON, [StudyImage, StudyImageMetadata])) {
            contentJSON = contentJSON.toMetadata().toJSON();
        }
        return {
            "id": this.id,
            "headline": this.headline,
            "content": contentJSON,
            "isTrue": this.isTrue,
            "changesToFollowers": this.changesToFollowers.toJSON(),
            "changesToCredibility": this.changesToCredibility.toJSON(),
            "comments": Post.commentsToJSON(this.comments)
        };
    }

    static fromJSON(json) {
        let content = json["content"];
        if (!isOfType(content, "string")) {
            content = StudyImageMetadata.fromJSON(content);
        }

        return new Post(
            json["id"], json["headline"],
            content, json["isTrue"],
            ReactionValues.fromJSON(json["changesToFollowers"]),
            ReactionValues.fromJSON(json["changesToCredibility"]),
            Post.commentsFromJSON(json["comments"])
        );
    }
}

/**
 * A study that is missing most of its information
 * because it could not be read properly.
 */
export class BrokenStudy {
    id; // String
    json; // JSON Object
    error; // String
    name; // String
    description; // String
    lastModifiedTime; // Number, UNIX Epoch Time in Seconds

    constructor(id, json, error, name, description, lastModifiedTime) {
        doTypeCheck(id, "string", "Invalid Study's ID");
        doNonNullCheck(json, "Invalid Study's JSON");
        doTypeCheck(error, "string", "Invalid Study's Error");
        doNullableTypeCheck(name, "string", "Invalid Study's Name");
        doNullableTypeCheck(description, "string", "Invalid Study's Description");
        doNullableTypeCheck(lastModifiedTime, "number", "The last time the invalid study was modified");
        this.id = id;
        this.json = json;
        this.error = error;
        this.name = name || "Unknown Name";
        this.description = description || "Missing Description";
        this.lastModifiedTime = lastModifiedTime || 0;
    }

    static fromJSON(id, json, error) {
        return new BrokenStudy(
            id, json, error, json["name"], json["description"], json["lastModifiedTime"]
        );
    }
}

/**
 * Holds the entire specification of a study.
 */
export class Study {
    id; // String
    name; // String
    description; // String
    lastModifiedTime; // Number, UNIX Epoch Time in Seconds
    enabled; // Boolean

    prompt; // String
    length; // Number
    requireIdentification; // Boolean
    introDelaySeconds; // Number
    reactDelaySeconds; // Number
    genCompletionCode; // Boolean
    completionCodeDigits; // Number

    preIntro; // HTML String
    postIntro; // HTML String
    debrief; // HTML String

    sourcePostSelectionMethod; // SourcePostSelectionMethod
    sources; // Source[]
    posts; // Post[]

    constructor(
            id, name, description, lastModifiedTime, enabled,
            prompt, length, requireIdentification,
            introDelaySeconds, reactDelaySeconds,
            genCompletionCode, completionCodeDigits,
            preIntro, postIntro, debrief,
            sourcePostSelectionMethod,
            sources, posts) {

        doTypeCheck(id, "string", "Study ID");
        doTypeCheck(name, "string", "Study Name");
        doTypeCheck(description, "string", "Study Description");
        doNullableTypeCheck(lastModifiedTime, "number", "The last time the study was modified");
        doNullableTypeCheck(enabled, "boolean", "Whether the study is enabled");

        doTypeCheck(prompt, "string", "Study Prompt");
        doTypeCheck(length, "number", "Study Length");
        doTypeCheck(requireIdentification, "boolean", "Whether the study requires identification");
        doTypeCheck(introDelaySeconds, "number", "Study Introduction Continue Delay");
        doTypeCheck(reactDelaySeconds, "number", "Study Reaction Delay");
        doTypeCheck(genCompletionCode, "boolean", "Whether the study generates a completion code");
        doTypeCheck(completionCodeDigits, "number", "Study Completion Code Digits");

        doTypeCheck(preIntro, "string", "Study Introduction before Game Rules");
        doTypeCheck(postIntro, "string", "Study Introduction after Game Rules");
        doTypeCheck(debrief, "string", "Study Debrief");

        doTypeCheck(sourcePostSelectionMethod, SourcePostSelectionMethod, "Study Source/Post Selection Method");
        doTypeCheck(sources, Array, "Study Sources");
        doTypeCheck(posts, Array, "Study Posts");

        this.id = id;
        this.name = name;
        this.description = description;
        this.lastModifiedTime = lastModifiedTime || 0;
        this.enabled = enabled || false;

        this.prompt = prompt;
        this.length = length;
        this.requireIdentification = requireIdentification;
        this.introDelaySeconds = introDelaySeconds;
        this.reactDelaySeconds = reactDelaySeconds;
        this.genCompletionCode = genCompletionCode;
        this.completionCodeDigits = completionCodeDigits;

        this.preIntro = preIntro;
        this.postIntro = postIntro;
        this.debrief = debrief;

        this.sourcePostSelectionMethod = sourcePostSelectionMethod;
        this.sources = sources;
        this.posts = posts;
    }

    /**
     * Updates the last modified time to now.
     */
    updateLastModifiedTime() {
        this.lastModifiedTime = Math.round(new Date().getTime() / 1000);
    }

    getSource(sourceID) {
        for (let index = 0; index < this.sources.length; ++index) {
            const source = this.sources[index];
            if (source.id === sourceID)
                return source;
        }
        throw new Error("Unknown source ID " + sourceID);
    }

    getPost(postID) {
        for (let index = 0; index < this.posts.length; ++index) {
            const post = this.posts[index];
            if (post.id === postID)
                return post;
        }
        throw new Error("Unknown post ID " + postID);
    }

    /**
     * Generates a random completion code string for this study.
     */
    generateRandomCompletionCode() {
        return randDigits(this.completionCodeDigits);
    }

    /**
     * Returns a list of all the paths to assets related
     * to this study that are stored in Firebase Storage.
     */
    getAllStoragePaths() {
        const paths = [];
        for (let index = 0; index < this.posts.length; ++index) {
            const post = this.posts[index];
            if (!isOfType(post.content, "string")) {
                paths.push(StudyImage.getPath(
                    this.id, post.id, post.content.toMetadata()
                ));
            }
        }
        for (let index = 0; index < this.sources.length; ++index) {
            const source = this.sources[index];
            paths.push(StudyImage.getPath(
                this.id, source.id, source.avatar.toMetadata()
            ));
        }
        return paths;
    }

    static sourcesToJSON(sources) {
        const sourcesJSON = [];
        for (let index = 0; index < sources.length; ++index) {
            doTypeCheck(sources[index], Source, "Source at index " + index);
            sourcesJSON.push(sources[index].toJSON());
        }
        return sourcesJSON;
    }

    static sourcesFromJSON(json) {
        const sources = [];
        for (let index = 0; index < json.length; ++index) {
            sources.push(Source.fromJSON(json[index]));
        }
        return sources;
    }

    static postsToJSON(posts) {
        const postsJSON = [];
        for (let index = 0; index < posts.length; ++index) {
            doTypeCheck(posts[index], Post, "Post at index " + index);
            postsJSON.push(posts[index].toJSON());
        }
        return postsJSON;
    }

    static postsFromJSON(json) {
        const posts = [];
        for (let index = 0; index < json.length; ++index) {
            posts.push(Post.fromJSON(json[index]));
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
            "lastModifiedTime": this.lastModifiedTime,
            "enabled": this.enabled,
            "prompt": this.prompt,
            "length": this.length,
            "requireIdentification": this.requireIdentification,
            "introDelaySeconds": this.introDelaySeconds,
            "reactDelaySeconds": this.reactDelaySeconds,
            "genCompletionCode": this.genCompletionCode,
            "completionCodeDigits": this.completionCodeDigits,
            "preIntro": this.preIntro,
            "postIntro": this.postIntro,
            "debrief": this.debrief,
            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": Study.sourcesToJSON(this.sources),
            "posts": Study.postsToJSON(this.posts)
        }
    }

    static fromJSON(id, json) {
        return new Study(
            id, json["name"], json["description"],
            json["lastModifiedTime"], json["enabled"],
            json["prompt"], json["length"], json["requireIdentification"],
            json["introDelaySeconds"], json["reactDelaySeconds"],
            json["genCompletionCode"], json["completionCodeDigits"],
            json["preIntro"], json["postIntro"], json["debrief"],
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
export function getStudyChangesToAndFromJSON(study) {
    // Convert the study to JSON.
    const json = study.toJSON();

    // Reconstruct the study from the JSON, and convert it back to JSON.
    const reconstructedJSON = Study.fromJSON(study.id, json, study.lastModifiedTime).toJSON();

    // Return the deep differences between them.
    return odiff(json, reconstructedJSON);
}