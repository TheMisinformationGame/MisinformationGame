import React, {Component} from 'react';
import {GamePrompt} from "./GamePrompt";
import {ContinueButton} from "../../components/ContinueButton";
import {ErrorLabel, ProgressLabel} from "../../components/StatusLabel"
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Redirect} from "react-router-dom";
import {MountAwareComponent} from "../../components/MountAwareComponent";
import {ParticipantProgress} from "./ParticipantProgress";
import {GamePostInteractionStore} from "../../model/game";
import smoothscroll from 'smoothscroll-polyfill';
import {PostComponent} from "./Post";
import {ScrollAnchor} from "../../components/scrollAnchor";


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

        this.setState({...this.defaultState});
        promise.then(() => {
            this.setStateIfMounted({
                saving: false,
                saved: true,
                error: null
            });
        }).catch(error => {
            console.error(error);
            this.setStateIfMounted({
                saving: false,
                saved: false,
                error: error.message
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
                <div className="px-10 py-8 max-w-full text-center">
                    <p className="block text-xl mb-4">
                        Congratulations! You have completed the simulation.
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
        super(props);
        this.defaultState = {
            ...this.defaultState,
            currentStates: null,

            error: null,
            reactionsAllowed: false,

            interactions: GamePostInteractionStore.empty(),
            commentHasBeenEdited: false,

            dismissedPrompt: false,

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
            inputEnabled: true,
        };
        this.state = this.defaultState;
        this.scrollAnchor = new ScrollAnchor(this.getFeedDiv.bind(this));
        this.scrollListener = null;
        this.scrollDebounceEnd = 0;
        this.lastScrollTop = document.documentElement.scrollTop;
        this.scrollFixId = null;
        this.scrollMaintenanceTop = 0;
    }

    afterGameLoaded(game) {
        super.afterGameLoaded(game);
        setTimeout(() => {
            this.updateGameState(game, null);
        });
    }

    componentDidMount() {
        super.componentDidMount();
        this.scrollAnchor.start();
        this.scrollListener = this.onScroll.bind(this);
        document.addEventListener("scroll", this.scrollListener);
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.scrollAnchor.stop();
        if (this.scrollListener !== null) {
            document.removeEventListener("scroll", this.scrollListener);
            this.scrollListener = null;
        }
        if (this.scrollDebounceTimer !== null) {
            clearTimeout(this.scrollDebounceTimer);
            this.scrollDebounceTimer = null;
        }
    }

    onPromptContinue() {
        // Dismiss the prompt and disable the reactions for a brief period of time.
        this.updateGameState(this.state.game, this.state.error, true);
    }

    onPostReaction(postIndex, reaction, study) {
        const inters = this.state.interactions;
        this.setState({
            ...this.state,
            interactions: inters.update(postIndex, inters.get(postIndex).withToggledPostReaction(
                reaction, study.uiSettings.allowMultipleReactions
            ))
        });
    }

    onCommentReaction(postIndex, commentIndex, reaction, study) {
        const inters = this.state.interactions;
        this.setState({
            ...this.state,
            interactions: inters.update(postIndex, inters.get(postIndex).withToggledCommentReaction(
                commentIndex, reaction, study.uiSettings.allowMultipleReactions
            ))
        });
    }

    onCommentSubmit(postIndex, comment) {
        const inters = this.state.interactions;
        this.setState({
            ...this.state,
            interactions: inters.update(postIndex, inters.get(postIndex).withComment(comment)),
            commentHasBeenEdited: false
        });
    }

    onCommentEdit(postIndex) {
        const inters = this.state.interactions;
        this.setState({
            ...this.state,
            interactions: inters.update(postIndex, inters.get(postIndex).withComment(null)),
            commentHasBeenEdited: false
        });
    }

    onCommentDelete(postIndex) {
        const inters = this.state.interactions;
        this.setState({
            ...this.state,
            interactions: inters.update(postIndex, inters.get(postIndex).withDeletedComment()),
            commentHasBeenEdited: false
        });
    }

    onCommentEditedStatusUpdate(postIndex, hasBeenEdited) {
        this.setState({
            ...this.state,
            commentHasBeenEdited: hasBeenEdited
        });
    }

    getHighestState() {
        const currentStates = this.state.currentStates;
        if (currentStates === undefined)
            throw new Error("There are no current states!");

        const currentState = this.state.currentStates[0];
        if (currentState === undefined)
            throw new Error("There is no current state!");

        return currentState;
    }

    getHighestInteractions() {
        return this.state.interactions.get(this.getHighestState().indexInGame);
    }

    getNextStateElement() {
        const states = this.state.currentStates;
        if (states === null || states.length < 2)
            return;

        return document.getElementById("post-" + states[1].indexInGame);
    }

    onScroll(event, isDebouncedCheck) {
        const time = Date.now();
        if (!isDebouncedCheck && time < this.scrollDebounceEnd)
            return;

        const lastScrollTop = this.lastScrollTop,
              newScrollTop = document.documentElement.scrollTop;

        this.lastScrollTop = newScrollTop;
        if (lastScrollTop && newScrollTop) {
            // We only want to trigger this when scrolling down.
            if (!isDebouncedCheck && newScrollTop <= lastScrollTop)
                return;
        }

        const game = this.state.game;
        const element = this.getNextStateElement();
        if (!game || !element || !this.state.inputEnabled)
            return;

        // Once the participant has scrolled such that the previous
        // post is completely off the screen, process it.
        const bounds = element.getBoundingClientRect();
        if (bounds.top < 0) {
            const delay = 2000;
            this.scrollDebounceEnd = time + delay;
            this.onNextPost(game, true);

            // Just in case, set up a timer in case the participant
            // scrolled past many posts quickly.
            if (this.scrollDebounceTimer !== null) {
                clearTimeout(this.scrollDebounceTimer);
            }
            this.scrollDebounceTimer = setTimeout(() => {
                this.scrollDebounceTimer = null;
                this.onScroll(null, true);
            }, delay);
        }
    }

    maintainScrollPosition() {
        // Abort the previous maintenance on the scroll position.
        if (this.scrollFixId !== null) {
            cancelAnimationFrame(this.scrollFixId);
        }

        // Maintain the scroll position after re-rendering.
        // Usually the scroll position won't be affected, but
        // occasionally it gets moved a lot.
        const states = this.state.currentStates;
        if (states && states.length > 1) {
            const state = states[states.length - 1],
                  elemID = "post-" + state.indexInGame + "-spacer",
                  elem = document.getElementById(elemID);

            if (elem) {
                this.scrollMaintenanceTop = elem.getBoundingClientRect().top;

                const fixScroll = (repetitions) => {
                    this.scrollFixId = null;

                    // Make sure the element hasn't been removed from the DOM.
                    const elem = document.getElementById(elemID);
                    if (!this.mounted || !elem)
                        return;

                    const newTop = elem.getBoundingClientRect().top;
                    const dy = newTop - this.scrollMaintenanceTop;

                    // Hopefully a good-enough heuristic.
                    if (Math.abs(dy) > 50) {
                        // window.scrollBy(0, Math.round(dy));
                    } else {
                        this.scrollMaintenanceTop += dy;
                    }
                    if (repetitions > 0) {
                        this.scrollFixId = requestAnimationFrame(() => fixScroll(repetitions - 1));
                    }
                }
                this.scrollFixId = requestAnimationFrame(() => fixScroll(2));
            }
        }
    }

    onNextPost(game, fromScroll) {
        const currentState = this.getHighestState();

        // Scroll the next post into view, if possible.
        const nextStateElement = this.getNextStateElement();
        if (!fromScroll && nextStateElement) {
            // We only want to scroll down, not up.
            const bounds = nextStateElement.getBoundingClientRect();
            if (bounds.top > 0) {
                nextStateElement.scrollIntoView({
                    behavior: "smooth"
                });
            }
        }

        // Apply the interaction the user made.
        const interaction = this.state.interactions.get(currentState.indexInGame);

        const beforeFollowers = Math.round(game.participant.followers);
        const beforeCredibility = Math.round(game.participant.credibility);
        game.advanceState(interaction);

        const followerChange = Math.round(game.participant.followers) - beforeFollowers;
        const credibilityChange = Math.round(game.participant.credibility) - beforeCredibility;

        // If there is no change, skip any animation.
        // We don't do this when displaying posts in a feed,
        // as we must wait for the next post to scroll into view.
        if (!game.study.uiSettings.displayPostsInFeed && followerChange === 0 && credibilityChange === 0) {
            this.updateGameState(game, null);
            return;
        }

        const animateTimeMS = 500;
        const remainTimeMS = 1000;

        // If the participant scrolled the next post into view,
        // we don't want to let them scroll back.
        const currentStates = this.state.currentStates;
        let newStates = currentStates,
            inputEnabled = false;

        if (fromScroll) {
            newStates = [];
            inputEnabled = true;
            for (let index = 1; index < currentStates.length; ++index) {
                newStates.push(currentStates[index]);
            }
            this.maintainScrollPosition();
        }

        // Show the change in followers and credibility.
        this.setState({
            ...this.state,
            currentStates: newStates,
            overrideFollowers: beforeFollowers,
            overrideCredibility: beforeCredibility,
            followerChange: followerChange,
            credibilityChange: credibilityChange,
            inputEnabled: inputEnabled
        });

        function roundInDir(value, direction) {
            if (direction < 0)
                return Math.floor(value);
            if (direction > 0)
                return Math.ceil(value);
            return Math.round(value);
        }

        // Animate the followers and credibility changing.
        const maxStages = 20;
        let lastFollowers = beforeFollowers;
        let lastCredibility = beforeCredibility;
        for (let stage = 1; stage <= maxStages; ++stage) {
            const ratio = stage / maxStages;
            const followers = roundInDir(beforeFollowers + followerChange * ratio, followerChange);
            const credibility = roundInDir(beforeCredibility + credibilityChange * ratio, credibilityChange);

            if (followers !== lastFollowers || credibility !== lastCredibility) {
                lastFollowers = followers;
                lastCredibility = credibility;
                setTimeout(() => {
                    this.setStateIfMounted({
                        ...this.state,
                        currentStates: newStates,
                        overrideFollowers: followers,
                        overrideCredibility: credibility,
                        followerChange: followerChange,
                        credibilityChange: credibilityChange,
                        inputEnabled: inputEnabled
                    });
                }, stage * animateTimeMS / maxStages);
            }
        }

        // The final timeout to change to the next post.
        setTimeout(() => {
            this.updateGameState(game, null);
            this.maintainScrollPosition();
        }, animateTimeMS + remainTimeMS);
    }

    submitAllRemaining(game) {
        const states = this.state.currentStates;
        for (let index = 0; index < states.length; ++index) {
            const state = states[index].indexInGame,
                  interaction = this.state.interactions.get(state);

            game.advanceState(interaction);
        }
        this.updateGameState(game, null);
    }

    updateGameState(game, error, setDismissedPrompt) {
        const displayPostsInFeed = game.study.uiSettings.displayPostsInFeed;
        const state = {
            ...this.state,
            currentStates: (game && !game.isFinished() ? game.getCurrentStates() : null),

            error: error,
            reactionsAllowed: displayPostsInFeed || (!this.state.dismissedPrompt && !game),

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
            inputEnabled: true,
        };
        if (setDismissedPrompt) {
            state.dismissedPrompt = true;
            game.dismissedPrompt = true;
        }

        this.setStateIfMounted(state);
        if (!displayPostsInFeed && (this.state.dismissedPrompt || setDismissedPrompt) && game) {
            game.preloadNextState();
            setTimeout(() => {
                this.setStateIfMounted({...this.state, reactionsAllowed: true});
            }, game.study.reactDelaySeconds * 1000);
        }
    }

    getFeedDiv() {
        return document.getElementById("post-feed");
    }

    renderWithStudyAndGame(study, game) {
        const stage = game.getCurrentStage();
        if (stage === "identification")
            return (<Redirect to={"/study/" + study.id + "/id" + window.location.search} />);

        let states = this.state.currentStates;
        if (!states || states.length === 0) {
            states = null;
        }

        const participant = game.participant;
        const displayPrompt = !this.state.dismissedPrompt;
        const error = this.state.error;
        const finished = game.isFinished();

        const interactions = this.state.interactions;

        const currentPostNumber = participant.postInteractions.length;
        const totalPosts = game.study.basicSettings.length;
        const progressPercentage = Math.round(currentPostNumber / totalPosts * 100);

        let nextPostEnabled = (states !== null);
        let nextPostError = "";
        if (!study.uiSettings.displayPostsInFeed && states !== null) {
            if (states.length > 1)
                throw new Error("It is unexpected to be in non-feed mode with more than one state active");

            const postInteraction = interactions.get(states[0].indexInGame)
            const madePostReaction = (postInteraction.postReactions.length > 0);
            const madeUserComment = (postInteraction.comment !== null);

            nextPostEnabled = false;
            if (this.state.commentHasBeenEdited) {
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
        if (!error && states !== null) {
            for (let index = 0; index < states.length; ++index) {
                const state = states[index];
                const postIndex = state.indexInGame,
                      postID = "post-" + state.indexInGame,
                      postSpacerID = postID + "-spacer";

                if (study.uiSettings.displayPostsInFeed) {
                    // The spacers help with scroll anchoring, which helps to
                    // avoid flickering when old posts are removed.
                    postComponents.push(
                        <div id={postSpacerID} key={postSpacerID} className={"h-8"}></div>
                    );
                }

                postComponents.push(
                    <PostComponent
                        id={postID}
                        key={postID}
                        state={state}
                        onPostReact={r => this.onPostReaction(postIndex, r, study)}
                        onCommentReact={(i, r) => this.onCommentReaction(postIndex, i, r, study)}
                        onCommentSubmit={value => this.onCommentSubmit(postIndex, value)}
                        onCommentEditedStatusUpdate={edited => this.onCommentEditedStatusUpdate(postIndex, edited)}
                        onCommentEdit={() => this.onCommentEdit(postIndex)}
                        onCommentDelete={() => this.onCommentDelete(postIndex)}
                        enableReactions={(index !== 0) || (this.state.reactionsAllowed && this.state.inputEnabled)}
                        interactions={interactions.get(postIndex)} />
                );
            }
        }

        return (
            <>
                {displayPrompt &&
                    <GamePrompt study={study} onClick={() => this.onPromptContinue()} />}

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
                                if (!nextPostEnabled)
                                    return;

                                const reactions = this.getHighestInteractions().postReactions;
                                if (!study.basicSettings.requireReactions || reactions.length > 0) {
                                    this.onNextPost(game, false);
                                }
                            }}
                            nextPostText={
                                finished ? "The simulation is complete!" :
                                    (nextPostEnabled ?
                                        (this.state.reactionsAllowed ?
                                            (study.uiSettings.displayPostsInFeed ?
                                                "Scroll to next post" : "Continue to next post")
                                            : "Please wait to continue")
                                        : nextPostError)
                            }
                            followerChange={this.state.followerChange}
                            credibilityChange={this.state.credibilityChange}/>}

                    {/* Space in the middle. */}
                    <div className="flex-1 max-w-mini" />

                    {/* The posts and their associated comments. */}
                    <div id="post-feed"
                         className="bg-gray-200 w-full md:max-w-xl
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={{minHeight: "100vh"}}>

                        {/* Post, reactions, and comments. */}
                        {postComponents}

                        {/* The end of the feed. */}
                        {states !== null && study.uiSettings.displayPostsInFeed && game.areNoNextStates() &&
                            <FeedEnd onContinue={() => this.submitAllRemaining(game)} />}

                        {/* If the game is finished, display a game completed prompt. */}
                        {states === null && finished && <GameFinished study={study} game={game} />}

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