import {doArrayTypeCheck, doNullableArrayTypeCheck, doNullableTypeCheck, doTypeCheck} from "../../utils/types";


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
    firstShowTime; // Number? (UNIX Milliseconds)
    lastShowTime; // Number? (UNIX Milliseconds)
    lastHideTime; // Number? (UNIX Milliseconds)
    visibleDuration; // Number (Milliseconds)

    firstInteractTime; // Number? (UNIX Milliseconds)
    lastInteractTime; // Number? (UNIX Milliseconds)

    constructor(firstShowTime, lastShowTime, lastHideTime, visibleDuration, firstInteractTime, lastInteractTime) {
        doNullableTypeCheck(firstShowTime, "number", "Time when First Visible");
        doNullableTypeCheck(lastShowTime, "number", "Time when Last Visible");
        doNullableTypeCheck(lastHideTime, "number", "Time when Last Hidden");
        doTypeCheck(visibleDuration, "number", "Time Spent Visible");
        doNullableTypeCheck(firstInteractTime, "number", "Time of First Interaction");
        doNullableTypeCheck(lastInteractTime, "number", "Time of Last Interaction");
        this.firstShowTime = (firstShowTime !== undefined ? firstShowTime : null);
        this.lastShowTime = (lastShowTime !== undefined ? lastShowTime : null);
        this.lastHideTime = (lastHideTime !== undefined ? lastHideTime : null);
        this.visibleDuration = (visibleDuration !== undefined ? visibleDuration : null);
        this.firstInteractTime = (firstInteractTime !== undefined ? firstInteractTime : null);
        this.lastInteractTime = (lastInteractTime !== undefined ? lastInteractTime : null);
    }

    static empty() {
        return new InteractionTimer(
            null, null,
            null, 0,
            null, null
        );
    }

    getTimeToFirstInteractMS() {
        if (this.firstInteractTime === null || this.firstShowTime === null)
            return NaN;

        return this.firstInteractTime - this.firstShowTime;
    }

    getTimeToLastInteractMS() {
        if (this.lastInteractTime === null || this.firstShowTime === null)
            return NaN;

        return this.lastInteractTime - this.firstShowTime;
    }

    /**
     * Only supported when the interaction timer has been marked as hidden.
     * This does not actively count while the timer is actively counting
     * while the post is visible.
     */
    getDwellTimeMS() {
        return this.visibleDuration;
    }

    withClearedInteractions() {
        return new InteractionTimer(
            this.firstShowTime, this.lastShowTime,
            this.lastHideTime, this.visibleDuration,
            null, null
        );
    }

    asVisible() {
        // Already visible.
        if (this.lastShowTime !== null)
            return this;

        const time = Date.now();

        const firstShowTime = (this.firstShowTime !== null ? this.firstShowTime : time);
        const lastShowTime = time;
        const lastHideTime = null;

        return new InteractionTimer(
            firstShowTime, lastShowTime,
            lastHideTime, this.visibleDuration,
            this.firstInteractTime, this.lastInteractTime
        );
    }

    asHidden() {
        // Already hidden.
        if (this.lastShowTime === null)
            return this;

        const time = Date.now();

        const lastShowTime = null;
        const lastHideTime = time;
        const visibleDuration = this.visibleDuration + (time - this.lastShowTime);

        return new InteractionTimer(
            this.firstShowTime, lastShowTime,
            lastHideTime, visibleDuration,
            this.firstInteractTime, this.lastInteractTime
        );
    }

    withNewInteraction() {
        const time = Date.now();

        const firstInteractTime = (this.firstInteractTime !== null ? this.firstInteractTime : time);
        const lastInteractTime = time;

        return new InteractionTimer(
            this.firstShowTime, this.lastShowTime,
            this.lastHideTime, this.visibleDuration,
            firstInteractTime, lastInteractTime
        );
    }

    isCompleted() {
        return this.firstShowTime !== null && this.lastShowTime === null && this.lastHideTime === null;
    }

    complete() {
        const subject = (this.lastShowTime === null ? this : this.asHidden());

        const firstShowTime = (subject.firstShowTime !== null ? subject.firstShowTime : Date.now());
        const lastShowTime = null;
        const lastHideTime = null;

        return new InteractionTimer(
            firstShowTime, lastShowTime,
            lastHideTime, subject.visibleDuration,
            subject.firstInteractTime, subject.lastInteractTime
        );
    }

    toJSON() {
        return {
            "firstShowTime": this.firstShowTime,
            "lastShowTime": this.lastShowTime,
            "lastHideTime": this.lastHideTime,
            "visibleDuration": this.visibleDuration,
            "firstInteractTime": this.firstInteractTime,
            "lastInteractTime": this.lastInteractTime
        };
    }

    static fromJSON(json) {
        const legacyShowTime = json["showTime"];
        if (legacyShowTime !== undefined) {
            const legacyHideTime = json["hideTime"];

            const firstShowTime = legacyShowTime;
            const lastShowTime = null;
            const lastHideTime = null;
            const visibleDuration = legacyHideTime - legacyShowTime;
            const firstInteractTime = json["firstInteractTime"];
            const lastInteractTime = json["lastInteractTime"];

            return new InteractionTimer(
                firstShowTime, lastShowTime,
                lastHideTime, visibleDuration,
                firstInteractTime, lastInteractTime
            );
        }

        return new InteractionTimer(
            json["firstShowTime"],
            json["lastShowTime"],
            json["lastHideTime"],
            json["visibleDuration"],
            json["firstInteractTime"],
            json["lastInteractTime"],
        );
    }
}


