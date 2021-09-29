import "../App.css"
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
import {ActiveStudyScreen} from "./ActiveStudyScreen";
import {ContinueButton} from "../components/ContinueButton";
import {ErrorLabel} from "../components/StatusLabel"
import {CredibilityLabel} from "../components/CredibilityLabel"


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
            <div className={"flex flex-col p-1 px-2 mb-1 bg-white shadow" +
                            (this.props.className || "")}>
                <Source source={this.props.source} small={true} />
                <p className="w-full">{this.props.message}</p>
            </div>
        );
    }
}

class ReactButton extends Component {
    render() {
        return (
            <div id={this.props.reaction}
                 className={
                     "group h-12 w-16 pt-1.5 px-2 sm:px-3 md:px-4 rounded text-center " +
                     "fill-current transition duration-100 hover:bg-gray-100 " +
                     (this.props.enabled ? "text-gray-700 cursor-pointer " : "text-gray-500 ") +
                     (this.props.className || "")}
                 style={{fontSize: (this.props.fontSize || "2.5rem")}}
                 onClick={() => {
                    if (this.props.enabled) {
                        this.props.onReact(this.props.reaction);
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
        return (
            <div className="text-lg flex flex-row p-2">
                <div className="flex flex-grow">
                    <ReactButton reaction="like" onReact={onReact} enabled={enabled}
                                 childClassName="transform -translate-y-0.5 -translate-x-1">
                        <ThumbUpIcon/></ReactButton>
                    <ReactButton reaction="dislike" onReact={onReact} enabled={enabled}
                                 childClassName="transform -translate-y-0.5 -translate-x-1">
                        <ThumbDownIcon/></ReactButton>
                    <ReactButton reaction="share" onReact={onReact} enabled={enabled}
                                 fontSize="3.25rem"
                                 className="transform flip-x"
                                 childClassName="transform -translate-y-2.5 -translate-x-3">
                        <ReplyIcon/></ReactButton>
                    <ReactButton reaction="flag" onReact={onReact} enabled={enabled}
                                 fontSize="2.6rem"
                                 childClassName="transform -translate-y-1 -translate-x-1">
                        <FlagIcon/></ReactButton>
                </div>

                <ReactButton reaction="skip" onReact={onReact} enabled={enabled} className="w-30"
                             fontSize="1.25rem" childClassName="transform translate-y-1">
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
            const source = state.findSource(comment.sourceID);
            commentComponents.push(
                <Comment source={source} message={comment.message} key={source.source.id} />
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
                    <ReactionsRow onReact={this.props.onReact} enabled={this.props.enableReactions} />
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
                </div>
            </div>
        );
    }
}

export class GameScreen extends ActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {
            game: null,
            state: null,
            participant: null,
            error: null,
            reactionsAllowed: false,
            dismissedPrompt: false
        };
    }

    componentDidMount() {
        getDataManager().getActiveGame().then(game => {
            this.updateGameState(game, null);
        }).catch((err) => {
            console.error(err);
            this.updateGameState(null, err.message);
        });
    };

    updateGameState(game, error) {
        const state = {
            ...this.state,
            game: game,
            state: (game && !game.isFinished() ? game.getCurrentState() : null),
            participant: (game ? game.participant : null),
            error: error,
            reactionsAllowed: !game
        };
        this.setState(state);
        if (game) {
            setTimeout(() => {
                this.setState({...this.state, reactionsAllowed: true});
                game.preloadNextState();
            }, game.study.reactDelaySeconds * 1000);
        }
    }

    onPromptContinue() {
        this.setState({...this.state, dismissedPrompt: true})
    }

    onUserReact(reaction) {
        getDataManager().getActiveGame().then(game => {
            game.advanceState(reaction);
            this.updateGameState(game, null);
        });
    }

    render() {
        // We have to use min-height: 100vh, as the Tailwind min-h-full doesn't work :(
        const fullHeightStyle = {minHeight: "100vh"};

        const state = this.state.state;
        const game = this.state.game;
        const displayPrompt = state && !this.state.dismissedPrompt;
        const participant = this.state.participant;
        const error = this.state.error;
        return (
            <>
                {displayPrompt &&
                    <GamePrompt study={state.study} onClick={() => this.onPromptContinue()} />}

                <div className={"w-full bg-gray-100 " + (displayPrompt ? "filter blur" : "")}
                     style={fullHeightStyle}>

                    <div className="w-full md:max-w-xl ml-auto mr-auto bg-gray-200
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={fullHeightStyle}>

                        {/* Post, reactions, and comments. */}
                        {state && !error &&
                            <PostComponent state={state}
                                           onReact={r => this.onUserReact(r)}
                                           enableReactions={this.state.reactionsAllowed} />}

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
                    {participant && !error && <ParticipantProgress participant={participant} />}
                </div>
            </>
        );
    }
}
