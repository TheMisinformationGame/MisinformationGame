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

    isCompleted() {
        return this.hideTime !== null;
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
        return new GamePostInteraction([], [], null, null, InteractionTimer.start());
    }

    isEmpty() {
        return this.postReactions.length === 0 &&
            this.commentReactions.length === 0 &&
            this.comment === null;
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

    isEditingComment() {
        return this.lastComment !== null;
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
        this.checkIntegrity();
    }

    /**
     * Ensures that the state of this store is valid.
     */
    checkIntegrity() {
        if (this.postInteractions === null)
            throw new Error("Missing postInteractions of GamePostInteractionStore");

        // Check that all complete posts are stored to the front of the interactions.
        let foundIncomplete = false;
        const interactions = this.postInteractions;
        for (let index = 0; index < interactions.length; ++index) {
            const inter = interactions[index];
            if (!inter.isCompleted()) {
                foundIncomplete = true;
            } else if (foundIncomplete) {
                throw new Error("There exists a complete post after incomplete posts")
            }
        }
    }

    copy() {
        return new GamePostInteractionStore(null, this);
    }

    static empty() {
        return new GamePostInteractionStore();
    }

    getSubmittedPosts() {
        let submitted = [];
        const interactions = this.postInteractions;
        for (let index = 0; index < interactions.length; ++index) {
            const inter = interactions[index];
            if (!inter.isCompleted())
                break

            submitted.push(interactions[index]);
        }
        return submitted;
    }

    getSubmittedPostsCount() {
        return this.getSubmittedPosts().length;
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

    /**
     * Gets the index of the first post that hasn't been submitted.
     * If all posts have been submitted, this returns an index one
     * greater than the index of the last submitted post.
     */
    getCurrentPostIndex() {
        let index = 0
        for (; index < this.postInteractions.length; ++index) {
            if (!this.postInteractions[index].isCompleted())
                return index;
        }
        return this.postInteractions.length;
    }

    update(postIndex, postInteraction) {
        const copy = this.copy();
        copy.ensureExists(postIndex);
        copy.postInteractions[postIndex] = postInteraction;
        copy.checkIntegrity();
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
