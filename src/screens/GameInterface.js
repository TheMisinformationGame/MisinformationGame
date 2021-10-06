import React from 'react';
import {Component} from "react";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {getDataManager} from "../model/manager";
import {isOfType} from "../utils/types";
import {PromiseImage} from "../components/PromiseImage";
import {GamePrompt} from "./GamePrompt";
import {ContinueButton} from "../components/ContinueButton";
import {ErrorLabel} from "../components/StatusLabel"
import {CredibilityLabel} from "../components/CredibilityLabel"
import {ActiveGameScreen} from "./ActiveGameScreen";
import {ConditionalLink} from "../components/ConditionalLink";


class Source extends Component {
    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");
        return (
            <div className={"flex " + (this.props.className || "")}>
                <div className={"mr-2 " + (small ? "h-8" : "h-12")}>
                    <PromiseImage className="h-full"
                                  imageClassName="rounded-full shadow"
                                  loadingSpinner={small ? "small" : ""}
                                  image={getDataManager().getStudyImage(
                            source.study, source.source.id, source.source.avatar
                    )} />
                </div>
                <div>
                    <div className="flex">
                        <p className={text_xl}>{source.source.name}</p>
                        <CredibilityLabel credibility={source.credibility} className={text_xl} />
                    </div>

                    {!small &&
                    <div className="flex">
                        <p className="text-sm">
                            {Math.round(source.followers)}&nbsp;followers
                        </p>
                    </div>}
                </div>
            </div>
        );
    }
}

class Comment extends Component {
    render() {
        return (
            <div className={"flex flex-col p-1 pl-3 pr-2 mb-1 bg-white shadow" +
                            (this.props.className || "")}>

                <p className="w-full underline text-gray-700">{this.props.sourceName}</p>
                <p className="w-full text-lg ml-1">{this.props.message}</p>
            </div>
        );
    }
}

class ReactButton extends Component {
    render() {
        const reaction = this.props.reaction;
        const selectionExists = (this.props.selected !== null);
        const selected = (reaction === this.props.selected);
        return (
            <div id={reaction}
                 title={this.props.title}
                 className={
                     " group h-12 w-16 pt-1.5 px-1 sm:px-3 md:px-4 rounded text-center " +
                     " fill-current transition duration-100 " +
                     (selected ? " bg-gray-100 " : " hover:bg-gray-100 ") +
                     (this.props.enabled ? " cursor-pointer " : "") +
                     (this.props.enabled && (selected || !selectionExists) ?
                         (selected ? " text-blue-700 " : " text-gray-700 ")
                         : " text-gray-500 ") +
                     (this.props.className || "")}
                 style={{fontSize: (this.props.fontSize || "2.5rem")}}
                 onClick={() => {
                    if (this.props.enabled) {
                        this.props.onReact(reaction);
                    }
                 }}>

                {React.cloneElement(this.props.children, {
                    className: "fill-current " +
                        (this.props.enabled ? "transform group-hover:scale-110 " : "") +
                        (this.props.childClassName || ""),
                    fontSize: "inherit"
                })}
            </div>
        );
    }
}

class ReactionsRow extends Component {
    render() {
        const onReact = this.props.onReact;
        const enabled = this.props.enabled;
        const selected = this.props.selectedReaction;
        return (
            <div className="text-lg flex flex-row p-2">
                <div className="flex flex-grow">
                    <ReactButton reaction="like" selected={selected} onReact={onReact} enabled={enabled}
                                 childClassName="transform -translate-y-0.5 -translate-x-1"
                                 title="Like" className="mr-1">
                        <ThumbUpIcon/></ReactButton>
                    <ReactButton reaction="dislike" selected={selected} onReact={onReact} enabled={enabled}
                                 childClassName="transform -translate-y-0.5 -translate-x-1"
                                 title="Dislike" className="mr-1">
                        <ThumbDownIcon/></ReactButton>
                    <ReactButton reaction="share" selected={selected} onReact={onReact} enabled={enabled}
                                 fontSize="3.25rem" className="mr-1 transform flip-x"
                                 childClassName="transform -translate-y-2.5 -translate-x-3"
                                 title="Share">
                        <ReplyIcon/></ReactButton>
                    <ReactButton reaction="flag" selected={selected} onReact={onReact} enabled={enabled}
                                 fontSize="2.6rem"
                                 childClassName="transform -translate-y-1 -translate-x-1"
                                 title="Flag" className="mr-1">
                        <FlagIcon/></ReactButton>
                </div>

                <ReactButton reaction="skip" selected={selected} onReact={onReact} enabled={enabled}
                             className="w-30" fontSize="1.25rem" childClassName="transform translate-y-1">
                    <p>Skip Post</p>
                </ReactButton>
            </div>
        );
    }
}

