/**
 * A source with a known credibility and follower count.
 */
import {doArrayTypeCheck, doNullableArrayTypeCheck, doNullableTypeCheck, doTypeCheck, isOfType} from "../utils/types";
import {BrokenStudy, Post, PostComment, Source, Study} from "./study";
import {selectFilteredRandomElement, selectFilteredWeightedRandomElement} from "../utils/random";
import {odiff} from "../utils/odiff";
import {getDataManager} from "./manager";
import { postResults } from "../database/postToDB";
import {generateUID} from "../utils/uid";
import {getUnixEpochTimeSeconds} from "../utils/time";
import {compressJson, decompressJson} from "../database/compressJson";


/**
 * Adjusts the current credibility of a source or participant,
 * and returns their new credibility.
 */
function adjustCredibility(current, change) {
    return Math.max(0, Math.min(current + change, 100));
}

/**
 * Adjusts the current followers of a source or participant,
 * and returns their new followers.
 */
function adjustFollowers(current, change) {
    return Math.max(0, current + change);
}

/**
 * A source in the game with known credibility and followers.
 */
export class GameSource {
    // The study is not saved as part of the game states, it is only here for convenience.
    study; // Study

    source; // BaseSource
    credibility; // Number
    followers; // Number
    remainingUses; // Number

    constructor(study, source, credibility, followers, remainingUses) {
        doTypeCheck(study, Study, "Source's Study");
        doTypeCheck(source, Source, "Source's Metadata");
        doTypeCheck(credibility, "number", "Source's Credibility");
        doTypeCheck(followers, "number", "Source's Followers");
        doTypeCheck(remainingUses, "number", "Source's Remaining Uses");
        this.study = study;
        this.source = source;
        this.credibility = credibility;
        this.followers = followers;
        this.remainingUses = remainingUses;
    }

    /**
     * Returns a copy with of this source with adjusted credibility,
     * followers, and remaining uses.
     */
    adjustAfterPost(credibilityChange, followersChange) {
        const newCredibility = adjustCredibility(this.credibility, credibilityChange);
        const newFollowers = adjustFollowers(this.followers, followersChange);
        const newUses = Math.max(-1, this.remainingUses - 1);
        return new GameSource(this.study, this.source, newCredibility, newFollowers, newUses);
    }

    toJSON() {
        return {
            "sourceID": this.source.id,
            "credibility": this.credibility,
            "followers": this.followers,
            "remainingUses": this.remainingUses
        };
    }

    static fromJSON(json, study) {
        return new GameSource(
            study,
            study.getSource(json["sourceID"]),
            json["credibility"],
            json["followers"],
            json["remainingUses"]
        );
    }

    /**
     * Selects a random source to show, weighted by source's max posts.
     */
    static selectRandomSource(sources) {
        return selectFilteredWeightedRandomElement(
            sources,
            (source) => source.remainingUses === -1 || source.remainingUses > 0,
            () => false,
            (source) => source.source.maxPosts === -1 ? 0 : source.source.maxPosts
        );
    }

    /**
     * Returns the first source in {@param sources} that has the ID {@param id}.
     */
    static findById(sources, id) {
        for (let index = 0; index < sources.length; ++index) {
            const source = sources[index];
            if (source.source.id === id)
                return source;
        }
        throw new Error("Could not find source with ID " + id);
    }

    /**
     * Creates a new source for use in the game by sampling its
     * credibility and followers from the supplied distribution.
     */
    static sampleNewSource(study, source) {
        doTypeCheck(study, Study, "Study")
        doTypeCheck(source, Source, "Source");
        const credibility = source.credibility.sample();
        const followers = source.followers.sample();
        return new GameSource(study, source, credibility, followers, source.maxPosts);
    }
}

export class GamePostComment {
    comment; // BaseComment
    numberOfReactions; // {String: Number}

    constructor(comment, numberOfReactions) {
        doTypeCheck(comment, PostComment, "Comment's Metadata");
        doTypeCheck(numberOfReactions, "object", "Number of reactions for the comment");
        this.comment = comment;
        this.numberOfReactions = numberOfReactions;
    }

    toJSON() {
        return {
            "numberOfReactions": this.numberOfReactions
        };
    }

    static fromJSON(json, index, post) {
        return new GamePostComment(
            post.comments[index],
            json["numberOfReactions"]
        );
    }
}

/**
 * A post in the game that may have been shown already.
 */
