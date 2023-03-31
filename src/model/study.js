import {doEnumCheck, doNonNullCheck, doNullableTypeCheck, doTypeCheck, isOfType, typeToString} from "../utils/types";
import {SourcePostSelectionMethod} from "./selectionMethod";
import {TruncatedNormalDistribution} from "./math";
import {StudyImage, StudyImageMetadata} from "./images";
import {randDigits, randElement} from "../utils/random";
import {odiff} from "../utils/odiff";
import {getUnixEpochTimeSeconds} from "../utils/time";

/**
 * The JSON objects that are uploaded to Firebase
 * are compressed. However, these values need to
 * not be compressed, so are skipped. This is
 * because they are used to query for studies,
 * or are updated by the program.
 */
export const STUDY_UNCOMPRESSED_KEYS = ["authorID", "enabled"];


export const SOURCE_AVAILABLE_SOURCE_STYLES = [
    {backgroundColor: "#74ebd5"},
    {backgroundColor: "#ffb48f"},
    {backgroundColor: "#c9d3f2"},
    {backgroundColor: "#e3b6d3"},
    {backgroundColor: "#8fd186"},
    {backgroundColor: "#E29587"}
];


/**
 * A source that is missing some information, but at least
 * contains enough info to perform the source/post selection.
 */
export class Source {
    id; // String
    name; // String
    avatar; // Avatar?
    style; // object
    maxPosts; // Number
    followers; // TruncatedNormalDistribution
    credibility; // TruncatedNormalDistribution
    truePostPercentage; // null or a Number between 0 and 1

    constructor(id, name, avatar, style, maxPosts, followers, credibility, truePostPercentage) {
        doTypeCheck(id, "string", "Source ID");
        doNullableTypeCheck(avatar, [StudyImage, StudyImageMetadata], "Source Avatar");
        doNullableTypeCheck(style, "object", "Style");
        doTypeCheck(name, "string", "Source Name");
        doTypeCheck(maxPosts, "number", "Source Maximum Posts");
        doTypeCheck(followers, TruncatedNormalDistribution, "Source Initial Followers");
        doTypeCheck(credibility, TruncatedNormalDistribution, "Source Initial Credibility");
        doNullableTypeCheck(truePostPercentage, "number", "Source True Post Percentage");

        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.style = style || Source.randomStyle();
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
        this.truePostPercentage = truePostPercentage;
    }

    toJSON() {
        return {
            "id": this.id,
            "name": this.name,
            "avatar": (!this.avatar ? null : this.avatar.toMetadata().toJSON()),
            "style": this.style,
            "maxPosts": this.maxPosts,
            "followers": this.followers.toJSON(),
            "credibility": this.credibility.toJSON(),
            "truePostPercentage": this.truePostPercentage
        };
    }

    static fromJSON(json) {
        return new Source(
            json["id"], json["name"],
            (!json["avatar"] ? null : StudyImageMetadata.fromJSON(json["avatar"])),
            json["style"],
            json["maxPosts"],
            TruncatedNormalDistribution.fromJSON(json["followers"]),
            TruncatedNormalDistribution.fromJSON(json["credibility"]),
            json["truePostPercentage"]
        );
    }

    static randomStyle() {
        return randElement(SOURCE_AVAILABLE_SOURCE_STYLES);
    }
}

/**
 * Holds a number for every possible reaction to a post.
 */
export class ReactionValues {
    like; // TruncatedNormalDistribution?
    dislike; // TruncatedNormalDistribution?
    share; // TruncatedNormalDistribution?
    flag; // TruncatedNormalDistribution?

    constructor(like, dislike, share, flag) {
        doNullableTypeCheck(like, TruncatedNormalDistribution, "Reaction Value for a Like");
        doNullableTypeCheck(dislike, TruncatedNormalDistribution, "Reaction Value for a Dislike");
        doNullableTypeCheck(share, TruncatedNormalDistribution, "Reaction Value for a Share");
        doNullableTypeCheck(flag, TruncatedNormalDistribution, "Reaction Value for a Flag");
        this.like = like;
        this.dislike = dislike;
        this.share = share;
        this.flag = flag;
    }

