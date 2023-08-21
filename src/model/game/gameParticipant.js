import {doNullableArrayTypeCheck, doNullableTypeCheck, doTypeCheck} from "../../utils/types";
import {GamePostInteraction, GamePostInteractionStore} from "./interactions";
import {adjustCredibility, adjustFollowers} from "./gameState";


/**
 * Stores the reactions, credibility, and followers
 * of a participant throughout the game.
 */
export class GameParticipant {
    participantID; // String?
    postInteractions; // GamePostInteractionStore
    credibility; // Number
    followers; // Number
    credibilityHistory; // Number[]
    followerHistory; // Number[]

    constructor(participantID, credibility, followers,
                postInteractions, credibilityHistory, followerHistory) {

        doNullableTypeCheck(participantID, "string", "Participant's ID");
        doTypeCheck(credibility, "number", "Participant's Credibility");
        doTypeCheck(followers, "number", "Participant's Followers");
        doTypeCheck(postInteractions, GamePostInteractionStore, "Participant's Interactions with Posts");
        doNullableArrayTypeCheck(credibilityHistory, "number", "Participant's Credibility History");
        doNullableArrayTypeCheck(followerHistory, "number", "Participant's Follower History");
        this.participantID = participantID;
        this.credibility = credibility;
        this.followers = followers;
        this.postInteractions = postInteractions;
        this.credibilityHistory = credibilityHistory || [credibility];
        this.followerHistory = followerHistory || [followers];
    }

    addSubmittedPost(postIndex, postInteraction, credibilityChange, followersChange) {
        doTypeCheck(postIndex, "number", "Post Index for a Participant's Interaction")
        doTypeCheck(postInteraction, GamePostInteraction, "Participant's Interactions with a Post");
        doTypeCheck(credibilityChange, "number", "Participant's Credibility Change after Reaction");
        doTypeCheck(followersChange, "number", "Participant's Followers Change after Reaction");
        this.postInteractions = this.postInteractions.update(postIndex, postInteraction);

        // The first element in the history arrays is the starting value.
        const postNumber = postIndex + 1;

        // Account for skipped posts.
        while (postNumber > this.credibilityHistory.length) {
            this.credibilityHistory.push(this.credibility);
        }
        while (postNumber > this.followerHistory.length) {
            this.followerHistory.push(this.followers);
        }

        // Make the change to credibility and followers.
        this.credibility = adjustCredibility(this.credibility, credibilityChange);
        this.followers = adjustFollowers(this.followers, followersChange);

        // Check for correctness.
        if (postNumber !== this.credibilityHistory.length || postNumber !== this.followerHistory.length) {
            // Hidden posts all get submitted at the end in feed mode.
            if (credibilityChange === 0 && followersChange === 0)
                return;

            throw new Error(
                "Post index does not match the expected next submitted post"
            );
        }

        // Add to the credibility & follower history.
        this.credibilityHistory.push(this.credibility);
        this.followerHistory.push(this.followers);
    }

    toJSON() {
        return {
            "participantID": this.participantID,
            "credibility": this.credibility,
            "followers": this.followers,
            "interactions": this.postInteractions.toJSON(),
            "credibilityHistory": this.credibilityHistory,
            "followerHistory": this.followerHistory
        };
    }

    static fromJSON(json) {
        return new GameParticipant(
            json["participantID"],
            json["credibility"],
            json["followers"],
            GamePostInteractionStore.fromJSON(json["interactions"]),
            json["credibilityHistory"],
            json["followerHistory"]
        );
    }
}
