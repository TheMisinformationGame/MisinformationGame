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

    addUsedSources(usedSources) {
        for (let index = 0; index < this.post.comments.length; ++index) {
            usedSources.add(this.post.comments[index].sourceID);
        }
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

    currentSource; // GameSource
    currentPost; // GamePost
    sources; // GameSource[]
    posts; // GamePost[]

    constructor(study, currentSource, currentPost, sources, posts) {
        doTypeCheck(study, Study, "Game's Study");
        doTypeCheck(currentSource, GameSource, "Game's Current Source");
        doTypeCheck(currentPost, GamePost, "Game's Current Post");
        doTypeCheck(sources, Array, "Game's Sources");
        doTypeCheck(posts, Array, "Game's Posts");
        this.study = study;
        this.currentSource = currentSource;
        this.currentPost = currentPost;
        this.sources = sources;
        this.posts = posts;
    }

    findSource(id) {
        for (let index = 0; index < this.sources.length; ++index) {
            const source = this.sources[index];
            if (source.source.id === id)
                return source;
        }
        throw new Error("Could not find source with ID " + id);
    }

    addUsedSourcesAndPosts(usedSources, usedPosts) {
        usedSources.add(this.currentSource.source.id);
        usedPosts.add(this.currentPost.post.id);
        this.currentPost.addUsedSources(usedSources);
        for (let index = 0; index < this.sources.length; ++index) {
            usedSources.add(this.sources[index].source.id);
        }
        for (let index = 0; index < this.posts.length; ++index) {
            usedPosts.add(this.posts[index].post.id);
            this.posts[index].addUsedSources(usedSources);
        }
    }

    static sourcesToJSON(sources) {
        const sourcesJSON = [];
        for (let index = 0; index < sources.length; ++index) {
            sourcesJSON.push(sources[index].toJSON());
        }
        return sourcesJSON;
    }

    static postsToJSON(posts) {
        const postsJSON = [];
        for (let index = 0; index < posts.length; ++index) {
            postsJSON.push(posts[index].toJSON());
        }
        return postsJSON;
    }

    static sourcesFromJSON(json, study) {
        const sources = [];
        for (let index = 0; index < json.length; ++index) {
            sources.push(GameSource.fromJSON(json[index], study));
        }
        return sources;
    }

    static postsFromJSON(json, study) {
        const posts = [];
        for (let index = 0; index < json.length; ++index) {
            posts.push(GamePost.fromJSON(json[index], study));
        }
        return posts;
    }

    toJSON() {
        return {
            "currentSource": this.currentSource.toJSON(),
            "currentPost": this.currentPost.toJSON(),
            "sources": GameState.sourcesToJSON(this.sources),
            "posts": GameState.postsToJSON(this.posts)
        };
    }

    static fromJSON(json, study) {
        return new GameState(
            study,
            GameSource.fromJSON(json["currentSource"], study),
            GamePost.fromJSON(json["currentPost"], study),
            GameState.sourcesFromJSON(json["sources"], study),
            GameState.postsFromJSON(json["posts"], study)
        );
    }
}

/**
 * Stores the reaction of a user to a comment.
 */
export class GameCommentReaction {
    commentIndex; // Number
    reaction; // String
    reactTimeMS; // Number

    constructor(commentIndex, reaction, reactTimeMS) {
        doTypeCheck(commentIndex, "number", "Comment ID for Comment Reaction");
        doTypeCheck(reaction, "string", "Comment Reaction");
        doTypeCheck(reactTimeMS, "number", "Comment Reaction Time")
        this.commentIndex = commentIndex;
        this.reaction = reaction;
        this.reactTimeMS = reactTimeMS;
    }

    toJSON() {
        return {
            "commentID": this.commentIndex,
            "reaction": this.reaction,
            "reactTimeMS": this.reactTimeMS
        };
    }

    static fromJSON(json) {
        return new GameCommentReaction(
            json["commentID"],
            json["reaction"],
            json["reactTimeMS"]
        );
    }
}

/**
 * Stores all of the interactions of a user with a post.
 */
export class GamePostInteraction {
    postShowTime; // Number (UNIX Milliseconds)

    postReaction; // String?
    commentReactions; // GameCommentReaction[]
    comment; // String?

    firstInteractTimeMS; // Number? (Milliseconds)
    lastInteractTimeMS; // Number? (Milliseconds)

