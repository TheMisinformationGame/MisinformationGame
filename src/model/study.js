import {doTypeCheck, isOfType} from "../utils/types";
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
        doTypeCheck(id, "string");
        doTypeCheck(avatar, [StudyImage, StudyImageMetadata]);
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
export class Post {
    id; // String
    headline; // String
    content; // StudyImage, StudyImageMetadata, or String
    isTrue; // Boolean
    changesToFollowers; // ReactionValues
    changesToCredibility; // ReactionValues
    comments; // PostComment[]

    constructor(id, headline, content, isTrue, changesToFollowers, changesToCredibility, comments) {
        doTypeCheck(id, "string");
        doTypeCheck(headline, "string");
        doTypeCheck(content, [StudyImage, StudyImageMetadata, "string"]);
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
            contentJSON = contentJSON.toJSON();
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
 * Holds the entire specification of a study.
 */
export class Study {
    id; // String
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
            id, name, description, introduction,
            prompt, length, debrief,
            genCompletionCode, completionCodeDigits,
            sourcePostSelectionMethod,
            sources, posts) {

        doTypeCheck(id, "string");
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

        this.id = id;
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

    static sourcesToJSON(sources) {
        const sourcesJSON = [];
        for (let index = 0; index < sources.length; ++index) {
            doTypeCheck(sources[index], Source);
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
            doTypeCheck(posts[index], Post);
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
            "introduction": this.introduction,
            "prompt": this.prompt,
            "length": this.length,
            "debrief": this.debrief,
            "genCompletionCode": this.genCompletionCode,
            "completionCodeDigits": this.completionCodeDigits,
            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": Study.sourcesToJSON(this.sources),
            "posts": Study.postsToJSON(this.posts)
        }
    }

    static fromJSON(id, json) {
        return new Study(
            id, json["name"], json["description"],
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
export function getStudyChangesToAndFromJSON(study) {
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
    const reconstructedStudy = Study.fromJSON(study.id, json);
    for (let index = 0; index < sourcesJSON.length; ++index) {
        reconstructedStudy.replaceSource(Source.fromJSON(sourcesJSON[index]));
    }
    for (let index = 0; index < postsJSON.length; ++index) {
        reconstructedStudy.replacePost(Post.fromJSON(postsJSON[index]));
    }

    // Return the deep differences between them.
    return odiff(study, reconstructedStudy);
}