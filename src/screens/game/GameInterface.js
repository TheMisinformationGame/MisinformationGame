import React from 'react';
import {Component} from "react";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';
import {getDataManager} from "../../model/manager";
import {isOfType} from "../../utils/types";
import {PromiseImage} from "../../components/PromiseImage";
import {GamePrompt} from "./GamePrompt";
import {ContinueButton} from "../../components/ContinueButton";
import {ErrorLabel, ProgressLabel} from "../../components/StatusLabel"
import {CredibilityLabel} from "../../components/CredibilityLabel"
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Redirect} from "react-router-dom";
import {MountAwareComponent} from "../../components/MountAwareComponent";
import {ParticipantProgress} from "../../components/ParticipantProgress";


class Source extends Component {
    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");
        return (
            <div className={"flex " + (this.props.className || "")}>
                <div className={"mr-2 " + (small ? "h-8" : "h-12")}>
                    {source.source.avatar &&
                        <PromiseImage className="h-full"
                                      imageClassName={
                                          "rounded-full object-cover shadow " +
                                          (small ? "h-8 w-8" : "h-12 w-12")
                                      }
                                      loadingSpinner={small ? "small" : ""}
                                      image={getDataManager().getStudyImage(
                                          source.study, source.source.id, source.source.avatar
                                      )} />}

                    {!source.source.avatar &&
                        <div className={
                            "flex rounded-full object-cover shadow justify-center items-center text-2xl text-bold " +
                            (small ? "h-8 w-8" : "h-12 w-12")
                        }>
                            <span>
                                {source.source.name[0]}
                            </span>
                            {/* @Danny Marwick fill in avatar placeholder here */}
                        </div>}
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
        const onReact = this.props.onReact;
        const enabled = this.props.enabled;
        const selected = this.props.selectedReaction;
        const likes = this.props.likeCounts;
        const study = this.props.study;

        var reactions = ["dislike", "like"];
        var commentReactions = [];

        const icons = {
            "like": <ThumbUpIcon/>,
            "dislike": <ThumbDownIcon/>,
        };

        const countsReact = {
            "like": likes,
            "dislike": 100
        }

        for (let index = 0; index < reactions.length; ++index) {
            const reaction = reactions[index];
            if (!study.commentEnabledReactions[reaction])
                continue;

            if(reaction == "like"){
                var right = "0.8rem"
            }else{
                var right = "0.7rem"
            }; 

            commentReactions.push(
                <CommentReactButton
                    reaction={reaction + "_comment"} selected={selected} onReact={onReact} enabled={enabled} countNumber = {countsReact[reaction]}
                    childClassName="transform -translate-y-3 -translate-x-1"
                    marginRight = {right} marginTop = "-0.5rem"
                    title={reaction} className="mr-1"
                >
                    {icons[reaction]}
                </CommentReactButton>
            )
        };

        return (
            <div className={"flex flex-col p-1 pr-2 mb-1 bg-white shadow" +
                        (this.props.className || "")}>
                <div className="flex mb-4">
                    <div className="w-3/5">
                        <p className="w-full underline text-gray-700">{this.props.sourceName}</p>
                        <p className="w-full text-lg ml-1">{this.props.message}</p>
                    </div>
                    <div className = {"flex flex-row-reverse flex-grow flex-wrap p-1 pr-2 mb-1 bg-white w-2/5"}>
                        {commentReactions}
                    </div>
                </div>
            </div>
        );
    }
}


class CommentReactButton extends Component {
    render() {
        const reaction = this.props.reaction;
        const selectionExists = (this.props.selected !== null);
        const selected = (reaction === this.props.selected);
        const count = this.props.countNumber;

        const paraStyle = {
            marginTop : (this.props.marginTop || "0rem") ,
            marginRight: (this.props.marginRight|| "0rem"),
            fontSize: '0.95rem',
            fontWeight: 'bold'
        }

        return (
            <div id={reaction}
                 title={this.props.title}
                 className={
                     " group h-11 w-13 pt-1.5 pb-0.5 px-1 sm:px-3 md:px-4 rounded text-center" +
                     " fill-current transition duration-100 " +
                     (selected ? " bg-gray-100 font-semibold " : " hover:bg-gray-100 ") +
                     (this.props.enabled ? " cursor-pointer " : "") +
                     (this.props.enabled && (selected || !selectionExists) ?
                         (selected ? " text-blue-700 " : " text-gray-700 ")
                         : " text-gray-500 ") +
                     (this.props.className || "")}
                 style={{fontSize: (this.props.fontSize || "2rem")}}
                 onClick={() => {
                    if (this.props.enabled) {
                        this.props.onReact(reaction);
                    }
                 }}>

                {React.cloneElement(this.props.children, {
                    className: "fill-current "  + 
                        (this.props.enabled ? "transform group-hover:scale-110 " : "") +
                        (this.props.childClassName || "")
                        ,
                    fontSize: "inherit"
                })}
                <p style = {paraStyle} >
                    {count}
                </p>
            </div>
        );
    }
}

