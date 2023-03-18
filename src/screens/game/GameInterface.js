import React, {Component} from 'react';
import {GamePrompt} from "./GamePrompt";
import {ContinueButton} from "../../components/ContinueButton";
import {ErrorLabel, ProgressLabel} from "../../components/StatusLabel"
import {ActiveGameScreen} from "./ActiveGameScreen";
import {MountAwareComponent} from "../../components/MountAwareComponent";
import {ParticipantProgress} from "./ParticipantProgress";
import smoothscroll from 'smoothscroll-polyfill';
import {PostComponent} from "./Post";
import {GamePostInteractionStore} from "../../model/game/interactions";
import {ScrollTracker} from "../../model/game/scrollTracker";


// We want to ensure that we have smooth element scrollIntoView behaviour.
smoothscroll.polyfill();


/**
 * A user interface at the bottom of the feed to allow
 * participants to finish the study.
 */
class FeedEnd extends Component {
    render() {
        return (
            <>
                <div id="feed-end" className="flex flex-col mt-6">
                    <div className="bg-white shadow">
                        <div onClick={this.props.onContinue}
                             className={
                                 " m-3 px-3 py-2 rounded-md text-white select-none cursor-pointer " +
                                 " bg-blue-500 active:bg-blue-600 hover:bg-blue-600"
                             }>

                            Click to Complete Simulation
                        </div>
                    </div>
                </div>
                <div id="feed-end-spacer" style={{"height": "60vh"}}></div>
            </>
        );
    }
}


/**
 * The user interface that is shown when the participant
 * has finished the game. This makes sure that the participant's
 * results have been saved before letting them continue.
 */
class GameFinished extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.defaultState = {
            saving: true,
            saved: false,
            error: null
        };
        this.state = this.defaultState;
    }

    componentDidMount() {
        super.componentDidMount();
        this.updateSaveStateFromGame()
    }

    updateSaveStateFromGame() {
        const game = this.props.game;
        let promise = game.getSaveToDatabasePromise();
        if (!promise) {
            promise = game.saveToDatabase();
        }

        this.setState(() => this.defaultState);
        promise.then(() => {
            this.setStateIfMounted(() => {
                return {
                    saving: false,
                    saved: true,
                    error: null
                };
            });
        }).catch(error => {
            console.error(error);
            this.setStateIfMounted(() => {
                return {
                    saving: false,
                    saved: false,
                    error: error.message
                };
            });
        });
    }

    retry() {
        const game = this.props.game;
        game.saveToDatabase();
        this.updateSaveStateFromGame();
    }

    render() {
        const study = this.props.study;
        const target = "/study/" + study.id + "/debrief" + window.location.search;
        return (
            <div className="w-full bg-white shadow items-center">
                <div className="px-10 pt-8 pb-6 max-w-full text-center">
                    <p className="block text-xl mb-4 font-bold">
                        You have completed the simulation!
                    </p>
                    <p className="text-left mb-4">
                        Your results will be saved, and then you may continue to the debriefing of the study.
                    </p>

                    {/* Allow the user to continue if their results have been saved. */}
                    {this.state.saved && <ContinueButton className="block w-full" to={target} condition={true} />}

                    {/* If the results are being saved, show a progress wheel. */}
                    {this.state.saving && <ProgressLabel value="Your results are being saved..." />}

                    {/* If there was an error saving their results, show the error, and ask them to try again. */}
                    {this.state.error && <>
                        <ErrorLabel value={[<b>There was an error saving your results:</b>, this.state.error]} />
                        <div onClick={() => this.retry()}
                             className="mt-3 px-3 py-2 rounded-md text-white select-none
                                        cursor-pointer bg-blue-500 active:bg-blue-600 hover:bg-blue-600 ">

                            Try Again
                        </div>
                    </>}
                </div>
            </div>
        )
    }
}

/**
 * The screen displaying the game itself, including the participant's progress
 * and many posts and comments.
 */
export class GameScreen extends ActiveGameScreen {
    constructor(props) {
        super(props, ["introduction-or-game", "game", "debrief"]);
        this.defaultState = {
            ...this.defaultState,

            error: null,

            interactions: GamePostInteractionStore.empty(),
            reactionsAllowed: true,
            dismissedPrompt: false,

            displayScrollToNewPostsSuggestion: false,

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
            inputEnabled: true,
        };
        this.state = this.defaultState;
        this.scrollTracker = new ScrollTracker(
            this.getFeedDiv.bind(this),
            this.onPostMove.bind(this)
        );
        this.scrollToNextPostAfterNextUpdate = null;
    }

