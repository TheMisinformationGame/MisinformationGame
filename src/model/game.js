/**
 * A source with a known credibility and follower count.
 */
import {doTypeCheck} from "../utils/types";
import {BasePost, BaseSource, Study} from "./study";
import {selectFilteredRandomElement, selectFilteredWeightedRandomElement} from "../utils/random";


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
    source; // String
    credibility; // Number
    followers; // Number
    remainingUses; // Number

    constructor(source, credibility, followers, remainingUses) {
        doTypeCheck(source, BaseSource);
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
     * Selects a random source to show, weighted by source's max posts.
     */
    static selectRandomSource(sources) {
        return selectFilteredWeightedRandomElement(
            sources,
            (source) => source.remainingUses === -1 || source.remainingUses > 0,
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
    static sampleNewSource(source) {
        doTypeCheck(source, BaseSource);
        const credibility = source.credibility.sample();
        const followers = source.followers.sample();
        return new GameSource(source, credibility, followers, source.maxPosts);
    }
}

/**
 * A post in the game that may have been shown already.
 */
export class GamePost {
    post; // BasePost
    shown; // Bool

    constructor(post, shown) {
        doTypeCheck(post, BasePost);
        this.post = post;
        this.shown = !!shown;
    }

    /**
     * Returns a new GamePost for this post after it has been shown.
     */
    adjustAfterShown() {
        return new GamePost(this.post, true);
    }

    /**
     * Selects a random post to show, with a {@param truePostPercentage}
     * percent chance of selecting a true post.
     *
     * @param posts The array of posts to choose from.
     * @param truePostPercentage A percentage value between 0 and 100.
     */
    static selectRandomPost(posts, truePostPercentage) {
        const selectTruePosts = Math.random() * 100 < truePostPercentage;
        return selectFilteredRandomElement(posts, (post) => selectTruePosts === post.post.isTrue);
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
}

/**
 * Holds the current state of a game.
 */
export class GameState {
    currentSource; // GameSource
    currentPost; // GamePost
    sources; // GameSource[]
    posts; // GamePost[]

    constructor(currentSource, currentPost, sources, posts) {
        doTypeCheck(currentSource, GameSource);
        doTypeCheck(currentPost, GamePost);
        doTypeCheck(sources, Array);
        doTypeCheck(posts, Array);
        this.currentSource = currentSource;
        this.currentPost = currentPost;
        this.sources = sources;
        this.posts = posts;
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
        if (!["like", "dislike", "share", "flag", "skip"].includes(reaction))
            throw new Error("Unknown reaction " + reaction);

        if (reaction === "skip") {
            this.participant.addReaction(reaction, 0, 0);
        } else {
            const post = this.getCurrentState().currentPost;
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
                currentSources.push(GameSource.sampleNewSource(this.study.sources[index]));
            }
            for (let index = 0; index < this.study.posts.length; ++index) {
                currentPosts.push(new GamePost(this.study.posts[index]));
            }
        }

        // Make the source/post selection.
        const selectionMethod = this.study.sourcePostSelectionMethod;
        const sourcePostPair = selectionMethod.makeSelection(this.states.length, currentSources, currentPosts);
        const selectedSource = GameSource.findById(currentSources, sourcePostPair[0]);
        const selectedPost = GamePost.findById(currentPosts, sourcePostPair[1]);

        // Adjust the state of the source and post.
        const newSource = selectedSource.adjustAfterPost(
            selectedPost.post.changesToCredibility.share.sample(),
            selectedPost.post.changesToFollowers.share.sample()
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
        const newState = new GameState(newSource, newPost, nextSources, nextPosts);
        this.states.push(newState);
        return newState;
    }
}