    constructor(postShowTime, postReaction, commentReactions, comment, firstInteractTimeMS, lastInteractTimeMS) {
        doTypeCheck(postShowTime, "number", "Time the Post was Shown");
        doNullableTypeCheck(postReaction, "string", "Reaction to Post");
        doArrayTypeCheck(commentReactions, GameCommentReaction, "Reactions to Comments");
        doNullableTypeCheck(comment, "string", "Participant's Comment");
        doNullableTypeCheck(firstInteractTimeMS, "number", "First Time to Interact with Post");
        doNullableTypeCheck(lastInteractTimeMS, "number", "Last Time to Interact with Post");
        this.postShowTime = postShowTime;
        this.postReaction = postReaction;
        this.commentReactions = commentReactions;
        this.comment = comment;
        this.firstInteractTimeMS = firstInteractTimeMS || null;
        this.lastInteractTimeMS = lastInteractTimeMS || null;
    }

    static empty() {
        return new GamePostInteraction(Date.now(), null, [], null, -1, -1);
    }

    withUpdatedInteractTime() {
        const timeMS = Date.now() - this.postShowTime;
        const firstInteractTimeMS = (this.firstInteractTimeMS === null ? timeMS : this.firstInteractTimeMS);
        const lastInteractTimeMS = timeMS;
        return new GamePostInteraction(
            this.postShowTime, this.postReaction, this.commentReactions,
            this.comment, firstInteractTimeMS, lastInteractTimeMS
        );
    }

    withComment(comment) {
        return new GamePostInteraction(
            this.postShowTime,
            this.postReaction,
            this.commentReactions,
            comment
        ).withUpdatedInteractTime();
    }

    withToggledPostReaction(postReaction) {
        // We want clicking the same reaction twice to toggle it.
        if (this.postReaction === postReaction) {
            postReaction = null;
        }
        return this.withPostReaction(postReaction);
    }

    withPostReaction(postReaction) {
        return new GamePostInteraction(
            this.postShowTime,
            postReaction,
            this.commentReactions,
            this.comment
        ).withUpdatedInteractTime();
    }

    withToggledCommentReaction(commentIndex, commentReaction) {
        doNullableTypeCheck(commentReaction, "string", "Comment Reaction");

        const existing = this.findCommentReaction(commentIndex);
        if (existing === null || existing.reaction !== commentReaction) {
            return this.withCommentReaction(
                commentIndex,
                new GameCommentReaction(
                    commentIndex, commentReaction, Date.now() - this.postShowTime
                )
            );
        } else {
            return this.withCommentReaction(commentIndex, null);
        }
    }

    withCommentReaction(commentIndex, commentReaction) {
        doNullableTypeCheck(commentReaction, GameCommentReaction, "Comment Reaction");

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
            this.postShowTime,
            this.postReaction,
            commentReactions,
            this.comment
        ).withUpdatedInteractTime();
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