export class GamePost {
    // The study is not saved as part of the game states, it is only here for convenience.
    study; // Study

    post; // Post
    numberOfReactions; // {String: Number}
    comments; // GamePostComment[]
    shown; // Boolean

    constructor(study, post, numberOfReactions, comments, shown) {
        doTypeCheck(study, Study, "Post's Study");
        doTypeCheck(post, Post, "Post's Metadata");
        doTypeCheck(numberOfReactions, "object", "Number of reactions for the post");
        doArrayTypeCheck(comments, GamePostComment, "Comments on Post");
        doNullableTypeCheck(shown, "boolean", "Whether the post has been shown");
        this.study = study;
        this.post = post;
        this.numberOfReactions = numberOfReactions;
        this.comments = comments;
        this.shown = !!shown;
    }

    /**
     * Returns a new GamePost for this post after it has been shown.
     */
    adjustAfterShown() {
        return new GamePost(this.study, this.post, this.numberOfReactions, this.comments, true);
    }

    static commentsToJSON(comments) {
        const commentsJSON = [];
        for (let index = 0; index < comments.length; ++index) {
            commentsJSON.push(comments[index].toJSON())
        }
        return commentsJSON;
    }

    static commentsFromJSON(json, post) {
        const comments = [];
        for (let index = 0; index < json.length; ++index) {
            comments.push(GamePostComment.fromJSON(json[index], index, post));
        }
        return comments;
    }

    toJSON() {
        return {
            "postID": this.post.id,
            "numberOfReactions": this.numberOfReactions,
            "comments": GamePost.commentsToJSON(this.comments),
            "shown": this.shown
        };
    }

    static fromJSON(json, study) {
        const post = study.getPost(json["postID"]);
        const comments = GamePost.commentsFromJSON(json["comments"], post);
        return new GamePost(
            study,
            post,
            json["numberOfReactions"],
            comments,
            json["shown"]
        );
    }

    /**
     * Selects a random post to show, with a {@param truePostPercentage}
     * percent chance of selecting a true post.
     *
     * @param posts The array of posts to choose from.
     * @param truePostPercentage A percentage value between 0 and 100.
     */
    static selectRandomPost(posts, truePostPercentage) {
        const selectTruePosts = 100 * Math.random() < truePostPercentage;
        return selectFilteredRandomElement(
            posts,
            (post) => !post.shown, // Hard Filter
            (post) => selectTruePosts === post.post.isTrue // Soft Filter
        );
    }

    /**
     * Returns the first post in {@param posts} that has the ID {@param id}.
     */
    static findById(posts, id) {
        for (let index = 0; index < posts.length; ++index) {
            const post = posts[index];
            if (post.post.id === id)
                return post;
        }
        throw new Error("Could not find post with ID " + id);
    }

    /**
     * Creates a new post for use in the game by sampling its
     * number of reactions from the supplied distribution.
     */
    static sampleNewPost(study, post) {
        doTypeCheck(study, Study, "Study")
        doTypeCheck(post, Post, "Post");
        const numberOfReactions = post.numberOfReactions.sampleAll();
        const comments = [];
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            const commentNumberOfReactions = comment.numberOfReactions.sampleAll();
            comments.push(new GamePostComment(comment, commentNumberOfReactions));
        }
        return new GamePost(study, post, numberOfReactions, comments, false);
    }
}

/**
 * Holds the current state of a game.
 */
export class GameState {
    // The study is not saved as part of the game states, it is only here for convenience.
    study; // Study
    indexInGame; // Number

    currentSource; // GameSource
    currentPost; // GamePost

    constructor(study, indexInGame, currentSource, currentPost) {
        doTypeCheck(study, Study, "Game's Study");
        doTypeCheck(indexInGame, "number", "Index of State in the Game")
        doTypeCheck(currentSource, GameSource, "Game's Current Source");
        doTypeCheck(currentPost, GamePost, "Game's Current Post");
        this.study = study;
        this.indexInGame = indexInGame;
        this.currentSource = currentSource;
        this.currentPost = currentPost;
    }

    toJSON() {
        return {
            "currentSource": this.currentSource.toJSON(),
            "currentPost": this.currentPost.toJSON()
        };
    }

    static fromJSON(json, study, indexInGame) {
        return new GameState(
            study,
            indexInGame,
            GameSource.fromJSON(json["currentSource"], study),
            GamePost.fromJSON(json["currentPost"], study),
            null,
            null
        );
    }
}


