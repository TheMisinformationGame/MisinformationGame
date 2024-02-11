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
import {DynamicFeedbackController} from "./dynamicFeedback";


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

            allowReactions: false,
            interactions: GamePostInteractionStore.empty(),
            dismissedPrompt: false,

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
        };
        this.state = this.defaultState;
        this.scrollTracker = new ScrollTracker(
            this.getFeedDiv.bind(this),
            this.onPostMove.bind(this)
        );
        this.scrollToNextPostAfterNextUpdate = null;

        const dynamicFeedbackAnimateTime = 500;
        this.dynamicFeedbackFollowers = new DynamicFeedbackController(
            dynamicFeedbackAnimateTime, this.updateDynamicFeedbackFollowers.bind(this)
        );
        this.dynamicFeedbackCredibility = new DynamicFeedbackController(
            dynamicFeedbackAnimateTime, this.updateDynamicFeedbackCredibility.bind(this)
        );

        this.changeTimeoutID = null;
        this.reactDelayTimeoutID = null;
    }

    afterGameLoaded(game) {
        super.afterGameLoaded(game);

        const inters = game.participant.postInteractions;
        this.setStateIfMounted(() => {
            this.scrollToNextPostAfterNextUpdate = inters.getCurrentPostIndex();
            return {
                interactions: inters.copy(),
                dismissedPrompt: game.isFinished()
            };
        });
    }

    cancelReactDelay() {
        if (this.reactDelayTimeoutID !== null) {
            clearTimeout(this.reactDelayTimeoutID);
            this.reactDelayTimeoutID = null;
        }
    }

    startReactDelay(game) {
        this.cancelReactDelay();

        if (!game) {
            game = this.state.game;
            if (!game)
                throw new Error("There is no active game!");
        }

        const setAllowReactions = (allowReactions) => {
            this.setStateIfMounted(() => {
                return {
                    allowReactions: allowReactions,
                };
            });
        };

        const reactDelay = game.study.advancedSettings.reactDelaySeconds;
        if (reactDelay <= 0) {
            setAllowReactions(true);
            return;
        }

        setAllowReactions(false);
        this.reactDelayTimeoutID = setTimeout(() => {
            setAllowReactions(true);
        }, 1000 * reactDelay);
    }

    componentDidMount() {
        super.componentDidMount();
        this.scrollTracker.start();
        if (this.scrollToNextPostAfterNextUpdate) {
            const postIndex = this.scrollToNextPostAfterNextUpdate;
            this.scrollToNextPostAfterNextUpdate = null;
            window.requestAnimationFrame(() => this.scrollToNextPost(false, postIndex));
        }
    }

    componentDidUpdate() {
        if (this.scrollToNextPostAfterNextUpdate) {
            const postIndex = this.scrollToNextPostAfterNextUpdate;
            this.scrollToNextPostAfterNextUpdate = null;
            window.requestAnimationFrame(() => this.scrollToNextPost(false, postIndex));
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scrollTracker.stop();
        this.dynamicFeedbackFollowers.cancel();
        this.dynamicFeedbackCredibility.cancel();
        if (this.changeTimeoutID) {
            clearTimeout(this.changeTimeoutID);
            this.changeTimeoutID = null;
        }
        this.cancelReactDelay();
    }

    onPromptContinue() {
        this.setState((prevState) => {
            return {
                ...prevState,
                dismissedPrompt: true
            };
        });
        this.startReactDelay();
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
        if ((!lastLoc || !lastLoc.onScreen) && newLoc.onScreen) {
            this.onPostScrolledOnScreen(postIndex);
        } else if ((!lastLoc || lastLoc.onScreen) && !newLoc.onScreen) {
            this.onPostScrolledOffScreen(postIndex);
        }
    }

    onPostScrolledOnScreen(postIndex) {
        this.setState((state) => {
            const inters = state.interactions;
            const postInters = inters.get(postIndex);
            if (postInters.isCompleted())
                return {};

            return {
                interactions: inters.update(postIndex, postInters.asVisible())
            };
        });
    }

    onPostScrolledOffScreen(postIndex) {
        this.submitPost(postIndex);

        this.setState((state) => {
            const inters = state.interactions;
            const postInters = inters.get(postIndex);
            if (postInters.isCompleted())
                return {};

            return {
                interactions: inters.update(postIndex, postInters.asHidden())
            };
        });
    }

    submitInteractionsToGame(game, inters) {
        const beforeFollowers = Math.round(game.participant.followers);
        const beforeCredibility = Math.round(game.participant.credibility);

        game.submitInteractions(inters);

        const afterFollowers = Math.round(game.participant.followers);
        const afterCredibility = Math.round(game.participant.credibility);

        const followerChange = (afterFollowers - beforeFollowers) || null;
        const credibilityChange = (afterCredibility - beforeCredibility) || null;

        if (followerChange) {
            this.dynamicFeedbackFollowers.addFeedback(beforeFollowers, afterFollowers);
        }
        if (credibilityChange) {
            this.dynamicFeedbackCredibility.addFeedback(beforeCredibility, afterCredibility);
        }

        this.setStateIfMounted(() => {
            return {
                followerChange: followerChange,
                credibilityChange: credibilityChange
            };
        });
        if (this.changeTimeoutID) {
            clearTimeout(this.changeTimeoutID);
            this.changeTimeoutID = null;
        }

        if (followerChange || credibilityChange) {
            this.changeTimeoutID = setTimeout(() => {
                this.setStateIfMounted(() => {
                    return {
                        followerChange: null,
                        credibilityChange: null
                    };
                });
                this.startReactDelay();
            }, 1500);

        } else {
            this.startReactDelay();
        }
    }

    updateDynamicFeedbackFollowers(followers, finished) {
        if (finished) {
            this.setStateIfMounted(() => {
                return {overrideFollowers: null};
            });
        } else {
            this.setStateIfMounted(() => {
                return {overrideFollowers: followers};
            });
        }
    }

    updateDynamicFeedbackCredibility(credibility, finished) {
        if (finished) {
            this.setStateIfMounted(() => {
                return {overrideCredibility: null};
            });
        } else {
            this.setStateIfMounted(() => {
                return {overrideCredibility: credibility};
            });
        }
    }

    submitPost(postIndex) {
        const game = this.state.game;
        if (!game)
            throw new Error("There is no active game");

        const inters = this.state.interactions;
        const postInters = inters.get(postIndex);

        if (postInters.isCompleted() || postInters.isEmpty())
            return {};

        const newInters = inters.update(postIndex, postInters.complete());
        this.submitInteractionsToGame(game, newInters);

        this.setState(() => {
            return {interactions: newInters};
        });
    }

    /**
     * Submits all posts up to and including maxPostIndex.
     */
    static completeAllPostInteractions(inters, maxPostIndex) {
        for (let index = 0; index <= maxPostIndex; ++index) {
            const previousPostInters = inters.get(index);
            if (!previousPostInters.isCompleted()) {
                inters = inters.update(index, previousPostInters.complete());
            }
        }
        return inters;
    }

    submitAll() {
        const game = this.state.game;
        if (!game)
            throw new Error("There is no active game");

        const inters = this.state.interactions;
        const postCount = game.study.basicSettings.length;
        const newInters = GameScreen.completeAllPostInteractions(inters, postCount - 1);
        this.submitInteractionsToGame(game, newInters);

        this.setState(() => {
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
            this.scrollToNextPost(true);
        } else {
            this.submitPost(currentPostIndex);
        }
    }

    scrollToNextPost(smoothScroll, postIndex) {
        this.scrollTracker.detect();

        if (postIndex === undefined) {
            // Search visually for the next post.
            let nextPostIndex = 0;
            let nextPostBBox;
            do {
                nextPostBBox = this.scrollTracker.get(nextPostIndex);
                if (!nextPostBBox)
                    return;
                if (nextPostBBox.y > 80)
                    break;

                nextPostIndex += 1;
            } while (true);

            postIndex = nextPostIndex;

            // Preemptively submit the post we will scroll past.
            const postToSubmit = postIndex - 1;
            if (postToSubmit >= 0) {
                this.onPostScrolledOffScreen(postToSubmit);
            }
        }

        // Get the post to scroll it into view.
        const nextPostElement = document.getElementById("post-" + postIndex);
        if (!nextPostElement)
            throw new Error("Unable to find the element for the next post (" + postIndex + ")");

        nextPostElement.scrollIntoView({
            behavior: (smoothScroll ? "smooth" : "auto")
        });
    }

    getFeedDiv() {
        return document.getElementById("post-feed");
    }

    renderWithStudyAndGame(study, game) {
        let displayStates = game.states;

        const participant = game.participant;
        const displayPrompt = !this.state.dismissedPrompt;
        const error = this.state.error;

        const interactions = this.state.interactions;
        const currentPostIndex = interactions.getSubmittedPostsCount();

        const totalPosts = game.study.basicSettings.length;
        const progressPercentage = Math.round(currentPostIndex / totalPosts * 100);

        let nextPostEnabled = true;
        let nextPostError = "";
        let reactionsAllowed = this.state.allowReactions;
        let displayGameEnd = game.isFinished();
        if (!study.uiSettings.displayPostsInFeed) {
            let displayPostIndex = currentPostIndex;
            const pauseOnPost = (
                this.state.overrideFollowers !== null ||
                this.state.overrideCredibility !== null ||
                this.state.followerChange !== null ||
                this.state.credibilityChange !== null
            );
            if (pauseOnPost) {
                reactionsAllowed = false;
                displayGameEnd = false;
                displayPostIndex -= 1;
            }

            if (displayPostIndex < displayStates.length) {
                displayStates = [displayStates[displayPostIndex]];
                const postInteraction = interactions.get(displayPostIndex)
                const madePostReaction = (postInteraction.postReactions.length > 0);
                const madeUserComment = (postInteraction.comment !== null);

                nextPostEnabled = false;
                if (study.basicSettings.requireReactions && !madePostReaction) {
                    nextPostError = "Please react to the post";
                } else if (study.areUserCommentsRequired() && !madeUserComment) {
                    nextPostError = "Please comment on the post";
                } else {
                    nextPostEnabled = true;
                }
            }
        }

        // Generate the post components.
        const postComponents = [];
        if (!error && !displayGameEnd) {
            for (let index = 0; index < displayStates.length; ++index) {
                const state = displayStates[index];
                const interaction = interactions.get(state.indexInGame);
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
                        enabled={reactionsAllowed}
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
                            nextPostEnabled={nextPostEnabled && reactionsAllowed}
                            progressPercentage = {progressPercentage}
                            onNextPost={() => {
                                if (nextPostEnabled && reactionsAllowed) {
                                    this.onNextPost();
                                }
                            }}
                            nextPostText={
                                displayGameEnd ?
                                    "The simulation is complete!" :
                                (!nextPostEnabled ?
                                    nextPostError :
                                (!reactionsAllowed ?
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
                        {!displayGameEnd && study.uiSettings.displayPostsInFeed &&
                            <FeedEnd onContinue={() => this.submitAll(game)} />}

                        {/* If the game is finished, display a game completed prompt. */}
                        {displayGameEnd && <GameFinished study={study} game={game} />}

                        {/* If there is an error, display it here. */}
                        {error && <ErrorLabel value={error} />}

                        {/* Used for reserving space below reactions and progress. */}
                        <div className="h-56 md:h-8" />
                    </div>

                    {/* Space to the right. */}
                    <div className="flex-1" />
                    <div className="flex-1" />
                </div>
            </>
        );
    }
}