class PostComponent extends Component {
    render() {
        const state = this.props.state;
        const post = state.currentPost.post;
        const commentComponents = [];
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            commentComponents.push(
                <Comment sourceName={comment.sourceName} message={comment.message}
                         key={index + "." + comment.sourceName} />
            );
        }

        let postContent;
        if (isOfType(post.content, "string")) {
            postContent = (
                <p className="text-lg font-normal p-2 pt-0" dangerouslySetInnerHTML={{__html: post.content}} />
            );
        } else {
            postContent = (<PromiseImage image={
                getDataManager().getStudyImage(state.study, post.id, post.content)
            } />);
        }

        return (
            <div className="flex flex-col">
                <div className="bg-white shadow">
                    {/* The source of the post. */}
                    <div className="flex p-2 bg-white">
                        <Source source={state.currentSource} />
                    </div>

                    {/* The content of the post. */}
                    <div className="flex flex-col flex-grow text-left text-2xl bg-white
                                    font-bold">

                        <p className="p-2 mb-1">{post.headline}</p>
                        {postContent}
                    </div>

                    {/* The reactions to the post. */}
                    <hr />
                    <ReactionsRow onReact={this.props.onReact} enabled={this.props.enableReactions}
                                  selectedReaction={this.props.selectedReaction} />
                </div>

                {/* The comments on the post. */}
                {commentComponents.length > 0 &&
                    <p className="font-bold text-gray-600 p-1">Comments:</p>}
                {commentComponents}
            </div>
        );
    }
}

class GameFinished extends Component {
    render() {
        const target = "/game/" + getDataManager().getActiveStudyID() + "/debrief";
        return (
            <div className="flex justify-center items-center">
                <div className="bg-white shadow">
                    <div className="grid space-y-2 px-10 py-4 max-w-full text-center
                                    fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <p className="text-xl"> Congratulations! You have completed the study. </p>
                        {/* TODO Possibly put the debrief message here? or  */}
                        <ContinueButton to={target} condition={true} />
                    </div>
                </div>
            </div>
        )
    }
}

class ParticipantProgress extends Component {
    render() {
        const participant = this.props.participant;
        const nextPostEnabled = this.props.nextPostEnabled;
        return (
            <div className="fixed w-full md:max-w-xl bottom-0 left-1/2 transform -translate-x-1/2
                                    shadow-2xl md:border-l-2 md:border-r-2 md:border-opacity-0">
                <div className="p-2 px-4 pb-3 bg-white border-t border-gray-400">
                    <p className="text-xl font-bold mb-1">
                        Your Progress
                    </p>
                    <p className="text-xl">
                        <SupervisedUserCircleIcon className="align-bottom mr-1" />
                        <span>&nbsp;{Math.round(participant.followers)}&nbsp;</span>
                        {Math.round(participant.followers) === 1 ? "Follower" : "Followers"}

                        <CheckCircleIcon className="align-bottom ml-6 mr-1" />
                        Credibility:
                        <CredibilityLabel credibility={participant.credibility}
                                          className={"transform translate-y-2" /* There has to be a better way... */} />
                    </p>

                    <div onClick={this.props.onNextPost}
                         title={nextPostEnabled ? "" :
                             "You must react to the post before you can continue to the next post"}
                         className={
                             " mt-3 px-3 py-2 rounded-md text-white select-none " +
                             (nextPostEnabled ? " cursor-pointer " : "") +
                             (nextPostEnabled ?
                                 " bg-blue-500 active:bg-blue-600 hover:bg-blue-600 " : " bg-gray-400 ")
                         }>

                        Continue to Next Post
                    </div>
                </div>
            </div>
        );
    }
}