function toggleReactionPresenceInArray(currentReactions, reaction, allowMultipleReactions) {
    // Skips are always mutually exclusive to other reactions.
    if (reaction === "skip") {
        if (detectReactionPresenceInArray(currentReactions, "skip"))
            return [];
        else
            return ["skip"];
    }

    // Attempt to find and remove the reaction.
    const newReactions = [];
    let foundReaction = false;
    for (let index = 0; index < currentReactions.length; ++index) {
        const currentReaction = currentReactions[index];
        if (currentReaction === reaction) {
            foundReaction = true;
        } else if (currentReaction !== "skip") {
            newReactions.push(currentReaction);
        }
    }
    if (foundReaction)
        return newReactions;
    if (!allowMultipleReactions)
        return [reaction];

    newReactions.push(reaction);
    return newReactions;
}

function detectReactionPresenceInArray(reactions, reaction) {
    for (let index = 0; index < reactions.length; ++index) {
        if (reactions[index] === reaction)
            return true;
    }
    return false;
}


/**
 * Keeps track of how long it took participants to interact with something.
 */
export class InteractionTimer {
    showTime; // Number (UNIX Milliseconds)
    firstInteractTime; // Number? (UNIX Milliseconds)
    lastInteractTime; // Number? (UNIX Milliseconds)
    hideTime; // Number? (UNIX Milliseconds)

    constructor(showTime, firstInteractTime, lastInteractTime, hideTime) {
        doTypeCheck(showTime, "number", "Time of Appearance");
        doNullableTypeCheck(firstInteractTime, "number", "Time of First Interaction");
        doNullableTypeCheck(lastInteractTime, "number", "Time of Last Interaction");
        doNullableTypeCheck(hideTime, "number", "Time of Disappearance");
        this.showTime = showTime;
        this.firstInteractTime = firstInteractTime || null;
        this.lastInteractTime = lastInteractTime || null;
        this.hideTime = hideTime || null;
    }

    static create(showTime) {
        return new InteractionTimer(showTime, null, null, null);
    }

    static start() {
        return InteractionTimer.create(Date.now());
    }

    getTimeToFirstInteractMS() {
        if (this.firstInteractTime === null)
            return NaN;

        return this.firstInteractTime - this.showTime;
    }

    getTimeToLastInteractMS() {
        if (this.lastInteractTime === null)
            return NaN;

        return this.lastInteractTime - this.showTime;
    }

    getDwellTimeMS() {
        if (this.hideTime === null)
            return NaN;

        return this.hideTime - this.showTime;
    }

    withNewInteraction() {
        if (this.hideTime !== null)
            throw new Error("The interactions have already been marked as hidden");

        const time = Date.now();
        return new InteractionTimer(
            this.showTime,
            (this.firstInteractTime !== null ? this.firstInteractTime : time),
            time,
            null
        );
    }

    complete() {
        return new InteractionTimer(
            this.showTime, this.firstInteractTime, this.lastInteractTime, Date.now()
        );
    }

    toJSON() {
        return {
            "showTime": this.showTime,
            "firstInteractTime": this.firstInteractTime,
            "lastInteractTime": this.lastInteractTime,
            "hideTime": this.hideTime
        };
    }

    static fromJSON(json) {
        return new InteractionTimer(
            json["showTime"],
            json["firstInteractTime"],
            json["lastInteractTime"],
            json["hideTime"]
        );
    }
}


/**
 * Stores the reaction of a user to a comment.
 */
export class GameCommentInteraction {
    commentIndex; // Number
    reactions; // String[]
    timer; // InteractionTimer

    constructor(commentIndex, reactions, timer) {
        doTypeCheck(commentIndex, "number", "Comment ID for Comment Reaction");
        doArrayTypeCheck(reactions, "string", "Comment Reaction");
        doTypeCheck(timer, InteractionTimer, "Comment Reaction Timer")
        this.commentIndex = commentIndex;
        this.reactions = reactions;
        this.timer = timer;
    }

    static create(commentIndex, commentReaction, postShowTime) {
        return new GameCommentInteraction(
            commentIndex, [commentReaction],
            InteractionTimer.create(postShowTime).withNewInteraction()
        )
    }

    complete() {
        return new GameCommentInteraction(
            this.commentIndex,
            this.reactions,
            this.timer.complete()
        )
    }

    withToggledReaction(reaction, allowMultipleReactions) {
        return this.withReactions(toggleReactionPresenceInArray(
            this.reactions, reaction, allowMultipleReactions
        ));
    }