    sampleAll() {
        const numberOfReactions = {};
        const reactions = ["like", "dislike", "share", "flag"];
        for (let index = 0; index < reactions.length; ++index) {
            const reaction = reactions[index];
            const distribution = this[reaction];
            if (!distribution)
                continue;

            numberOfReactions[reaction] = Math.round(distribution.sample());
        }
        return numberOfReactions;
    }

    static reactionToJSON(dist) {
        return (dist !== null ? dist.toJSON() : null);
    }

    static reactionFromJSON(json) {
        return (json !== null ? TruncatedNormalDistribution.fromJSON(json) : null);
    }

    toJSON() {
        return {
            "like": ReactionValues.reactionToJSON(this.like),
            "dislike": ReactionValues.reactionToJSON(this.dislike),
            "share": ReactionValues.reactionToJSON(this.share),
            "flag": ReactionValues.reactionToJSON(this.flag)
        };
    }

    static fromJSON(json) {
        return new ReactionValues(
            ReactionValues.reactionFromJSON(json["like"]),
            ReactionValues.reactionFromJSON(json["dislike"]),
            ReactionValues.reactionFromJSON(json["share"]),
            ReactionValues.reactionFromJSON(json["flag"])
        );
    }

    static zero() {
        const zero = TruncatedNormalDistribution.zero();
        return new ReactionValues(zero, zero, zero, zero);
    }
}

/**
 * A comment that a source made on a post.
 */
export class PostComment {
    index; // Number
    sourceName; // String
    message; // String
    numberOfReactions; // ReactionValues

    constructor(index, sourceName, message, numberOfReactions) {
        doTypeCheck(index, "number", "Comment's Index")
        doTypeCheck(sourceName, "string", "Comment's Source Name");
        doTypeCheck(message, "string", "Comment's Message");
        doTypeCheck(numberOfReactions, ReactionValues, "Comment Number of Reactions");
        this.index = index;
        this.sourceName = sourceName;
        this.message = message;
        this.numberOfReactions = numberOfReactions;
    }

    toJSON() {
        return {
            "sourceName": this.sourceName,
            "message": this.message,
            "numberOfReactions": this.numberOfReactions.toJSON()
        };
    }

    static fromJSON(json, index) {
        return new PostComment(
            index,
            json["sourceName"],
            json["message"],
            ReactionValues.fromJSON(json["numberOfReactions"])
        );
    }
}

/**
 * A comment that a user made on a post.
 */
