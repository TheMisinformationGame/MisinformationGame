/**
 * A source with a known credibility and follower count.
 */
import {doTypeCheck} from "../utils/types";
import {BasePost, BaseSource, Study} from "./study";


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
    sourceID; // String
    credibility; // Number
    followers; // Number
    remainingUses; // Number

    constructor(source, credibility, followers, remainingUses) {
        doTypeCheck(source, "string");
        doTypeCheck(credibility, "number");
        doTypeCheck(followers, "number");
        doTypeCheck(remainingUses, "number");
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
        return new GameSource(this.source, newCredibility, newFollowers, newUses);
    }

    /**
     * Creates a new source for use in the game by sampling its
     * credibility and followers from the supplied distribution.
     */
    static sampleNewSource(source) {
        doTypeCheck(source, BaseSource);
        const credibility = source.credibility.sample();
        const followers = source.followers.sample();
        return new GameSource(source.id, credibility, followers, source.maxPosts);
    }
}

/**
 * Holds the current state of a game.
 */
export class GameState {
    currentSource; // GameSource
    currentPostID; // String
    sources; // GameSource[]

    constructor(currentSource, currentPostID, sources) {
        doTypeCheck(currentSource, GameSource);
        doTypeCheck(currentPostID, "string");
        doTypeCheck(sources, Array);
        this.currentSource = currentSource;
        this.currentPostID = currentPostID;
        this.sources = sources;
    }
}

/**
 * Stores the reactions, credibility, and followers
 * of a participant throughout the game.
 */
export class GameParticipant {
    credibility; // Number
    followers; // Number
    reactions; // String[]
    credibilityHistory; // Number[]
    followerHistory; // Number[]

    constructor(credibility, followers) {
        doTypeCheck(credibility, "number");
        doTypeCheck(followers, "number");
        this.credibility = credibility;
        this.followers = followers;
        this.reactions = [];
        this.credibilityHistory = [];
        this.followerHistory = [];
    }

    addReaction(reaction, credibilityChange, followersChange) {
        this.reactions.push(reaction);
        this.credibilityHistory.push(this.credibility);
        this.followerHistory.push(this.followers);

        this.credibility = adjustCredibility(this.credibility, credibilityChange);
        this.followers = adjustFollowers(this.followers, followersChange);
    }
}

/**
 * Provides the logic for running a game.
 */
export class Game {
    study; // Study
    states; // GameState[]
    participant; // GameParticipant

    constructor(study) {
        doTypeCheck(study, Study);
        this.study = study;
        this.states = [];
        this.participant = new GameParticipant(100, 0);
        this.calculateAllStates();
    }

    isFinished() {
        return this.participant.reactions.length >= this.study.length;
    }

    getCurrentState() {
        if (this.isFinished())
            throw new Error("The game has been finished!");

        return this.states[this.participant.reactions.length];
    }

    /**
     * Advances to the next state in the game after the
     * participant reacted with {@param reaction} to the
     * current post.
     *
     * @param reaction can be one of "like", "dislike",
     *                 "share", "flag", or "skip".
     */
    advanceState(reaction) {
        if (["like", "dislike", "share", "flag", "skip"].indexOf(reaction) === -1)
            throw new Error("Unknown reaction " + reaction);

        if (reaction === "skip") {
            this.participant.addReaction(reaction, 0, 0);
        } else {
            const state = this.getCurrentState();
            const post = this.study.getPost(state.currentPostID);
            this.participant.addReaction(
                reaction,
                post.changesToCredibility[reaction].sample(),
                post.changesToFollowers[reaction].sample()
            );
        }
    }

    calculateAllStates() {
        while (this.states.length < this.study.length) {
            this.calculateNextState();
        }
    }

    calculateNextState() {
        if (this.states.length >= this.study.length)
            throw new Error("Already calculated all states for study");

        let currentSources;
        if (this.states.length > 0) {
            const currentState = this.states[this.states.length - 1];
            currentSources = currentState.sources;
        } else {
            currentSources = [];
            for (let index = 0; index < this.study.sources; ++index) {
                currentSources.push(GameSource.sampleNewSource(this.study.sources[index]));
            }
        }

        const selectionMethod = this.study.sourcePostSelectionMethod;
        const sourcePostPair = selectionMethod.makeSelection(this.states.length, currentSources);
        const selectedSource = sourcePostPair[0];
        const selectedPost = sourcePostPair[1];
        doTypeCheck(selectedSource, GameSource);
        doTypeCheck(selectedPost, "string");

        // Adjust the credibility and followers of the source.
        const newSource = selectedSource.adjustAfterPost(
            selectedPost.changesToCredibility.share.sample(),
            selectedPost.changesToFollowers.share.sample()
        );

        // Replace the adjusted source in the sources for the next state.
        const nextSources = [];
        for (let index = 0; index < currentSources.length; ++index) {
            const source = currentSources[index];
            if (source.sourceID === newSource.sourceID) {
                nextSources.push(newSource);
            } else {
                nextSources.push(source);
            }
        }

        const newState = new GameState(newSource, selectedPost, nextSources);
        this.states.push(newState);
        return newState;
    }
}