    hasReaction(reaction) {
        return detectReactionPresenceInArray(this.reactions, reaction);
    }

    withReactions(reactions) {
        return new GameCommentInteraction(
            this.commentIndex,
            reactions,
            this.timer.withNewInteraction()
        );
    }

    toJSON() {
        return {
            "commentID": this.commentIndex,
            "reactions": this.reactions,
            "timer": this.timer.toJSON()
        };
    }

    static fromJSON(json, showTime) {
        const reactions = json["reactions"],
              reaction = json["reaction"],
              timerJSON = json["timer"],
              reactTimeMS = json["reactTimeMS"];

        let timer;
        if (timerJSON !== undefined) {
            timer = InteractionTimer.fromJSON(timerJSON);
        } else {
            timer = new InteractionTimer(showTime, reactTimeMS, reactTimeMS, null);
        }

        return new GameCommentInteraction(
            json["commentID"],
            (reactions !== undefined ? reactions : (reaction ? [reaction] : [])),
            timer
        );
    }
}

/**
 * Stores the interactions of a user with a set of posts.
 * This is intended to be used to help when displaying
 * posts in a feed, by allowing interactions with multiple
 * posts at once.
 */
export class GamePostInteractionStore {
    postInteractions; // {Number: GamePostInteraction}

    constructor(template) {
        this.postInteractions = {};
        if (template !== undefined) {
            const templateInteractions = template.postInteractions;
            for (let key in templateInteractions) {
                if (!templateInteractions.hasOwnProperty(key))
                    continue;

                this.postInteractions[key] = templateInteractions[key];
            }
        }
    }

    static empty() {
        return new GamePostInteractionStore();
    }

    get(postIndex) {
        let postInteraction = this.postInteractions[postIndex];
        if (postInteraction !== undefined)
            return postInteraction;

        postInteraction = GamePostInteraction.empty();
        this.postInteractions[postIndex] = postInteraction;
        return postInteraction;
    }

    update(postIndex, postInteraction) {
        const copy = new GamePostInteractionStore(this);
        copy.postInteractions[postIndex] = postInteraction;
        return copy;
    }
}

/**
 * Stores all the interactions of a user with a post.
 */
export class GamePostInteraction {
    postReactions; // String[]
    commentReactions; // GameCommentInteraction[]
    lastComment; // String?
    comment; // String?
    timer; // InteractionTimer

    constructor(postReactions, commentReactions, lastComment, comment, timer) {
        doArrayTypeCheck(postReactions, "string", "Reactions to Post");
        doArrayTypeCheck(commentReactions, GameCommentInteraction, "Reactions to Comments");
        doNullableTypeCheck(lastComment, "string", "Participant's Last Comment");
        doNullableTypeCheck(comment, "string", "Participant's Comment");
        doNullableTypeCheck(timer, InteractionTimer, "Post Reaction Timer");
        this.postReactions = postReactions;
        this.commentReactions = commentReactions;
        this.lastComment = lastComment;
        this.comment = comment;
        this.timer = timer;
    }

    static empty() {
        return new GamePostInteraction([], [], null, null, InteractionTimer.start());
    }

    complete() {
        const completedCommentReactions = [];
        for (let index = 0; index < this.commentReactions.length; ++index) {
            completedCommentReactions.push(this.commentReactions[index].complete())
        }
        return new GamePostInteraction(
            this.postReactions,
            completedCommentReactions,
            this.lastComment,
            this.comment,
            this.timer.complete()
        );
    }

    withComment(comment) {
        let lastComment;
        if (comment) {
            lastComment = comment;
        } else if (this.comment) {
            lastComment = this.comment;
        } else {
            lastComment = this.lastComment;
        }
        return new GamePostInteraction(
            this.postReactions,
            this.commentReactions,
            lastComment,
            comment,
            this.timer.withNewInteraction()
        );
    }

    withDeletedComment() {
        return new GamePostInteraction(
            this.postReactions,
            this.commentReactions,
            null,
            null,
            this.timer.withNewInteraction()
        );
    }

    withToggledPostReaction(postReaction, allowMultipleReactions) {
        return this.withPostReactions(toggleReactionPresenceInArray(
            this.postReactions, postReaction, allowMultipleReactions
        ));
    }

    hasPostReaction(postReaction) {
        return detectReactionPresenceInArray(this.postReactions, postReaction);
    }