class ReactButton extends Component {
    render() {
        const reaction = this.props.reaction;
        const selectionExists = (this.props.selected !== null);
        const selected = (reaction === this.props.selected);
        const count = this.props.reactionCount;

        return (
            <div id={reaction}
                 title={this.props.title}
                 className={
                     " group h-12 w-16 pt-1.5 px-1 sm:px-3 md:px-4 rounded text-center " +
                     " fill-current transition duration-100 " +
                     (selected ? " bg-gray-100 font-semibold " : " hover:bg-gray-100 ") +
                     (this.props.enabled ? " cursor-pointer " : "") +
                     (this.props.enabled && (selected || !selectionExists) ?
                         (selected ? " text-blue-700 " : " text-gray-700 ")
                         : " text-gray-500 ") +
                     (this.props.className  || "")}
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

                {count !== undefined &&
                    <p className="text-lg font-bold" >
                        {Math.round(count)}
                    </p>}
            </div>
        );
    }
}

class ReactionsRow extends Component {
    render() {
        const onReact = this.props.onReact;
        const enabled = this.props.enabled;
        const selected = this.props.selectedReaction;
        const study = this.props.study;
        const post = this.props.post;

        const buttons = [];
        const reactions = ["like", "dislike", "share", "flag"];
        const titles = {
            "like": "Like",
            "dislike": "Dislike",
            "share": "Share",
            "flag": "Flag"
        };
        const icons = {
            "like": <ThumbUpIcon/>,
            "dislike": <ThumbDownIcon/>,
            "share": <ReplyIcon/>,
            "flag": <FlagIcon/>
        };
        for (let index = 0; index < reactions.length; ++index) {
            const reaction = reactions[index];
            if (!study.postEnabledReactions[reaction])
                continue;

            buttons.push(
                <ReactButton reaction={reaction} key={reaction}
                             selected={selected} onReact={onReact}
                             enabled={enabled}
                             reactionCount={post.numberOfReactions[reaction]}
                             childClassName="transform -translate-y-0.5 -translate-x-1"
                             title={titles[reaction]}
                             className="mr-1">

                    {icons[reaction]}
                </ReactButton>
            );
        }

        return (
            <div className="text-lg flex flex-wrap flex-row pt-2 pb-6 px-2">
                <div className="flex flex-grow">
                    {buttons}
                </div>

                <ReactButton reaction="skip" selected={selected} onReact={onReact} enabled={enabled}
                             className="w-32" fontSize="1.25rem" childClassName="transform translate-y-1">
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
                <Comment sourceName={comment.sourceName} message={comment.message} likeCounts = {comment.likes}
                         key={index + "." + comment.sourceName} onReact={this.props.onReact} enabled={this.props.enableReactions}
                         selectedReaction={this.props.selectedReaction} study = {state.study}/>
            );
        }

        let postContent;
        if (isOfType(post.content, "string")) {
            postContent = (
                <p className="text-lg font-normal p-2 pt-0" dangerouslySetInnerHTML={{__html: post.content}} />
            );
        } else {
            postContent = (<div className="flex justify-center bg-gray-200 max-h-60vh shadow-inner overflow-hidden">
                <PromiseImage image={
                    getDataManager().getStudyImage(state.study, post.id, post.content)
                } imageClassName="object-contain shadow" style={{maxHeight: "50vh"}} />
            </div>);
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

                    {/* The reactions to the post and their counts. */}
                    <hr />
                    <ReactionsRow onReact={this.props.onReact}
                                  enabled={this.props.enableReactions}
                                  selectedReaction={this.props.selectedReaction}
                                  study={state.study}
                                  post={state.currentPost} />
                </div>

                {/* The comments on the post. */}
                {commentComponents.length > 0 &&
                    <p className="font-bold text-gray-600 p-1">Comments:</p>}
                {commentComponents}
            </div>
        );
    }
}

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
                        Congratulations! You have completed the study.
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