    afterGameLoaded(game) {
        super.afterGameLoaded(game);

        const inters = game.participant.postInteractions;
        this.setStateIfMounted(() => {
            this.scrollToNextPostAfterNextUpdate = inters.getSubmittedPostsCount();
            return {
                interactions: inters.copy(),
                dismissedPrompt: game.isFinished()
            };
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.scrollTracker.start();
        if (this.scrollToNextPostAfterNextUpdate) {
            const postIndex = this.scrollToNextPostAfterNextUpdate;
            this.scrollToNextPostAfterNextUpdate = null;
            window.requestAnimationFrame(() => this.scrollToNextPost(postIndex, false));
        }
    }

    componentDidUpdate() {
        if (this.scrollToNextPostAfterNextUpdate) {
            const postIndex = this.scrollToNextPostAfterNextUpdate;
            this.scrollToNextPostAfterNextUpdate = null;
            window.requestAnimationFrame(() => this.scrollToNextPost(postIndex, false));
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scrollTracker.stop();
    }

    onPromptContinue() {
        this.setState(() => {
            return {dismissedPrompt: true};
        })
    }

    onPostReaction(postIndex, reaction, study) {
        this.setState((state) => {
            const inters = state.interactions;
            return {
                interactions: inters.update(postIndex, inters.get(postIndex).withToggledPostReaction(
                    reaction, study.uiSettings.allowMultipleReactions
                ))
            };
        });
    }

    onCommentReaction(postIndex, commentIndex, reaction, study) {
        this.setState((state) => {
            const inters = state.interactions;
            return {
                interactions: inters.update(postIndex, inters.get(postIndex).withToggledCommentReaction(
                    commentIndex, reaction, study.uiSettings.allowMultipleReactions
                ))
            };
        });
    }

    onCommentSubmit(postIndex, comment) {
        this.setState((state) => {
            const inters = state.interactions;
            return {
                interactions: inters.update(postIndex, inters.get(postIndex).withComment(comment))
            };
        });
    }

    onCommentEdit(postIndex) {
        this.setState((state) => {
            const inters = state.interactions;
            return {
                interactions: inters.update(postIndex, inters.get(postIndex).withComment(null))
            };
        });
    }

    onCommentDelete(postIndex) {
        this.setState((state) => {
            const inters = state.interactions;
            return {
                interactions: inters.update(postIndex, inters.get(postIndex).withDeletedComment())
            };
        });
    }

    onPostMove(lastLoc, newLoc) {
        const postIndex = newLoc.postIndex;
        if ((!lastLoc || !lastLoc.aboveScreen) && newLoc.aboveScreen) {
            this.onPostScrolledAboveScreen(postIndex);
        } else if ((!lastLoc || !lastLoc.onScreen) && newLoc.onScreen) {
            this.onPostScrolledOnScreen(postIndex);
        } else if ((!lastLoc || !lastLoc.belowScreen) && newLoc.belowScreen) {
            this.onPostScrolledBelowScreen(postIndex);
        }

        if (lastLoc && lastLoc.belowScreen && newLoc.onScreen) {
            this.onPostScrolledOnScreenFromBelow(postIndex);
        }
    }

    onPostScrolledOnScreen(postIndex) {}

    onPostScrolledAboveScreen(postIndex) {
        this.submitPost(postIndex);
    }

    onPostScrolledBelowScreen(postIndex) {
        this.updateDisplayScrollToNewPosts(postIndex - 1);
    }

    onPostScrolledOnScreenFromBelow(postIndex) {
        this.updateDisplayScrollToNewPosts(postIndex);
    }

    updateDisplayScrollToNewPosts(highestVisiblePostIndex) {
        const inters = this.state.interactions;
        let newPostVisible = false;
        for (let index = 0; index <= highestVisiblePostIndex; ++index) {
            if (!inters.get(index).isCompleted()) {
                newPostVisible = true;
                break;
            }
        }
        this.setState(() => {
            return {
                displayScrollToNewPostsSuggestion: !newPostVisible
            };
        });
    }

    /**
     * Submits all posts up to and including maxPostIndex.
     */
    static completePostInteractions(inters, maxPostIndex) {
        for (let index = 0; index <= maxPostIndex; ++index) {
            const previousPostInters = inters.get(index);
            if (!previousPostInters.isCompleted()) {
                inters = inters.update(index, previousPostInters.complete());
            }
        }
        return inters;
    }

    submitInteractionsToGame(game, inters) {
        game.submitInteractions(inters.getSubmittedPosts());
    }

    submitPost(postIndex) {
        const game = this.state.game;
        if (!game)
            throw new Error("There is no active game");

        this.setState((state) => {
            const inters = state.interactions;
            const postInters = inters.get(postIndex);

            if (postInters.isCompleted() || postInters.isEmpty())
                return {};

            const newInters = GameScreen.completePostInteractions(inters, postIndex);
            this.submitInteractionsToGame(game, newInters);
            return {interactions: newInters};
        });
    }

    submitAll() {
        const game = this.state.game;
        if (!game)
            throw new Error("There is no active game");

        const postCount = game.study.basicSettings.length;
        this.setState((state) => {
            const inters = state.interactions;
            const newInters = GameScreen.completePostInteractions(inters, postCount - 1);
            this.submitInteractionsToGame(game, newInters);
            return {interactions: newInters};
        });
    }

    getCurrentPostIndex() {
        const interactions = this.state.interactions;
        if (!interactions)
            return;

        return interactions.getCurrentPostIndex();
    }

    onNextPost() {
        const game = this.state.game;
        if (!game)
            throw new Error("There is no active game!");

        // Search by submitted posts.
        const study = game.study;
        let currentPostIndex = this.getCurrentPostIndex();
        if (currentPostIndex >= study.basicSettings.length)
            return;

        if (study.uiSettings.displayPostsInFeed) {
            this.scrollToNextPost(currentPostIndex, true);
        } else {
            this.submitPost(currentPostIndex);
        }
    }

    scrollToNextPost(currentPostIndex, smoothScroll) {
        this.scrollTracker.detect();

        // Search visually for the next post.
        let nextPostIndex = currentPostIndex;
        let nextPostBBox;
        do {
            nextPostBBox = this.scrollTracker.get(nextPostIndex);
            if (!nextPostBBox)
                return;
            if (nextPostBBox.y > 80)
                break;

            nextPostIndex += 1;
        } while (true);

        // Get the post to scroll it into view.
        const nextPostElement = document.getElementById("post-" + nextPostIndex);
        if (!nextPostElement)
            throw new Error("Unable to find the element for the next post (" + nextPostIndex + ")");

        nextPostElement.scrollIntoView({
            behavior: (smoothScroll ? "smooth" : "auto")
        });
    }

    getFeedDiv() {
        return document.getElementById("post-feed");
    }

    renderWithStudyAndGame(study, game) {
        const states = game.states;

        const participant = game.participant;
        const displayPrompt = !this.state.dismissedPrompt;
        const error = this.state.error;
        const finished = game.isFinished();

        const interactions = this.state.interactions;
        const currentPostNumber = interactions.getSubmittedPostsCount();

        const totalPosts = game.study.basicSettings.length;
        const progressPercentage = Math.round(currentPostNumber / totalPosts * 100);

        let nextPostEnabled = true;
        let nextPostError = "";
        if (!study.uiSettings.displayPostsInFeed && states !== null) {
            if (states.length > 1)
                throw new Error("It is unexpected to be in non-feed mode with more than one state active");

            const postInteraction = interactions.get(states[0].indexInGame)
            const madePostReaction = (postInteraction.postReactions.length > 0);
            const madeUserComment = (postInteraction.comment !== null);

            nextPostEnabled = false;
            if (postInteraction.isEditingComment()) {
                if (study.basicSettings.requireReactions && !madePostReaction) {
                    nextPostError = "Please react to the post";
                } else {
                    nextPostError = "Please complete your comment";
                }
            } else if (study.basicSettings.requireReactions && study.areUserCommentsRequired()) {
                if (!madePostReaction) {
                    nextPostError = "Please react to the post";
                } else if (!madeUserComment) {
                    nextPostError = "Comment on the post to continue";
                } else {
                    nextPostEnabled = true;
                }
            } else if (study.basicSettings.requireReactions) {
                nextPostEnabled = madePostReaction;
                nextPostError = "React to the post to continue";
            } else if (study.areUserCommentsRequired()) {
                nextPostEnabled = madeUserComment;
                nextPostError = "Comment on the post to continue";
            } else {
                nextPostEnabled = true;
            }
        }

        // Generate the post components.
        const postComponents = [];
        if (!error && !finished) {
            for (let index = 0; index < states.length; ++index) {
                const state = states[index];
                const interaction = interactions.get(index);
                const postIndex = state.indexInGame,
                      postID = "post-" + state.indexInGame;

                postComponents.push(
                    <PostComponent
                        id={postID}
                        key={postID}
                        state={state}
                        onPostReact={r => this.onPostReaction(postIndex, r, study)}
                        onCommentReact={(i, r) => this.onCommentReaction(postIndex, i, r, study)}
                        onCommentSubmit={value => this.onCommentSubmit(postIndex, value)}
                        onCommentEdit={() => this.onCommentEdit(postIndex)}
                        onCommentDelete={() => this.onCommentDelete(postIndex)}
                        enabled={this.state.reactionsAllowed && this.state.inputEnabled}
                        interactions={interaction}
                        className={(study.uiSettings.displayPostsInFeed ? "mt-6 scroll-mt-4" : "")}/>
                );
            }
        }

        return (
            <>
                {displayPrompt &&
                    <GamePrompt study={study} onClick={(enabled) => {
                        if (enabled) {
                            this.onPromptContinue();
                        }
                    }} />}

                <div className={"flex flex-row items-start w-full bg-gray-100 " +
                                (displayPrompt ? " filter blur " : "")}
                     style={{minHeight: "100vh"}}>

                    {/* Space to the left. */}
                    <div className="flex-1" />

                    {/* Progress. */}
                    {participant && !error &&
                        <ParticipantProgress
                            displayFollowers={study.uiSettings.displayFollowers}
                            displayCredibility={study.uiSettings.displayCredibility}
                            displayProgress = {study.uiSettings.displayProgress}
                            fancyPositioning={true}
                            participant={participant}
                            overrideFollowers={this.state.overrideFollowers}
                            overrideCredibility={this.state.overrideCredibility}
                            nextPostEnabled={nextPostEnabled && this.state.reactionsAllowed && this.state.inputEnabled}
                            progressPercentage = {progressPercentage}
                            onNextPost={() => {
                                if (nextPostEnabled) {
                                    this.onNextPost();
                                }
                            }}
                            nextPostText={
                                finished ?
                                    "The simulation is complete!" :
                                (!nextPostEnabled ?
                                    nextPostError :
                                (!this.state.reactionsAllowed ?
                                    "Please wait to continue" :
                                (study.uiSettings.displayPostsInFeed ?
                                    "Scroll to next post" :
                                    "Continue to next post")))
                            }
                            followerChange={this.state.followerChange}
                            credibilityChange={this.state.credibilityChange}/>}

                    {/* Space in the middle. */}
                    <div className="flex-1 max-w-mini" />

                    {/* The posts and their associated comments. */}
                    <div id="post-feed"
                         className="relative bg-gray-200 w-full md:max-w-xl
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={{minHeight: "100vh"}}>

                        {/* Post, reactions, and comments. */}
                        {postComponents}

                        {/* The end of the feed. */}
                        {!finished && study.uiSettings.displayPostsInFeed &&
                            <FeedEnd onContinue={() => this.submitAll(game)} />}

                        {/* If the game is finished, display a game completed prompt. */}
                        {finished && <GameFinished study={study} game={game} />}

                        {/* If there is an error, display it here. */}
                        {error && <ErrorLabel value={error} />}

                        {/* Used for reserving space below reactions and progress. */}
                        <div className="h-56 md:h-8" />

                        {/* Suggestion for users to scroll to new posts. */}
                        <div className="absolute left-1/2">
                            <div id="scroll-to-new-posts-suggestion"
                                 className={
                                     "fixed top-3 block transform -translate-x-1/2 px-3 py-1 cursor-pointer " +
                                     "bg-white rounded-full shadow-floatingbutton text-blue-600 hover:text-blue-800 " +
                                     "text-lg transition " +
                                     (this.state.displayScrollToNewPostsSuggestion ?
                                        " opacity-100 translate-y-0 " :
                                        " opacity-0 -translate-y-5 ")
                                 }
                                 onClick={() => {
                                     if (nextPostEnabled) {
                                         this.onNextPost();
                                     }
                                 }}>

                                Scroll To New Posts
                            </div>
                        </div>

                    </div>

                    {/* Space to the right. */}
                    <div className="flex-1" />
                    <div className="flex-1" />
                </div>
            </>
        );
    }
}