    withPostReactions(postReactions) {
        return new GamePostInteraction(
            postReactions,
            this.commentReactions,
            this.lastComment,
            this.comment,
            this.timer.withNewInteraction()
        );
    }

    withToggledCommentReaction(commentIndex, commentReaction, allowMultipleReactions) {
        doTypeCheck(commentReaction, "string", "Comment Reaction");

        const existing = this.findCommentReaction(commentIndex);
        if (existing === null) {
            // First time interacting with the comment.
            return this.withCommentReaction(commentIndex, GameCommentInteraction.create(
                commentIndex, commentReaction, this.timer.showTime
            ));
        } else {
            // New interaction with a comment that had previous interactions.
            return this.withCommentReaction(commentIndex, existing.withToggledReaction(
                commentReaction, allowMultipleReactions
            ));
        }
    }

    withCommentReaction(commentIndex, commentReaction) {
        doNullableTypeCheck(commentReaction, GameCommentInteraction, "Comment Reaction");

        const commentReactions = [];
        for (let index = 0; index < this.commentReactions.length; ++index) {
            const existingCommentReaction = this.commentReactions[index];
            if (existingCommentReaction.commentIndex !== commentIndex) {
                commentReactions.push(existingCommentReaction);
            }
        }
        if (commentReaction !== null) {
            commentReactions.push(commentReaction);
        }

        return new GamePostInteraction(
            this.postReactions,
            commentReactions,
            this.lastComment,
            this.comment,
            this.timer.withNewInteraction()
        );
    }

    findCommentReaction(commentIndex) {
        doTypeCheck(commentIndex, "number", "Comment ID");
        for (let index = 0; index < this.commentReactions.length; ++index) {
            const commentReaction = this.commentReactions[index];
            if (commentReaction.commentIndex === commentIndex)
                return commentReaction;
        }
        return null;
    }

    static commentReactionsToJSON(commentReactions) {
        const json = [];
        for (let index = 0; index < commentReactions.length; ++index) {
            json.push(commentReactions[index].toJSON());
        }
        return json;
    }

    static commentReactionsFromJSON(json) {
        const commentReactions = [];
        for (let index = 0; index < json.length; ++index) {
            commentReactions.push(GameCommentInteraction.fromJSON(json[index]));
        }
        return commentReactions;
    }

    toJSON() {
        return {
            "postReactions": this.postReactions,
            "commentReactions": GamePostInteraction.commentReactionsToJSON(this.commentReactions),
            "comment": this.comment,
            "timer": this.timer.toJSON()
        };
    }

    static fromJSON(json) {
        const timerJSON = json["timer"],
              postShowTime = json["postShowTime"],
              firstInteractTimeMS = json["firstInteractTimeMS"],
              lastInteractTimeMS = json["lastInteractTimeMS"];

        let timer;
        if (timerJSON !== undefined) {
            timer = InteractionTimer.fromJSON(timerJSON);
        } else {
            timer = new InteractionTimer(
                postShowTime,
                (firstInteractTimeMS ? postShowTime + firstInteractTimeMS : null),
                (lastInteractTimeMS ? postShowTime + lastInteractTimeMS : null),
                null
            );
        }

        const postReactions = json["postReactions"],
              postReaction = json["postReaction"],
              comment = json["comment"];

        return new GamePostInteraction(
            (postReactions !== undefined ? postReactions : (postReaction ? [postReaction] : [])),
            GamePostInteraction.commentReactionsFromJSON(json["commentReactions"]),
            comment,
            comment,
            timer
        );
    }
}

/**
 * Stores the reactions, credibility, and followers
 * of a participant throughout the game.
 */
export class GameParticipant {
    participantID; // String?
    postInteractions; // GamePostInteraction[]
    credibility; // Number
    followers; // Number
    credibilityHistory; // Number[]
    followerHistory; // Number[]

    constructor(participantID, credibility, followers,
                postInteractions, credibilityHistory, followerHistory) {

        doNullableTypeCheck(participantID, "string", "Participant's ID");
        doTypeCheck(credibility, "number", "Participant's Credibility");
        doTypeCheck(followers, "number", "Participant's Followers");
        doNullableArrayTypeCheck(postInteractions, GamePostInteraction, "Participant's Interactions with Posts");
        doNullableArrayTypeCheck(credibilityHistory, "number", "Participant's Credibility History");
        doNullableArrayTypeCheck(followerHistory, "number", "Participant's Follower History");
        this.participantID = participantID;
        this.credibility = credibility;
        this.followers = followers;
        this.postInteractions = postInteractions || [];
        this.credibilityHistory = credibilityHistory || [credibility];
        this.followerHistory = followerHistory || [followers];
    }