export class GameScreen extends ActiveGameScreen {
    constructor(props) {
        super(props);
        this.defaultState = {
            ...this.defaultState,
            currentState: null,

            error: null,
            reactionsAllowed: false,
            selectedReaction: null,
            dismissedPrompt: false,

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
            inputEnabled: true,

            postShowTime: null,
            firstInteractTime: null
        };
        this.state = this.defaultState;
    }

    afterGameLoaded(game) {
        super.afterGameLoaded(game);
        setTimeout(() => {
            this.updateGameState(game, null);
        });
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

        const beforeFollowers = Math.round(game.participant.followers);
        const beforeCredibility = Math.round(game.participant.credibility);
        game.advanceState(reaction, firstInteractMS, lastInteractMS);

        const followerChange = Math.round(game.participant.followers) - beforeFollowers;
        const credibilityChange = Math.round(game.participant.credibility) - beforeCredibility;

        // If there is no change, skip any animation.
        if (followerChange === 0 && credibilityChange === 0) {
            this.updateGameState(game, null);
            return;
        }

        const animateTimeMS = 500;
        const remainTimeMS = 1000;

        // Show the change in followers and credibility.
        this.setState({
            ...this.state,
            overrideFollowers: beforeFollowers,
            overrideCredibility: beforeCredibility,
            followerChange: followerChange,
            credibilityChange: credibilityChange,
            inputEnabled: false
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
                        overrideFollowers: followers,
                        overrideCredibility: credibility,
                        followerChange: followerChange,
                        credibilityChange: credibilityChange,
                        inputEnabled: false
                    });
                }, stage * animateTimeMS / maxStages);
            }
        }

        // The final timeout to change to the next post.
        setTimeout(() => {
            this.updateGameState(game, null);
        }, animateTimeMS + remainTimeMS);
    }

    updateGameState(game, error, setDismissedPrompt) {
        const state = {
            ...this.state,
            currentState: (game && !game.isFinished() ? game.getCurrentState() : null),

            error: error,
            reactionsAllowed: (!this.state.dismissedPrompt && !game),
            selectedReaction: null,
            postShowTime: Date.now(),
            firstInteractTime: null,

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
        if ((this.state.dismissedPrompt || setDismissedPrompt) && game) {
            game.preloadNextState();
            setTimeout(() => {
                this.setStateIfMounted({...this.state, reactionsAllowed: true});
            }, game.study.reactDelaySeconds * 1000);
        }
    }

    renderWithStudyAndGame(study, game) {
        const stage = game.getCurrentStage();
        if (stage === "identification")
            return (<Redirect to={"/study/" + study.id + "/id" + window.location.search} />);

        const state = this.state.currentState;
        const participant = game.participant;
        const displayPrompt = !this.state.dismissedPrompt;
        const error = this.state.error;
        const finished = game.isFinished();
        const nextPostEnabled = (this.state.selectedReaction !== null);
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
                            fancyPositioning={true}
                            participant={participant}
                            overrideFollowers={this.state.overrideFollowers}
                            overrideCredibility={this.state.overrideCredibility}
                            nextPostEnabled={nextPostEnabled && this.state.inputEnabled}
                            onNextPost={() => {
                                const reaction = this.state.selectedReaction;
                                if (reaction) {
                                    this.onUserReact(reaction, game);
                                }
                            }}
                            nextPostText={
                                finished ?
                                    "The study is complete!" :
                                nextPostEnabled ?
                                    "Continue to Next Post" :
                                    "React to the post to continue"
                            }
                            followerChange={this.state.followerChange}
                            credibilityChange={this.state.credibilityChange}/>}

                    {/* Space in the middle. */}
                    <div className="flex-1 max-w-mini" />

                    {/* */}
                    <div className="bg-gray-200 w-full md:max-w-xl
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={{minHeight: "100vh"}}>

                        {/* Post, reactions, and comments. */}
                        {state && !error &&
                            <PostComponent
                                state={state}
                                onReact={r => this.onClickReaction(r)}
                                enableReactions={this.state.reactionsAllowed && this.state.inputEnabled}
                                selectedReaction={this.state.selectedReaction} />}

                        {/* If the game is finished, display a game completed prompt. */}
                        {!state && finished && <GameFinished study={study} game={game} />}

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