    findCommentReactionString(commentIndex) {
        const reaction = this.findCommentReaction(commentIndex);
        return reaction === null ? null : reaction.reaction;
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
            commentReactions.push(GameCommentReaction.fromJSON(json[index]));
        }
        return commentReactions;
    }

    toJSON() {
        return {
            "postShowTime": this.postShowTime,
            "postReaction": this.postReaction,
            "commentReactions": GamePostInteraction.commentReactionsToJSON(this.commentReactions),
            "comment": this.comment,
            "firstInteractTimeMS": this.firstInteractTimeMS,
            "lastInteractTimeMS": this.lastInteractTimeMS
        };
    }

    static fromJSON(json) {
        return new GamePostInteraction(
            json["postShowTime"],
            json["postReaction"],
            GamePostInteraction.commentReactionsFromJSON(json["commentReactions"]),
            json["comment"],
            json["firstInteractTimeMS"],
            json["lastInteractTimeMS"]
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
    sessionID; // String
    study; // Study
    startTime; // Number (UNIX Epoch Time in Seconds)
    endTime; // Number (UNIX Epoch Time in Seconds), or null
    states; // GameState[]
    participant; // GameParticipant
    dismissedPrompt; // Boolean
    completionCode; // String

    saveResultsToDatabasePromise; // Promise, not saved

    constructor(sessionID, study, startTime, endTime, states, participant, dismissedPrompt, completionCode) {
        doTypeCheck(sessionID, "string", "Game Session ID")
        doTypeCheck(study, Study, "Game Study");
        doTypeCheck(startTime, "number", "Game Start Time");
        doNullableTypeCheck(endTime, "number", "Game End Time");
        doTypeCheck(states, Array, "Game States");
        doTypeCheck(participant, GameParticipant, "Game Participant");
        doTypeCheck(dismissedPrompt, "boolean", "Whether the prompt has been dismissed");
        doNullableTypeCheck(completionCode, "string", "Game Completion Code");
        this.sessionID = sessionID;
        this.study = study;
        this.startTime = startTime;
        this.endTime = endTime || null;
        this.states = states;
        this.participant = participant;
        this.dismissedPrompt = dismissedPrompt;
        this.completionCode = completionCode;

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
        return this.participant.postInteractions.length >= this.study.length;
    }

    /**
     * Returns the stage of the game that the user should be shown right now.
     */
    getCurrentStage() {
        if (!this.participant.participantID && this.study.requireIdentification)
            return "identification";
        if (this.isFinished())
            return "debrief";
        if (this.dismissedPrompt)
            return "game";
        return "introduction";
    }

    getCurrentState() {
        if (this.isFinished())
            throw new Error("The game has been finished!");

        return this.states[this.participant.postInteractions.length];
    }

    /**
     * Preloads the images required for the current state.
     */
    preloadCurrentState() {
        if (this.isFinished())
            return;
        this.preloadState(this.getCurrentState());
    }

    /**
     * Preloads the images required for the next state.
     */
    preloadNextState() {
        const nextStateIndex = this.participant.postInteractions.length + 1;
        if (nextStateIndex >= this.states.length)
            return;

        this.preloadState(this.states[nextStateIndex]);
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
     * Advances to the next state in the game after the
     * participant interacted with a post.
     *
     * @param interactions the interactions that the participant made with the post.
     */
    advanceState(interactions) {
        doTypeCheck(interactions, GamePostInteraction, "Interaction with the Current Post")

        const postReaction = interactions.postReaction;
        if (postReaction === "skip" || postReaction === null) {
            this.participant.addReaction(interactions, 0, 0);
        } else {
            const post = this.getCurrentState().currentPost.post;
            this.participant.addReaction(
                interactions,
                post.changesToCredibility[postReaction].sample(),
                post.changesToFollowers[postReaction].sample()
            );
        }

        // Generate a completion code when the game is finished.
        if (this.isFinished()) {
            if (this.study.genCompletionCode) {
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

    /**
     * Returns all source and post IDs used in this game.
     * @return [string[], string[]] containing [Source IDs, Post IDs]
     */
    findUsedSourcesAndPosts() {
        const usedSources = new Set();
        const usedPosts = new Set();
        for (let index = 0; index < this.states.length; ++index) {
            this.states[index].addUsedSourcesAndPosts(usedSources, usedPosts);
        }
        return [[...usedSources.values()], [...usedPosts.values()]];
    }

    calculateAllStates() {
        while (this.states.length < this.study.length) {
            this.calculateNextState();
        }
    }

    calculateNextState() {
        if (this.states.length >= this.study.length)
            throw new Error("Already calculated all states for study");

        // Get or create the sources and posts arrays.
        let currentSources, currentPosts;
        if (this.states.length > 0) {
            const currentState = this.states[this.states.length - 1];
            currentSources = currentState.sources;
            currentPosts = currentState.posts;
        } else {
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
        const newState = new GameState(this.study, selectedSource, selectedPost, nextSources, nextPosts);
        this.states.push(newState);
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
            states.push(GameState.fromJSON(json[index], study));
        }
        return states;
    }

    toJSON() {
        const json = {
            "sessionID": this.sessionID,
            "studyID": this.study.id,
            "study": this.study.toJSON(),
            "startTime": this.startTime,
            "endTime": this.endTime,
            "states": Game.statesToJSON(this.states),
            "participant": this.participant.toJSON(),
            "dismissedPrompt": this.dismissedPrompt,
            "completionCode": this.completionCode || null  // Firebase doesn't like undefined
        };
        return json;
    }

    static fromJSON(json) {
        const studyID = json["studyID"];
        const study = Study.fromJSON(studyID, json["study"]);
        return new Game(
            json["sessionID"],
            study,
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
        const game = new Game(sessionID, study, getUnixEpochTimeSeconds(), null, [], participant, false);
        game.calculateAllStates();
        game.saveLocally();
        return game;
    }
}

/**
 * Converts {@param game} to JSON and back, and
 * returns an array with all of the changes between
 * the original game and the reconstructed one.
 * This should return an empty array if everything
 * is working correctly.
 */
export function getGameChangesToAndFromJSON(game) {
    // Convert to JSON.
    const jsonObject = game.toJSON();
    const jsonString = JSON.stringify(jsonObject);

    // Convert from JSON.
    const reconstructedJSON = JSON.parse(jsonString);
    const reconstructedGame = Game.fromJSON(reconstructedJSON);

    // Do the diff on the JSON created from each, as
    // doing it on the full objects is too slow. Its
    // not ideal, but it should be good enough.
    return odiff(jsonObject, reconstructedGame.toJSON());
}