    addReaction(interaction, credibilityChange, followersChange) {
        doNullableTypeCheck(interaction, GamePostInteraction, "Participant's Interactions with a Post");
        doTypeCheck(credibilityChange, "number", "Participant's Credibility Change after Reaction");
        doTypeCheck(followersChange, "number", "Participant's Followers Change after Reaction");
        this.postInteractions.push(interaction);
        this.credibility = adjustCredibility(this.credibility, credibilityChange);
        this.followers = adjustFollowers(this.followers, followersChange);
        this.credibilityHistory.push(this.credibility);
        this.followerHistory.push(this.followers);
    }

    static interactionsToJSON(interactions) {
        const json = [];
        for (let index = 0; index < interactions.length; ++index) {
            json.push(interactions[index].toJSON());
        }
        return json;
    }

    static interactionsFromJSON(json) {
        const interactions = [];
        for (let index = 0; index < json.length; ++index) {
            interactions.push(GamePostInteraction.fromJSON(json[index]));
        }
        return interactions;
    }

    toJSON() {
        return {
            "participantID": this.participantID,
            "credibility": this.credibility,
            "followers": this.followers,
            "interactions": GameParticipant.interactionsToJSON(this.postInteractions),
            "credibilityHistory": this.credibilityHistory,
            "followerHistory": this.followerHistory
        };
    }

    static fromJSON(json) {
        return new GameParticipant(
            json["participantID"],
            json["credibility"],
            json["followers"],
            GameParticipant.interactionsFromJSON(json["interactions"]),
            json["credibilityHistory"],
            json["followerHistory"]
        );
    }
}

/**
 * Provides the logic for running a game.
 */
export class Game {
    study; // Study
    studyModTime; // Number (UNIX Epoch Time in Seconds)
    sessionID; // String
    startTime; // Number (UNIX Epoch Time in Seconds)
    endTime; // Number (UNIX Epoch Time in Seconds), or null
    states; // GameState[]
    latestStatePosts; // GameSource[], or null
    latestStateSources; // GamePost[], or null
    participant; // GameParticipant
    dismissedPrompt; // Boolean
    completionCode; // String
    displayPostsWindowSize; // Number

    saveResultsToDatabasePromise; // Promise, not saved

    constructor(study, studyModTime, sessionID, startTime, endTime,
                states, participant, dismissedPrompt, completionCode) {

        doTypeCheck(study, Study, "Game Study");
        doTypeCheck(studyModTime, "number", "Game Study Modification Time");
        doTypeCheck(sessionID, "string", "Game Session ID")
        doTypeCheck(startTime, "number", "Game Start Time");
        doNullableTypeCheck(endTime, "number", "Game End Time");
        doTypeCheck(states, Array, "Game States");
        doTypeCheck(participant, GameParticipant, "Game Participant");
        doTypeCheck(dismissedPrompt, "boolean", "Whether the prompt has been dismissed");
        doNullableTypeCheck(completionCode, "string", "Game Completion Code");
        this.sessionID = sessionID;
        this.study = study;
        this.studyModTime = studyModTime;
        this.startTime = startTime;
        this.endTime = endTime || null;
        this.states = states;
        this.latestStatePosts = null;
        this.latestStateSources = null;
        this.participant = participant;
        this.dismissedPrompt = dismissedPrompt;
        this.completionCode = completionCode;
        this.displayPostsWindowSize = (study.uiSettings.displayPostsInFeed ? 5 : 1);

        this.saveResultsToDatabasePromise = null;
    }

    /**
     * Saves this game to local storage.
     */
    saveLocally() {
        if (typeof localStorage === "undefined")
            return;
        localStorage.setItem("game", JSON.stringify(this.toJSON()));
    }

    /**
     * Saves this game to the database.
     */
    saveToDatabase() {
        this.saveResultsToDatabasePromise = postResults(this.study, this);
        return this.saveResultsToDatabasePromise;
    }

    /**
     * After the game is finished, the results will automatically be
     * saved to the database. Once this upload has started, this
     * Promise will be populated to keep track of the progress of
     * that upload.
     */
    getSaveToDatabasePromise() {
        return this.saveResultsToDatabasePromise;
    }

