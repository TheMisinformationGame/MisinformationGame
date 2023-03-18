import {doArrayTypeCheck, doNullableTypeCheck, doTypeCheck} from "../../utils/types";
import {Post, PostComment, Source, Study} from "../study";
import {filterArray, selectRandomElement, selectWeightedRandomElement} from "../../utils/random";


/**
 * Adjusts the current credibility of a source or participant,
 * and returns their new credibility.
 */
export function adjustCredibility(current, change) {
    return Math.max(0, Math.min(current + change, 100));
}

/**
 * Adjusts the current followers of a source or participant,
 * and returns their new followers.
 */
export function adjustFollowers(current, change) {
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
        const availableSources = filterArray(
            sources,
            (source) => source.remainingUses === -1 || source.remainingUses > 0
        );
        if (availableSources.length === 0)
            throw new Error("All sources hit their maximum number of posts");

        return selectWeightedRandomElement(
            availableSources,
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
        const availablePosts = filterArray(posts, (post) => !post.shown);
        if (availablePosts.length === 0)
            throw new Error("Used up all available posts");

        return selectRandomElement(
            availablePosts,
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
