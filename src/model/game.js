/**
 * A source with a known credibility and follower count.
 */
import {doNullableTypeCheck, doTypeCheck, isOfType} from "../utils/types";
import {Post, Source, Study} from "./study";
import {selectFilteredRandomElement, selectFilteredWeightedRandomElement} from "../utils/random";
import {odiff} from "../utils/odiff";
import {getDataManager} from "./manager";


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
        doTypeCheck(study, Study);
        doTypeCheck(source, Source);
        doTypeCheck(credibility, "number");
        doTypeCheck(followers, "number");
        doTypeCheck(remainingUses, "number");
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
        doTypeCheck(source, Source);
        const credibility = source.credibility.sample();
        const followers = source.followers.sample();
        return new GameSource(study, source, credibility, followers, source.maxPosts);
    }
}

/**
 * A post in the game that may have been shown already.
 */
export class GamePost {
    // The study is not saved as part of the game states, it is only here for convenience.
    study; // Study

    post; // BasePost
    shown; // Bool

    constructor(study, post, shown) {
        doTypeCheck(study, Study);
        doTypeCheck(post, Post);
        this.study = study;
        this.post = post;
        this.shown = !!shown;
    }

    /**
     * Returns a new GamePost for this post after it has been shown.
     */
    adjustAfterShown() {
        return new GamePost(this.study, this.post, true);
    }

    addUsedSources(usedSources) {
        for (let index = 0; index < this.post.comments.length; ++index) {
            usedSources.add(this.post.comments[index].sourceID);
        }
    }

    toJSON() {
        return {
            "postID": this.post.id,
            "shown": this.shown
        };
    }

    static fromJSON(json, study) {
        return new GamePost(
            study,
            study.getPost(json["postID"]),
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
        const selectTruePosts = Math.random() < truePostPercentage;
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
    // The study is not saved as part of the game states, it is only here for convenience.
    study; // Study

    currentSource; // GameSource
    currentPost; // GamePost
    sources; // GameSource[]
    posts; // GamePost[]

    constructor(study, currentSource, currentPost, sources, posts) {
        doTypeCheck(study, Study);
        doTypeCheck(currentSource, GameSource);
        doTypeCheck(currentPost, GamePost);
        doTypeCheck(sources, Array);
        doTypeCheck(posts, Array);
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
 * Stores the reactions, credibility, and followers
 * of a participant throughout the game.
 */
export class GameParticipant {
    credibility; // Number
    followers; // Number
    reactions; // String[]
    credibilityHistory; // Number[]
    followerHistory; // Number[]

    constructor(credibility, followers, reactions, credibilityHistory, followerHistory) {
        doTypeCheck(credibility, "number");
        doTypeCheck(followers, "number");
        doNullableTypeCheck(reactions, Array);
        doNullableTypeCheck(credibilityHistory, Array);
        doNullableTypeCheck(followerHistory, Array);
        this.credibility = credibility;
        this.followers = followers;
        this.reactions = reactions || [];
        this.credibilityHistory = credibilityHistory || [];
        this.followerHistory = followerHistory || [];
    }

    addReaction(reaction, credibilityChange, followersChange) {
        this.reactions.push(reaction);
        this.credibilityHistory.push(this.credibility);
        this.followerHistory.push(this.followers);

        this.credibility = adjustCredibility(this.credibility, credibilityChange);
        this.followers = adjustFollowers(this.followers, followersChange);
    }

    toJSON() {
        return {
            "credibility": this.credibility,
            "followers": this.followers,
            "reactions": this.reactions,
            "credibilityHistory": this.credibilityHistory,
            "followerHistory": this.followerHistory
        };
    }

    static fromJSON(json) {
        return new GameParticipant(
            json["credibility"],
            json["followers"],
            json["reactions"],
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
    states; // GameState[]
    participant; // GameParticipant
    dismissedPrompt; // boolean

    constructor(study, states, participant, dismissedPrompt) {
        doTypeCheck(study, Study);
        doTypeCheck(states, Array);
        doTypeCheck(participant, GameParticipant);
        doTypeCheck(dismissedPrompt, "boolean")
        this.study = study;
        this.states = states;
        this.participant = participant;
        this.dismissedPrompt = dismissedPrompt;
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
     * Preloads the images required for the current state.
     */
    preloadCurrentState() {
        this.preloadState(this.getCurrentState());
    }

    /**
     * Preloads the images required for the next state.
     */
    preloadNextState() {
        const nextStateIndex = this.participant.reactions.length + 1;
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
        manager.getStudyImage(this.study, source.id, source.avatar);
        if (!isOfType(post.content, "string")) {
            manager.getStudyImage(this.study, post.id, post.content);
        }
        for (let index = 0; index < post.comments.length; ++index) {
            const commentSource = state.findSource(post.comments[index].sourceID).source;
            manager.getStudyImage(this.study, commentSource.id, commentSource.avatar);

        }
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
            const post = this.getCurrentState().currentPost.post;
            this.participant.addReaction(
                reaction,
                post.changesToCredibility[reaction].sample(),
                post.changesToFollowers[reaction].sample()
            );
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
                currentPosts.push(new GamePost(this.study, this.study.posts[index]));
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
        const newState = new GameState(this.study, newSource, newPost, nextSources, nextPosts);
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
        return {
            "studyID": this.study.id,
            "study": this.study.toJSON(),
            "states": Game.statesToJSON(this.states),
            "participant": this.participant.toJSON(),
            "dismissedPrompt": this.dismissedPrompt
        };
    }

    static fromJSON(json) {
        const studyID = json["studyID"];
        const study = Study.fromJSON(studyID, json["study"]);
        return new Game(
            study,
            Game.statesFromJSON(json["states"], study),
            GameParticipant.fromJSON(json["participant"]),
            json["dismissedPrompt"]
        );
    }

    /**
     * Creates a new game for a participant in {@param study}.
     */
    static createNew(study) {
        doTypeCheck(study, Study);
        const game = new Game(study, [], new GameParticipant(100, 0), false);
        game.calculateAllStates();
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
    // Convert to and from JSON.
    const converted = Game.fromJSON(game.toJSON());

    // Do the diff on the JSON created from each, as
    // doing it on the full objects is too slow. Its
    // not ideal, but it should be good enough.
    return odiff(game.toJSON(), converted.toJSON());
}