    /**
     * Returns whether there are no more posts to show to the participant.
     */
    isFinished() {
        return this.participant.postInteractions.length >= this.study.basicSettings.length;
    }

    /**
     * Returns whether there are no states beyond the current states.
     */
    areNoNextStates() {
        const nextIndex = this.participant.postInteractions.length + this.displayPostsWindowSize;
        return nextIndex >= this.states.length;
    }

    /**
     * Returns the stage of the game that the user should be shown right now.
     */
    getCurrentStage() {
        if (!this.participant.participantID && this.study.basicSettings.requireIdentification)
            return "identification";
        if (this.isFinished())
            return "debrief";
        if (this.dismissedPrompt)
            return "game";
        return "introduction";
    }

    getCurrentStates() {
        if (this.isFinished())
            throw new Error("The game has been finished!");

        const states = [];
        const startIndex = this.participant.postInteractions.length
        const limit = Math.min(this.states.length, startIndex + this.displayPostsWindowSize);
        for (let index = startIndex; index < limit; ++index) {
            states.push(this.states[index]);
        }
        return states;
    }

    /**
     * Preloads the images required for the current state.
     */
    preloadCurrentStates() {
        if (this.isFinished())
            return;

        const states = this.getCurrentStates();
        for (let index = 0; index < states.length; ++index) {
            setTimeout(this.preloadState.bind(this, states[index]), index * 200);
        }
    }

    /**
     * Preloads the images required for the next states.
     */
    preloadNextState() {
        const nextIndex = this.participant.postInteractions.length + this.displayPostsWindowSize;
        if (nextIndex >= this.states.length)
            return;

        this.preloadState(this.states[nextIndex]);
    }

    /**
     * Preloads the images required for the given state.
     */
    preloadState(state) {
        const source = state.currentSource.source;
        const post = state.currentPost.post;

        const manager = getDataManager();
        if (source.avatar) {
            manager.getStudyImage(this.study, source.id, source.avatar);
        }
        if (!isOfType(post.content, "string")) {
            manager.getStudyImage(this.study, post.id, post.content);
        }
    }

    /**
     * Advances to the next state in the game after the participant interacted with the
     * highest current post. The highest current post is the visible post if not in
     * feed-mode, or the first visible post in feed-mode.
     *
     * @param interaction the interactions that the participant made with the highest current post.
     */
    advanceState(interaction) {
        doTypeCheck(interaction, GamePostInteraction, "Interaction with the Current Post")

        // Mark that the post is no longer accessible.
        interaction = interaction.complete();

        // Calculate and apply the changes to participant's credibility and followers.
        const postReactions = interaction.postReactions;
        let credibilityChange = 0,
            followerChange = 0;

        const post = this.getCurrentStates()[0].currentPost.post;
        for (let index = 0; index < postReactions.length; ++index) {
            const reaction = postReactions[index];
            if (reaction === "skip")
                continue;

            credibilityChange += post.changesToCredibility[reaction].sample();
            followerChange += post.changesToFollowers[reaction].sample();
        }
        this.participant.addReaction(interaction, credibilityChange, followerChange);

        // Generate a completion code when the game is finished.
        if (this.isFinished()) {
            if (this.study.advancedSettings.genCompletionCode) {
                this.completionCode = this.study.generateRandomCompletionCode();
            }
            this.endTime = getUnixEpochTimeSeconds();
        }

        // Allows us to restore the game if the user refreshes the page.
        this.saveLocally();

        // Allows us to create the results for this game.
        if (this.isFinished()) {
            this.saveToDatabase();
        }
    }

    calculateAllStates() {
        while (this.states.length < this.study.basicSettings.length) {
            this.calculateNextState();
        }
    }

