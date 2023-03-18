import {doArrayTypeCheck, doNullableTypeCheck, doTypeCheck, isOfType} from "../../utils/types";
import {BrokenStudy, Study} from "../study";
import {odiff} from "../../utils/odiff";
import {getDataManager} from "../manager";
import { postResults } from "../../database/postToDB";
import {generateUID} from "../../utils/uid";
import {getUnixEpochTimeSeconds} from "../../utils/time";
import {compressJson, decompressJson} from "../../database/compressJson";
import {GamePostInteraction, GamePostInteractionStore} from "./interactions";
import {GamePost, GameSource, GameState} from "./gameState";
import {GameParticipant} from "./gameParticipant";


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
    completionCode; // String

    saveResultsToDatabasePromise; // Promise, not saved

    constructor(study, studyModTime, sessionID, startTime, endTime,
                states, participant, completionCode) {

        doTypeCheck(study, Study, "Game Study");
        doTypeCheck(studyModTime, "number", "Game Study Modification Time");
        doTypeCheck(sessionID, "string", "Game Session ID")
        doTypeCheck(startTime, "number", "Game Start Time");
        doNullableTypeCheck(endTime, "number", "Game End Time");
        doTypeCheck(states, Array, "Game States");
        doTypeCheck(participant, GameParticipant, "Game Participant");
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
        return this.participant.postInteractions.getSubmittedPostsCount() >= this.study.basicSettings.length;
    }

    /**
     * Returns the stage of the game that the user should be shown right now.
     */
    getCurrentStage() {
        if (!this.participant.participantID && this.study.basicSettings.requireIdentification)
            return "identification";
        if (this.isFinished())
            return "debrief";
        if (this.participant.postInteractions.getSubmittedPostsCount() > 0)
            return "game";
        return "introduction-or-game";
    }

    getState(index) {
        if (this.isFinished())
            throw new Error("The game has been finished!");

        return this.states[index];
    }

    /**
     * Preloads the images required for the next states.
     */
    preloadNextState() {
        const nextIndex = this.participant.postInteractions.getSubmittedPostsCount() + 1;
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
     * Updates the state of the game based upon the given interactions.
     *
     * @param interactions all interactions that the participant made with posts in the game.
     */
    submitInteractions(interactions) {
        doArrayTypeCheck(interactions, GamePostInteraction, "Interactions with the Current Post")

        const submittedPostCount = this.participant.postInteractions.getSubmittedPostsCount();
        if (submittedPostCount >= interactions.length)
            return;

        for (let index = submittedPostCount; index < interactions.length; ++index) {
            this.submitInteraction(index, interactions[index]);
        }

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

    submitInteraction(postIndex, postInteraction) {
        if (!postInteraction.isCompleted())
            throw new Error("Interactions with posts must be completed to be submitted");

        // Calculate and apply the changes to participant's credibility and followers.
        const postReactions = postInteraction.postReactions;
        let credibilityChange = 0,
            followerChange = 0;

        const post = this.getState(postIndex).currentPost.post;
        for (let index = 0; index < postReactions.length; ++index) {
            const reaction = postReactions[index];
            if (reaction === "skip")
                continue;

            credibilityChange += post.changesToCredibility[reaction].sample();
            followerChange += post.changesToFollowers[reaction].sample();
        }
        this.participant.addSubmittedPost(postIndex, postInteraction, credibilityChange, followerChange);
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
            studyModTime = json["studyModTime"];
        }
        return new Game(
            study, studyModTime,
            json["sessionID"],
            json["startTime"],
            json["endTime"],
            Game.statesFromJSON(json["states"], study),
            GameParticipant.fromJSON(json["participant"]),
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
        const interactionStore = new GamePostInteractionStore();
        const participant = new GameParticipant(null, 50, 0, interactionStore);
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