export class UserComment extends PostComment {
    constructor(message) {
        super(-1, "You", message, ReactionValues.zero());
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
    numberOfReactions; // ReactionValues
    comments; // PostComment[]

    constructor(id, headline, content, isTrue, changesToFollowers, changesToCredibility, numberOfReactions, comments) {
        doTypeCheck(id, "string", "Post ID");
        doTypeCheck(headline, "string", "Post Headline");
        doTypeCheck(content, [StudyImage, StudyImageMetadata, "string"], "Post Content");
        doTypeCheck(isTrue, "boolean", "Whether the post is true");
        doTypeCheck(changesToFollowers, ReactionValues, "Post's Change to Followers");
        doTypeCheck(changesToCredibility, ReactionValues, "Post's Change to Credibility");
        doTypeCheck(numberOfReactions, ReactionValues, "Post's Number of Reactions");
        doTypeCheck(comments, Array, "Post's Comments");
        this.id = id;
        this.headline = headline;
        this.content = content;
        this.isTrue = isTrue;
        this.changesToFollowers = changesToFollowers;
        this.changesToCredibility = changesToCredibility;
        this.numberOfReactions = numberOfReactions;
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
            comments.push(PostComment.fromJSON(json[index], index));
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
            "numberOfReactions": this.numberOfReactions.toJSON(),
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
            ReactionValues.fromJSON(json["numberOfReactions"]),
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
 * The basic settings of a study.
 */
export class StudyBasicSettings {
    name; // String
    description; // String

    prompt; // String
    length; // Number

    requireReactions; // Boolean
    requireComments; // String
    requireIdentification; // Boolean

    constructor(
            name, description, prompt, length,
            requireReactions, requireComments, requireIdentification) {

        doTypeCheck(name, "string", "Study Name");
        doTypeCheck(description, "string", "Study Description");
        doTypeCheck(prompt, "string", "Study Prompt");
        doTypeCheck(length, "number", "Study Length");

        doTypeCheck(requireComments, "string", "requireComments");
        requireComments = requireComments.toLowerCase();
        doEnumCheck(
            requireComments, ["required", "optional", "disabled"],
            "Whether comments are required, optional, or disabled"
        );

        doTypeCheck(requireReactions, "boolean", "Whether the study requires reactions to posts");
        doTypeCheck(requireIdentification, "boolean", "Whether the study requires identification");

        this.name = name;
        this.description = description;
        this.prompt = prompt;
        this.length = length;
        this.requireComments = requireComments;
        this.requireReactions = requireReactions;
        this.requireIdentification = requireIdentification;
    }

    toJSON() {
        return {
            "name": this.name,
            "description": this.description,
            "prompt": this.prompt,
            "length": this.length,
            "requireComments": this.requireComments,
            "requireReactions": this.requireReactions,
            "requireIdentification": this.requireIdentification
        };
    }

    static fromJSON(json) {
        return new StudyBasicSettings(
            json["name"], json["description"], json["prompt"], json["length"],
            json["requireReactions"], json["requireComments"], json["requireIdentification"]
        )
    }

    /**
     * Create the basic settings for a version-2 study.
     */
    static createV2(
            name, description, prompt, length,
            requireReactions, requireComments, requireIdentification) {

        return new StudyBasicSettings(
            name, description, prompt, length,
            requireReactions, requireComments, requireIdentification
        )
    }

    /**
     * Create the basic settings for a version-1 study.
     */
    static createV1(
            name, description, prompt, length,
            requireReactions, requireComments, requireIdentification) {

        return StudyBasicSettings.createV2(
            name, description, prompt, length,
            requireReactions, requireComments, requireIdentification
        )
    }
}

/**
 * The user interface settings of a study.
 */
export class StudyUserInterfaceSettings {
    displayPostsInFeed; // Boolean
    displayFollowers; // Boolean
    displayCredibility; // Boolean
    displayProgress; // Boolean
    displayNumberOfReactions; // Boolean
    allowMultipleReactions; // Boolean

    postEnabledReactions; // {String: Boolean}
    commentEnabledReactions; // {String: Boolean}

    constructor(
            displayPostsInFeed, displayFollowers, displayCredibility,
            displayProgress, displayNumberOfReactions, allowMultipleReactions,
            postEnabledReactions, commentEnabledReactions
    ) {
        doTypeCheck(displayPostsInFeed, "boolean", "Whether to display posts in a feed");
        doTypeCheck(displayFollowers, "boolean", "Whether to display followers");
        doTypeCheck(displayCredibility, "boolean", "Whether to display credibility");
        doTypeCheck(displayProgress, "boolean", "Whether to display progress");
        doTypeCheck(displayNumberOfReactions, "boolean", "Whether to display number of reactions");
        doTypeCheck(allowMultipleReactions, "boolean", "Whether to allow selection of multiple reactions");

        doTypeCheck(postEnabledReactions, "object", "The reactions enabled for posts");
        doTypeCheck(postEnabledReactions["like"], "boolean", "Whether likes are enabled for posts");
        doTypeCheck(postEnabledReactions["dislike"], "boolean", "Whether likes are enabled for posts");
        doTypeCheck(postEnabledReactions["share"], "boolean", "Whether likes are enabled for posts");
        doTypeCheck(postEnabledReactions["flag"], "boolean", "Whether likes are enabled for posts");
        doTypeCheck(postEnabledReactions["skip"], "boolean", "Whether skip post is enabled for posts");
        doTypeCheck(commentEnabledReactions, "object", "The reactions enabled for comments");
        doTypeCheck(commentEnabledReactions["like"], "boolean", "Whether likes are enabled for comments");
        doTypeCheck(commentEnabledReactions["dislike"], "boolean", "Whether likes are enabled for comments");

        this.displayPostsInFeed = displayPostsInFeed;
        this.displayFollowers = displayFollowers;
        this.displayCredibility = displayCredibility;
        this.displayProgress = displayProgress;
        this.displayNumberOfReactions = displayNumberOfReactions;
        this.allowMultipleReactions = allowMultipleReactions;

        this.postEnabledReactions = postEnabledReactions;
        this.commentEnabledReactions = commentEnabledReactions;
    }

    toJSON() {
        return {
            "displayPostsInFeed": this.displayPostsInFeed,
            "displayFollowers": this.displayFollowers,
            "displayCredibility": this.displayCredibility,
            "displayProgress": this.displayProgress,
            "displayNumberOfReactions": this.displayNumberOfReactions,
            "allowMultipleReactions": this.allowMultipleReactions,
            "postEnabledReactions": this.postEnabledReactions,
            "commentEnabledReactions": this.commentEnabledReactions,
        };
    }

    static fromJSON(json) {
        const displayPostsInFeed = json["displayPostsInFeed"],
              allowMultipleReactions = json["allowMultipleReactions"];

        const postEnabledReactions = json["postEnabledReactions"];
        // For backwards compatibility with V1 spreadsheets.
        if (postEnabledReactions["skip"] === undefined) {
            postEnabledReactions["skip"] = true;
        }

        return new StudyUserInterfaceSettings(
            (displayPostsInFeed === undefined ? false : displayPostsInFeed),
            json["displayFollowers"], json["displayCredibility"],
            json["displayProgress"], json["displayNumberOfReactions"],
            (allowMultipleReactions === undefined ? false : allowMultipleReactions),
            postEnabledReactions, json["commentEnabledReactions"]
        )
    }

    /**
     * Create the user interface settings for a version-2 study.
     */
    static createV2(
        displayPostsInFeed, displayFollowers, displayCredibility,
        displayProgress, displayNumberOfReactions, allowMultipleReactions,
        postEnabledReactions, commentEnabledReactions
    ) {
        return new StudyUserInterfaceSettings(
            displayPostsInFeed, displayFollowers, displayCredibility,
            displayProgress, displayNumberOfReactions, allowMultipleReactions,
            postEnabledReactions, commentEnabledReactions
        )
    }

    /**
     * Create the user interface settings for a version-1 study.
     */
    static createV1(
        displayFollowers, displayCredibility, displayProgress,
        displayNumberOfReactions, postEnabledReactions, commentEnabledReactions
    ) {
        // V1 studies are missing whether skip is enabled.
        const postEnabledReactionsWithSkip = {"skip": true};
        for (let key in postEnabledReactions) {
            if (postEnabledReactions.hasOwnProperty(key)) {
                postEnabledReactionsWithSkip[key] = postEnabledReactions[key];
            }
        }

        return StudyUserInterfaceSettings.createV2(
            false, displayFollowers, displayCredibility, displayProgress,
            displayNumberOfReactions, false,
            postEnabledReactionsWithSkip, commentEnabledReactions
        )
    }
}

/**
 * The advanced settings of a study.
 */
export class StudyAdvancedSettings {
    minimumCommentLength; // Number
    promptDelaySeconds; // Number
    reactDelaySeconds; // Number

    genCompletionCode; // Boolean
    completionCodeDigits; // Number
    genRandomDefaultAvatars; // Boolean

    constructor(
        minimumCommentLength, promptDelaySeconds, reactDelaySeconds,
        genCompletionCode, completionCodeDigits, genRandomDefaultAvatars) {

        doTypeCheck(minimumCommentLength, "number", "Minimum Comment Length");
        doTypeCheck(promptDelaySeconds, "number", "Study Prompt Continue Delay");
        doTypeCheck(reactDelaySeconds, "number", "Study Reaction Delay");

        doTypeCheck(genCompletionCode, "boolean", "Whether the study generates a completion code");
        doTypeCheck(completionCodeDigits, "number", "Study Completion Code Digits");
        doTypeCheck(genRandomDefaultAvatars, "boolean", "Whether the study generates random default avatars for sources");

        this.minimumCommentLength = minimumCommentLength;
        this.promptDelaySeconds = promptDelaySeconds;
        this.reactDelaySeconds = reactDelaySeconds;

        this.genCompletionCode = genCompletionCode;
        this.completionCodeDigits = completionCodeDigits;
        this.genRandomDefaultAvatars = genRandomDefaultAvatars;
    }

    toJSON() {
        return {
            "minimumCommentLength": this.minimumCommentLength,
            "promptDelaySeconds": this.promptDelaySeconds,
            "reactDelaySeconds": this.reactDelaySeconds,
            "genCompletionCode": this.genCompletionCode,
            "completionCodeDigits": this.completionCodeDigits,
            "genRandomDefaultAvatars": this.genRandomDefaultAvatars
        };
    }

    static fromJSON(json) {
        const randDefaultAvatars = json["genRandomDefaultAvatars"];
        return new StudyAdvancedSettings(
            json["minimumCommentLength"], json["promptDelaySeconds"],
            json["reactDelaySeconds"], json["genCompletionCode"],
            json["completionCodeDigits"],
            (randDefaultAvatars === undefined ? true : randDefaultAvatars)
        )
    }

    /**
     * Create the advanced settings for a version-2 study.
     */
    static createV2(
        minimumCommentLength, promptDelaySeconds, reactDelaySeconds,
        genCompletionCode, completionCodeDigits, genRandomDefaultAvatars) {

        return new StudyAdvancedSettings(
            minimumCommentLength, promptDelaySeconds, reactDelaySeconds,
            genCompletionCode, completionCodeDigits, genRandomDefaultAvatars
        )
    }

    /**
     * Create the advanced settings for a version-1 study.
     */
    static createV1(
        minimumCommentLength, promptDelaySeconds, reactDelaySeconds,
        genCompletionCode, completionCodeDigits, genRandomDefaultAvatars) {

        return StudyAdvancedSettings.createV2(
            minimumCommentLength, promptDelaySeconds, reactDelaySeconds,
            genCompletionCode, completionCodeDigits, genRandomDefaultAvatars
        )
    }
}

/**
 * Settings regarding the content pages of the study.
 */
export class StudyPagesSettings {
    preIntro; // HTML String
    preIntroDelaySeconds; // Number
    rules; // HTML String
    rulesDelaySeconds; // Number
    postIntro; // HTML String
    postIntroDelaySeconds; // Number
    debrief; // HTML String

    constructor(
            preIntro, preIntroDelaySeconds,
            rules, rulesDelaySeconds,
            postIntro, postIntroDelaySeconds,
            debrief) {

        doTypeCheck(preIntro, "string", "Study Introduction before Game Rules");
        doTypeCheck(preIntroDelaySeconds, "number", "Study Introduction before Game Rules Continue Delay");
        doTypeCheck(rules, "string", "Game Rules");
        doTypeCheck(rulesDelaySeconds, "number", "Game Rules Continue Delay");
        doTypeCheck(postIntro, "string", "Study Introduction after Game Rules");
        doTypeCheck(postIntroDelaySeconds, "number", "Study Introduction after Game Rules Continue Delay");
        doTypeCheck(debrief, "string", "Study Debrief");

        this.preIntro = preIntro;
        this.preIntroDelaySeconds = preIntroDelaySeconds;
        this.rules = rules;
        this.rulesDelaySeconds = rulesDelaySeconds;
        this.postIntro = postIntro;
        this.postIntroDelaySeconds = postIntroDelaySeconds;
        this.debrief = debrief;
    }

    toJSON() {
        return {
            "preIntro": this.preIntro,
            "preIntroDelaySeconds": this.preIntroDelaySeconds,
            "rules": this.rules,
            "rulesDelaySeconds": this.rulesDelaySeconds,
            "postIntro": this.postIntro,
            "postIntroDelaySeconds": this.postIntroDelaySeconds,
            "debrief": this.debrief
        };
    }

    static fromJSON(json) {
        const rules = json["rules"],
              rulesDelaySeconds = json["rulesDelaySeconds"];

        return new StudyPagesSettings(
            json["preIntro"], json["preIntroDelaySeconds"],
            (rules === undefined ? "" : rules),
            (rulesDelaySeconds === undefined ? 0 : rulesDelaySeconds),
            json["postIntro"], json["postIntroDelaySeconds"],
            json["debrief"]
        )
    }

    /**
     * Create the pages settings for a version-2 study.
     */
    static createV2(
            preIntro, preIntroDelaySeconds, rules, rulesDelaySeconds,
            postIntro, postIntroDelaySeconds, debrief) {

        return new StudyPagesSettings(
            preIntro, preIntroDelaySeconds, rules, rulesDelaySeconds,
            postIntro, postIntroDelaySeconds, debrief
        )
    }

    /**
     * Create the pages settings for a version-1 study.
     */
    static createV1(
        preIntro, preIntroDelaySeconds, rules, rulesDelaySeconds,
        postIntro, postIntroDelaySeconds, debrief) {

        return StudyPagesSettings.createV2(
            preIntro, preIntroDelaySeconds, rules, rulesDelaySeconds,
            postIntro, postIntroDelaySeconds, debrief
        )
    }
}

/**
 * Holds the entire specification of a study.
 */
export class Study {
    id; // String
    authorID; // String
    authorName; // String
    lastModifiedTime; // Number (UNIX Epoch Time in Seconds)
    enabled; // Boolean

    basicSettings; // StudyBasicSettings
    uiSettings; // StudyUserInterfaceSettings
    advancedSettings; // StudyAdvancedSettings
    pagesSettings; // StudyPagesSettings

    sourcePostSelectionMethod; // SourcePostSelectionMethod
    sources; // Source[]
    posts; // Post[]

    constructor(
            id, authorID, authorName,
            lastModifiedTime, enabled,
            basicSettings,
            uiSettings,
            advancedSettings,
            pagesSettings,
            sourcePostSelectionMethod,
            sources, posts) {

        doTypeCheck(id, "string", "Study ID");
        doTypeCheck(authorID, "string", "Study Author's ID");
        doTypeCheck(authorName, "string", "Study Author's Name");
        doNullableTypeCheck(lastModifiedTime, "number", "The last time the study was modified");
        doNullableTypeCheck(enabled, "boolean", "Whether the study is enabled");

        doTypeCheck(basicSettings, StudyBasicSettings, "General > Basic settings");
        doTypeCheck(uiSettings, StudyUserInterfaceSettings, "General > User Interface Settings");
        doTypeCheck(advancedSettings, StudyAdvancedSettings, "General > Advanced Settings");
        doTypeCheck(pagesSettings, StudyPagesSettings, "Pages Settings");

        doTypeCheck(sourcePostSelectionMethod, SourcePostSelectionMethod, "Study Source/Post Selection Method");
        doTypeCheck(sources, Array, "Study Sources");
        doTypeCheck(posts, Array, "Study Posts");

        this.id = id;
        this.authorID = authorID;
        this.authorName = authorName;
        this.lastModifiedTime = lastModifiedTime || 0;
        this.enabled = enabled || false;

        this.basicSettings = basicSettings;
        this.uiSettings = uiSettings;
        this.advancedSettings = advancedSettings;
        this.pagesSettings = pagesSettings;

        this.sourcePostSelectionMethod = sourcePostSelectionMethod;
        this.sources = sources;
        this.posts = posts;
    }

    isPostReactionEnabled(reaction) {
        if (reaction === "skip") {
            return (
                this.basicSettings.requireReactions &&
                !this.uiSettings.displayPostsInFeed &&
                this.uiSettings.postEnabledReactions["skip"]
            );
        } else {
            return this.uiSettings.postEnabledReactions[reaction];
        }
    }

    isCommentReactionEnabled(reaction) {
        return this.uiSettings.commentEnabledReactions[reaction];
    }

    areUserCommentsRequired() {
        return this.basicSettings.requireComments === "required";
    }

    areUserCommentsOptional() {
        return this.basicSettings.requireComments === "optional";
    }

    areUserCommentsEnabled() {
        return this.areUserCommentsRequired() || this.areUserCommentsOptional();
    }

    /**
     * Updates the last modified time to now.
     * This does not update the database.
     */
    updateLastModifiedTime() {
        this.lastModifiedTime = getUnixEpochTimeSeconds();
    }

    /**
     * Finds the source with ID {@param sourceID}.
     */
    getSource(sourceID) {
        for (let index = 0; index < this.sources.length; ++index) {
            const source = this.sources[index];
            if (source.id === sourceID)
                return source;
        }
        throw new Error("Unknown source ID " + sourceID);
    }

    /**
     * Finds the post with ID {@param postID}.
     */
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
        if (!this.advancedSettings.genCompletionCode)
            throw new Error("Completion codes are disabled for this study");

        return randDigits(this.advancedSettings.completionCodeDigits);
    }

    /**
     * Returns a list of all the paths to assets related
     * to this study that are stored in Firebase Storage.
     */
    getAllStoragePaths() {
        const paths = [];
        for (let index = 0; index < this.posts.length; ++index) {
            const post = this.posts[index];
            if (isOfType(post.content, "string"))
                continue;

            paths.push(StudyImage.getPath(
                this, post.id, post.content.toMetadata()
            ));
        }
        for (let index = 0; index < this.sources.length; ++index) {
            const source = this.sources[index];
            if (!source.avatar)
                continue;

            paths.push(StudyImage.getPath(
                this, source.id, source.avatar.toMetadata()
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
            "version": 1,

            "authorID": this.authorID,
            "authorName": this.authorName,
            "lastModifiedTime": this.lastModifiedTime,
            "enabled": this.enabled,

            "basicSettings": this.basicSettings.toJSON(),
            "uiSettings": this.uiSettings.toJSON(),
            "advancedSettings": this.advancedSettings.toJSON(),
            "pagesSettings": this.pagesSettings.toJSON(),

            "sourcePostSelectionMethod": this.sourcePostSelectionMethod.toJSON(),
            "sources": Study.sourcesToJSON(this.sources),
            "posts": Study.postsToJSON(this.posts)
        }
    }

    static fromJSON(id, json) {
        let version = json["version"];

        // No special settings are required for each version yet.
        // Undefined represents the version before versions were added.
        if (version !== undefined && version !== 1 && version !== 2)
            throw new Error("Unknown study version " + version)

        let basicSettingsJSON = json["basicSettings"],
            uiSettingsJSON = json["uiSettings"],
            advancedSettingsJSON = json["advancedSettings"],
            pagesSettingsJSON = json["pagesSettings"];

        // Old versions had these in the top-level object.
        if (basicSettingsJSON === undefined) {
            basicSettingsJSON = json;
        }
        if (uiSettingsJSON === undefined) {
            uiSettingsJSON = json;
        }
        if (advancedSettingsJSON === undefined) {
            advancedSettingsJSON = json;
        }
        if (pagesSettingsJSON === undefined) {
            pagesSettingsJSON = json;
        }

        return new Study(
            id, json["authorID"], json["authorName"],
            json["lastModifiedTime"], json["enabled"],
            StudyBasicSettings.fromJSON(basicSettingsJSON),
            StudyUserInterfaceSettings.fromJSON(uiSettingsJSON),
            StudyAdvancedSettings.fromJSON(advancedSettingsJSON),
            StudyPagesSettings.fromJSON(pagesSettingsJSON),
            SourcePostSelectionMethod.fromJSON(json["sourcePostSelectionMethod"]),
            Study.sourcesFromJSON(json["sources"]),
            Study.postsFromJSON(json["posts"])
        );
    }
}

/**
 * Converts {@param study} to JSON and back, and
 * returns an array with all changes between
 * the original study and the reconstructed one.
 * This should return an empty array if everything
 * is working correctly.
 */
export function getStudyChangesToAndFromJSON(study) {
    // Convert the study to JSON.
    const json = study.toJSON();
    const encodedJSON = JSON.stringify(json);

    // Reconstruct the study from the JSON.
    const reconstructedJSON = JSON.parse(encodedJSON);
    const reconstructedStudy = Study.fromJSON(study.id, reconstructedJSON, study.lastModifiedTime);

    // Return the deep differences between them.
    return odiff(json, reconstructedStudy.toJSON());
}

/**
 * Converts {@param study} to JSON, and verifies that
 * the JSON doesn't contain any invalid values. Invalid
 * values mainly encompasses undefined values and
 * custom types.
 *
 * @return an error string, or else null.
 */
export function checkStudyToJSONCompliance(study) {
    return checkJSONComplianceRecursive("studyJSON", study.toJSON());
}

function checkJSONComplianceRecursive(path, object) {
    if (object === undefined)
        return path + ": unexpected undefined value";
    if (object === null)
        return null;

    const type = typeof(object);
    if (type === "number" || type === "string" || type === "boolean")
        return null;
    if (type !== "object")
        return path + ": unexpected non-object value, (" + type + ") " + object;
    if (object.constructor !== Object && object.constructor !== Array)
        return path + ": unexpected typed object, (" + typeToString(object.constructor) + ") " + object;

    for (let key in object) {
        if (!object.hasOwnProperty(key))
            continue;

        const error = checkJSONComplianceRecursive(path + "." + key, object[key]);
        if (error)
            return error;
    }
    return null;
}