/**
 * Stores the interactions of participants with a comment.
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

    static create(commentIndex, commentReaction, postTimer) {
        return new GameCommentInteraction(
            commentIndex, [commentReaction],
            postTimer.withClearedInteractions().withNewInteraction()
        )
    }

    complete() {
        return new GameCommentInteraction(
            this.commentIndex,
            this.reactions,
            this.timer.complete()
        )
    }

    asVisible() {
        return new GameCommentInteraction(
            this.commentIndex,
            this.reactions,
            this.timer.asVisible()
        )
    }

    asHidden() {
        return new GameCommentInteraction(
            this.commentIndex,
            this.reactions,
            this.timer.asHidden()
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
        const reactions = json["reactions"];
        const reaction = json["reaction"];
        const timerJSON = json["timer"];
        const legacyReactTimeMS = json["reactTimeMS"];

        let timer;
        if (timerJSON !== undefined) {
            timer = InteractionTimer.fromJSON(timerJSON);
        } else {
            timer = new InteractionTimer(
                showTime, null,
                null, null,
                (legacyReactTimeMS || null),
                (legacyReactTimeMS || null)
            );
        }

        return new GameCommentInteraction(
            json["commentID"],
            (reactions !== undefined ? reactions : (reaction ? [reaction] : [])),
            timer
        );
    }
}

/**
 * Stores all the interactions of a participant with a post.
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
        return new GamePostInteraction([], [], null, null, InteractionTimer.empty());
    }

    isEmpty() {
        return this.postReactions.length === 0 &&
            this.commentReactions.length === 0 &&
            this.comment === null;
    }

    isEditingComment() {
        return this.lastComment !== null;
    }

    isCompleted() {
        return this.timer.isCompleted();
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

    asVisible() {
        const updatedCommentReactions = [];
        for (let index = 0; index < this.commentReactions.length; ++index) {
            updatedCommentReactions.push(this.commentReactions[index].asVisible())
        }
        return new GamePostInteraction(
            this.postReactions,
            updatedCommentReactions,
            this.lastComment,
            this.comment,
            this.timer.asVisible()
        );
    }

    asHidden() {
        const updatedCommentReactions = [];
        for (let index = 0; index < this.commentReactions.length; ++index) {
            updatedCommentReactions.push(this.commentReactions[index].asHidden())
        }
        return new GamePostInteraction(
            this.postReactions,
            updatedCommentReactions,
            this.lastComment,
            this.comment,
            this.timer.asHidden()
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
                commentIndex, commentReaction, this.timer
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
        const timerJSON = json["timer"];

        let timer;
        if (timerJSON !== undefined) {
            timer = InteractionTimer.fromJSON(timerJSON);
        } else {
            const legacyPostShowTime = json["postShowTime"];
            const legacyFirstInteractTimeMS = json["firstInteractTimeMS"];
            const legacyLastInteractTimeMS = json["lastInteractTimeMS"];

            if (legacyPostShowTime !== undefined) {
                timer = new InteractionTimer(
                    legacyPostShowTime, null,
                    null, 0,
                    (legacyFirstInteractTimeMS ? legacyPostShowTime + legacyFirstInteractTimeMS : null),
                    (legacyLastInteractTimeMS ? legacyPostShowTime + legacyLastInteractTimeMS : null)
                );
            } else {
                timer = InteractionTimer.empty();
            }
        }

        const postReactions = json["postReactions"];
        const postReaction = json["postReaction"];
        const comment = json["comment"];

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
 * Stores the interactions of a user with a set of posts.
 * This is used to store the state of all posts in the feed.
 */
export class GamePostInteractionStore {
    postInteractions; // GamePostInteraction[]

    constructor(postInteractions, template) {
        doNullableArrayTypeCheck(postInteractions, GamePostInteraction, "Participant's Interactions with Posts")
        this.postInteractions = postInteractions || [];

        // Copy the post interactions from the template.
        if (template !== undefined) {
            const templateInteractions = template.postInteractions;
            for (let index = 0; index < templateInteractions.length; ++index) {
                const templateInteraction = templateInteractions[index];
                this.postInteractions.push(templateInteraction);
            }
        }
    }

    copy() {
        return new GamePostInteractionStore(null, this);
    }

    static empty() {
        return new GamePostInteractionStore();
    }

    getSubmittedPostsCount() {
        let submitted = 0;
        for (let index = 0; index < this.postInteractions.length; ++index) {
            if (this.postInteractions[index].isCompleted()) {
                submitted += 1;
            }
        }
        return submitted;
    }

    ensureExists(postIndex) {
        while (postIndex >= this.postInteractions.length) {
            this.postInteractions.push(GamePostInteraction.empty());
        }
    }

    get(postIndex) {
        this.ensureExists(postIndex);
        return this.postInteractions[postIndex];
    }

    getCurrentPostIndex() {
        let highestCompletedIndex = -1;
        for (let index = 0; index < this.postInteractions.length; ++index) {
            if (this.postInteractions[index].isCompleted()) {
                highestCompletedIndex = index;
            }
        }
        return highestCompletedIndex;
    }

    update(postIndex, postInteraction) {
        const copy = this.copy();
        copy.ensureExists(postIndex);
        copy.postInteractions[postIndex] = postInteraction;
        return copy;
    }

    toJSON() {
        const json = [];
        const interactions = this.postInteractions;
        for (let index = 0; index < interactions.length; ++index) {
            const interaction = interactions[index];
            json.push(interaction.toJSON());
        }
        return json;
    }

    static fromJSON(json) {
        const interactions = [];
        for (let index = 0; index < json.length; ++index) {
            interactions.push(GamePostInteraction.fromJSON(json[index]));
        }
        return new GamePostInteractionStore(interactions);
    }
}
