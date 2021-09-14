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
<<<<<<< HEAD
=======
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
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD
            "maxPosts": this.maxPosts,
=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
            "followers": this.followers.toJSON(),
            "credibility": this.credibility.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }
<<<<<<< HEAD

    static fromJSON(json) {
        return new BaseSource(
            json["id"], json["name"], json["maxPosts"],
            TruncatedNormalDistribution.fromJSON(json["followers"]),
            TruncatedNormalDistribution.fromJSON(json["credibility"]),
            json["truePostPercentage"]
        );
    }
=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD

    static fromJSON(json) {
        const baseSource = BaseSource.fromJSON(json);
        return new Source(
            baseSource.id, baseSource.name,
            StudyImage.fromJSON(json["avatar"]),
            baseSource.maxPosts, baseSource.followers,
            baseSource.credibility, baseSource.truePostPercentage
        );
    }
=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD

    static fromJSON(json) {
        return new PostComment(
            json["sourceID"], json["message"], json["likes"]
        );
    }
=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD
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
=======
            "like": this.like,
            "dislike": this.dislike,
            "share": this.share,
            "flag": this.flag
        };
    }
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD
        doTypeCheck(id, "string");
=======
        doTypeCheck(id, "number");
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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

<<<<<<< HEAD
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
=======
    toJSON() {
        const commentsJSON = [];
        for (let index = 0; index < this.comments.length; ++index) {
            commentsJSON.push(this.comments[index].toJSON())
        }
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
        return {
            "id": this.id,
            "headline": this.headline,
            "isTrue": this.isTrue,
            "changesToFollowers": this.changesToFollowers.toJSON(),
            "changesToCredibility": this.changesToCredibility.toJSON(),
<<<<<<< HEAD
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
=======
            "comments": commentsJSON
        };
    }
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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
<<<<<<< HEAD
        return new BasePost(
            this.id, this.headline, this.isTrue,
            this.changesToFollowers,
            this.changesToCredibility,
            this.comments
        );
=======
        return new BasePost(this.id, this.headline, this.isTrue);
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
    }

    isFullPost() {
        return true;
    }

<<<<<<< HEAD
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
=======
    toJSON() {
        return {
            ...super.toJSON(),
            "content": this.content.toJSON()
        };
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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

<<<<<<< HEAD
    getSource(sourceID) {
        for (let index = 0; index < this.sources; ++index) {
            const source = this.sources[index];
            if (source.id === sourceID)
                return source;
        }
        throw new Error("Unknown source ID " + sourceID);
    }

    getPost(postID) {
        for (let index = 0; index < this.posts; ++index) {
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

=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
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

<<<<<<< HEAD
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

=======
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
    /**
     * This does _not_ include the full source and post
     * information, just the base information.
     */
    toJSON() {
<<<<<<< HEAD
=======
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
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
        return {
            "name": this.name,
            "description": this.description,
            "introduction": this.introduction,
            "prompt": this.prompt,
            "length": this.length,
            "debrief": this.debrief,
            "genCompletionCode": this.genCompletionCode,
<<<<<<< HEAD
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
=======
            "maxCompletionCode": this.maxCompletionCode,
            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": sourceJSONs,
            "posts": postJSONs
        }
    }
>>>>>>> eff2a8dcf7976c9b360ff7a581da4c9269aa7ba6
}