export class GameScreen extends ActiveGameScreen {
    constructor(props) {
        super(props);
        this.defaultState = {
            ...this.defaultState,
            error: null,
            reactionsAllowed: false,
            selectedReaction: null,
            dismissedPrompt: false,

            postShowTime: null,
            firstInteractTime: null
        };
        this.state = this.defaultState;
    }

    onPromptContinue() {
        // Dismiss the prompt and disable the reactions for a brief period of time.
        this.updateGameState(this.state.game, this.state.error, true);
    }

    onClickReaction(reaction) {
        // If the selected reaction is clicked, toggle it off.
        if (this.state.selectedReaction === reaction) {
            reaction = null;
        }

        const state = {...this.state, selectedReaction: reaction};
        if (state.firstInteractTime === null) {
            state.firstInteractTime = Date.now();
        }
        this.setState(state);
    }

    onUserReact(reaction, game) {
        const postShowTime = this.state.postShowTime;
        const firstInteractMS = this.state.firstInteractTime - postShowTime;
        const lastInteractMS = Date.now() - postShowTime;

        game.advanceState(reaction, firstInteractMS, lastInteractMS);
        this.updateGameState(game, null);
    }

    updateGameState(game, error, setDismissedPrompt) {
        const state = {
            ...this.state,
            state: (game && !game.isFinished() ? game.getCurrentState() : null),
            error: error,
            reactionsAllowed: (!this.state.dismissedPrompt && !game),
            selectedReaction: null,
            postShowTime: Date.now(),
            firstInteractTime: null
        };
        if (setDismissedPrompt) {
            state.dismissedPrompt = true;
        }

        this.setStateIfMounted(state);
        if ((this.state.dismissedPrompt || setDismissedPrompt) && game) {
            game.preloadNextState();
            setTimeout(() => {
                this.setStateIfMounted({...this.state, reactionsAllowed: true});
            }, game.study.reactDelaySeconds * 1000);
        }
    }

    renderWithStudyAndGame(study, game) {
        const state = game.isFinished() ? null : game.getCurrentState();
        const participant = game.participant;
        const displayPrompt = state && !this.state.dismissedPrompt;
        const error = this.state.error;
        return (
            <>
                {displayPrompt &&
                    <GamePrompt study={state.study} onClick={() => this.onPromptContinue()} />}

                <div className={"w-full bg-gray-100 " + (displayPrompt ? "filter blur" : "")}
                     style={{minHeight: "100vh"}}>

                    <div className="w-full md:max-w-xl ml-auto mr-auto bg-gray-200
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={{minHeight: "100vh"}}>

                        {/* Post, reactions, and comments. */}
                        {state && !error &&
                            <PostComponent state={state}
                                           onReact={r => this.onClickReaction(r)}
                                           enableReactions={this.state.reactionsAllowed}
                                           selectedReaction={this.state.selectedReaction} />}

                        {/* If the game is finished, display a game completed prompt. */}
                        {game && game.isFinished() &&
                            <GameFinished />
                        }

                        {/* If there is an error, display it here. */}
                        {error && <ErrorLabel value={error} />}

                        {/* Used for reserving space below reactions and progress. */}
                        <div className="h-40" />
                    </div>

                    {/* Progress. */}
                    {participant && !error &&
                        <ParticipantProgress participant={participant}
                                             nextPostEnabled={this.state.selectedReaction !== null}
                                             onNextPost={() => {
                                                 const reaction = this.state.selectedReaction;
                                                 if (reaction) {
                                                     this.onUserReact(reaction, game);
                                                 }
                                             }} />}
                </div>
            </>
        );
    }
}