    calculateNextState() {
        if (this.states.length >= this.study.basicSettings.length)
            throw new Error("Already calculated all states for study");

        // Get or create the sources and posts arrays.
        let currentSources = this.latestStateSources;
        let currentPosts = this.latestStatePosts;
        if (currentSources === null || currentPosts === null) {
            currentSources = [];
            currentPosts = [];
            for (let index = 0; index < this.study.sources.length; ++index) {
                currentSources.push(
                    GameSource.sampleNewSource(this.study, this.study.sources[index])
                );
            }
            for (let index = 0; index < this.study.posts.length; ++index) {
                currentPosts.push(
                    GamePost.sampleNewPost(this.study, this.study.posts[index])
                );
            }
        }

        // Make the source/post selection.
        const selectionMethod = this.study.sourcePostSelectionMethod;
        const sourcePostPair = selectionMethod.makeSelection(this.states.length, currentSources, currentPosts);
        const selectedSource = GameSource.findById(currentSources, sourcePostPair[0]);
        const selectedPost = GamePost.findById(currentPosts, sourcePostPair[1]);

        // Adjust the state of the source and post.
        const credibilityChangeDist = selectedPost.post.changesToCredibility.share;
        const followersChangeDist = selectedPost.post.changesToFollowers.share;
        const newSource = selectedSource.adjustAfterPost(
            // These may be missing if shares are disabled.
            (credibilityChangeDist ? credibilityChangeDist.sample() : 0),
            (followersChangeDist ? followersChangeDist.sample() : 0)
        );
        const newPost = selectedPost.adjustAfterShown();

        // Create the new source & post arrays after they've been shown.
        const nextSources = [];
        const nextPosts = [];
        for (let index = 0; index < currentSources.length; ++index) {
            const source = currentSources[index];
            nextSources.push(source.source.id === newSource.source.id ? newSource : source);
        }
        for (let index = 0; index < currentPosts.length; ++index) {
            const post = currentPosts[index];
            nextPosts.push(post.post.id === newPost.post.id ? newPost : post);
        }

        // Create the new state.
        const newState = new GameState(this.study, this.states.length, selectedSource, selectedPost);
        this.states.push(newState);
        this.latestStateSources = nextSources;
        this.latestStatePosts = nextPosts;
        return newState;
    }

    static statesToJSON(states) {
        const jsonStates = [];
        for (let index = 0; index < states.length; ++index) {
            jsonStates.push(states[index].toJSON());
        }
        return jsonStates;
    }

    static statesFromJSON(json, study) {
        const states = [];
        for (let index = 0; index < json.length; ++index) {
            states.push(GameState.fromJSON(json[index], study, index));
        }
        return states;
    }

    toJSON() {
        const json = {
            "studyID": this.study.id,
            "studyModTime": this.studyModTime,
            "sessionID": this.sessionID,
            "startTime": this.startTime,
            "endTime": this.endTime,
            "states": Game.statesToJSON(this.states),
            "participant": this.participant.toJSON(),
            "dismissedPrompt": this.dismissedPrompt,
            "completionCode": this.completionCode || null  // Firebase doesn't like undefined
        };
        return json;
    }

    static fromJSON(json, study) {
        // We used to store the whole study settings in the results.
        let studyModTime;
        if (json["study"] !== undefined) {
            const legacyStudy = Study.fromJSON(json["studyID"], json["study"]);
            studyModTime = legacyStudy.lastModifiedTime;
        } else {
            studyModTime = json["studyModTime"]
        }
        return new Game(
            study, studyModTime,
            json["sessionID"],
            json["startTime"],
            json["endTime"],
            Game.statesFromJSON(json["states"], study),
            GameParticipant.fromJSON(json["participant"]),
            json["dismissedPrompt"],
            json["completionCode"] || null
        );
    }

    /**
     * Creates a new game for a participant in {@param study}.
     */
    static createNew(study) {
        if (isOfType(study, BrokenStudy))
            throw new Error("The study is broken: " + study.error);

        doTypeCheck(study, Study, "Game Study");
        const sessionID = generateUID();
        const participant = new GameParticipant(null, 50, 0);
        const game = new Game(
            study, study.lastModifiedTime, sessionID,
            getUnixEpochTimeSeconds(),
            null, [], participant, false
        );
        game.calculateAllStates();
        game.saveLocally();
        return game;
    }
}

/**
 * Converts {@param game} to JSON and back, and
 * returns an array with all changes between
 * the original game and the reconstructed one.
 * This should return an empty array if everything
 * is working correctly.
 */
export function getGameChangesToAndFromJSON(game) {
    // Convert to JSON.
    const jsonObject = compressJson(game.toJSON());
    const jsonString = JSON.stringify(jsonObject);

    // Convert from JSON.
    const reconstructedJSON = decompressJson(JSON.parse(jsonString));
    const reconstructedGame = Game.fromJSON(reconstructedJSON, game.study);

    // Do the diff on the JSON created from each, as
    // doing it on the full objects is too slow. It's
    // not ideal, but it should be good enough.
    return odiff(jsonObject, compressJson(reconstructedGame.toJSON()));
}

