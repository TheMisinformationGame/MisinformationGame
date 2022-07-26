import React from 'react';
import {Component} from "react";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
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
import {GamePostInteraction} from "../../model/game";
import {UserComment} from "../../model/study";
import {ConfirmationDialog} from "../../components/ConfirmationDialog";


class SourceElement extends Component {
    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");

        const sourceStyle = (source.study.genRandomDefaultAvatars ? source.source.style : {});
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
                        } style={sourceStyle}>
                            <span>
                                {source.source.name[0]}
                            </span>
                        </div>}
                </div>
                <div>
                    <div className={"flex " + (small || source.study.displayFollowers ? "" : "pt-1")}>
                        <p className={text_xl}>{source.source.name}</p>
                        {source.study.displayCredibility &&
                            <CredibilityLabel credibility={source.credibility} className={text_xl} />}
                    </div>

                    {!small && source.study.displayFollowers &&
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


class ReactButton extends Component {
    getPositioningClassName() {
        return "h-12 w-16 pt-1.5 px-4";
    }

    getReactionCountClassName() {
        return "absolute top-10 left-1/2 transform -translate-x-1/2 p-1 text-lg font-bold";
    }

    render() {
        const reaction = this.props.reaction;
        const selectionExists = (this.props.selected !== null);
        const selected = (reaction === this.props.selected);

        let reactionCount = this.props.reactionCount;
        if (typeof(reactionCount) === "number" && selected) {
            reactionCount += 1;
        }
        return (
            <div id={reaction}
                 title={this.props.title}
                 className={
                     " relative group rounded text-center " +
                     " fill-current transition duration-100 " +
                     " " + this.getPositioningClassName() + " " +
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

                {/* This extra div avoids the scale transforms from overriding one another for shares. */}
                <div className={(this.props.enabled ? "transform group-hover:scale-110 " : "")}>
                    {React.cloneElement(this.props.children, {
                        className: "fill-current " +
                            (this.props.childClassName || ""),
                        fontSize: "inherit"
                    })}
                </div>

                {reactionCount !== undefined &&
                    <p className={this.getReactionCountClassName()} >
                        {Math.round(reactionCount)}
                    </p>}
            </div>
        );
    }
}

class CommentReactButton extends ReactButton {
    getPositioningClassName() {
        return "h-9 w-11 pt-1.5 pb-0.5 px-3";
    }

    getReactionCountClassName() {
        return "absolute top-8 left-1/2 transform -translate-x-1/2 p-0.5 text-base font-bold";
    }
}

class Comment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteConfirmation: false
        };
    }

    showDeleteConfirmation() {
        this.setState({
            ...this.state,
            showDeleteConfirmation: true
        });
    }

    hideDeleteConfirmation() {
        this.setState({
            ...this.state,
            showDeleteConfirmation: false
        });
    }

    doDelete() {
        this.props.onCommentDelete();
    }

    render() {
        const comment = this.props.comment;
        const study = this.props.study;

        const onReact = this.props.onReact;
        const enabled = this.props.enabled;
        const selected = this.props.selectedReaction;

        const reactions = ["dislike", "like"];
        const commentReactions = [];

        const icons = {
            "like": <ThumbUpIcon/>,
            "dislike": <ThumbDownIcon/>,
        };
        for (let index = 0; index < reactions.length; ++index) {
            const reaction = reactions[index];
            if (!study.commentEnabledReactions[reaction])
                continue;

            let reactionCount;
            if (study.displayNumberOfReactions) {
                reactionCount = comment.numberOfReactions[reaction].sample();
            } else {
                reactionCount = undefined;
            }

            commentReactions.push(
                <CommentReactButton
                        reaction={reaction}
                        key={reaction}
                        selected={selected}
                        onReact={onReact}
                        enabled={enabled}
                        reactionCount={reactionCount}
                        childClassName="transform -translate-y-3 -translate-x-1"
                        title={reaction}
                        fontSize="1.7rem">

                    {icons[reaction]}
                </CommentReactButton>
            )
        }

        return (
            <>
                <ConfirmationDialog title="Delete Your Comment"
                                    actionName={<><DeleteForeverIcon className="mr-2 mb-0.5" />
                                        Delete Comment
                                    </>}
                                    visible={this.state.showDeleteConfirmation}
                                    onConfirm={() => this.doDelete()}
                                    onCancel={() => this.hideDeleteConfirmation()}>

                    Are you sure you wish to delete your comment?
                </ConfirmationDialog>

                <div className={"flex flex-col p-1 pr-2 mb-1 bg-white shadow" +
                            (this.props.className || "")}>
                    <div className="flex mb-3">
                        <div className="flex-grow pl-2">
                            <div className="w-full">
                                <div className={
                                        "inline-block underline text-gray-700 mr-2 " +
                                        (this.props.editable ? "text-lg pt-1" : "")}>

                                    {comment.sourceName}
                                </div>
                                {this.props.editable &&
                                    <div className="inline-block text-gray-600 cursor-pointer mb-1 transform -translate-y-0.5">
                                        <span title="Edit Comment">
                                            <EditIcon className="hover:text-gray-800"
                                                      onClick={() => this.props.onCommentEdit()} />
                                        </span>
                                        <span title="Delete Comment">
                                            <DeleteForeverIcon className="hover:text-gray-800"
                                                               onClick={() => this.showDeleteConfirmation()} />
                                        </span>
                                    </div>}
                            </div>
                            <p className="w-full text-lg ml-1" style={{whiteSpace: "pre-wrap"}}>{comment.message}</p>
                        </div>
                        <div className="flex flex-row-reverse flex-grow-0 p-1 pr-0 w-1/5">
                            {commentReactions}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}


/**
 * TODO : This should really share the code from CommentSubmissionRow,
 *        but I don't have the time to do that right now...
 */
export class ExampleCommentEntryBox extends Component {
    render() {
        return (
            <div className="flex flex-col py-2 px-3 max-w-sm mb-1 bg-white shadow rounded-lg border border-gray-300 mt-2">
                <div className="flex flex-col mb-1.5">
                    <div className="flex flex-row justify-between w-full text-gray-800 mb-1">
                        <span>Add Comment: </span>
                    </div>
                    <textarea
                        className="w-full px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100"
                        style={{minHeight: "2.8em", height: "6em", maxHeight: "2.8em"}}
                        placeholder="Write your comment here"
                        rows="1"
                        value="Write your comment here"
                        disabled>
                    </textarea>

                    <div className="transition-height duration-300 ease-out overflow-hidden h-10">
                        <div className={
                            "h-8 inline-block px-3 py-1.5 mt-2 mr-1 rounded-md text-white text-sm select-none " +
                            " cursor-pointer bg-gray-500 "}
                             title="Click to submit your message as a comment">

                            Submit Comment
                        </div>

                        <div className={
                            "h-8 inline-block px-3 py-1.5 mt-2 rounded-md text-white text-sm select-none " +
                            " cursor-pointer bg-gray-400 "}
                             title="Click to submit your message as a comment"
                             onClick={() => this.handleCancelClick()}>

                            Cancel
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}


class CommentSubmissionRow extends MountAwareComponent {
    constructor(props) {
        super(props);

        const isEditing = (props.initialValue && props.initialValue.trim().length > 0);
        this.state = {
            enabled: isEditing,
            isEditingComment: isEditing,
            value: (props.initialValue || ""),
            lastHasEdited: false,
            showDiscardConfirmation: false,
            displayError: false,
        };
    };

    isValidValue(value) {
        const requiredLength = this.props.study.minimumCommentLength;
        return value && value.trim().length >= requiredLength;
    }

    getInitialValue() {
        return !this.props.initialValue ? "" : this.props.initialValue.trim();
    }

    hasBeenEdited(value) {
        const initialValue = this.getInitialValue();
        return value.trim() !== initialValue.trim();
    }

    handleSubmitClick() {
        this.doSubmit(this.state.value, false);
    }

    handleCancelClick() {
        if (!this.hasBeenEdited(this.state.value)) {
            this.doCancel();
            return;
        }

        this.setState({
            ...this.state,
            showDiscardConfirmation: true
        });
    }

    hideDiscardConfirmation() {
        this.setState({
            ...this.state,
            showDiscardConfirmation: false
        });
    }

    doSubmit(value, reset) {
        if (value.trim().length <= 0 && this.state.isEditingComment) {
            this.props.submit(null);
            this.setState({
                ...this.state,
                value: "",
                enabled: false,
                isEditingComment: false,
                displayError: false,
                showDiscardConfirmation: false
            });
            return;
        }

        if (this.isValidValue(value)) {
            this.props.submit(value);
        } else {
            this.props.submit(null);
            // If the ID is invalid, display the error.
            this.setState({
                ...this.state,
                value: value,
                enabled: value.trim().length > 0,
                displayError: !reset,
                showDiscardConfirmation: false
            });
        }
    }

    doCancel() {
        this.doSubmit(this.getInitialValue(), true);
    }

    updateValue(value) {
        const edited = this.hasBeenEdited(value);
        if (edited !== this.lastHasEdited) {
            this.props.onCommentEditedStatusUpdate(edited);
        }

        this.setState({
            ...this.state,
            value: value,
            enabled: value.trim().length > 0,
            lastHasEdited: edited
        });
    }

    render() {
        const study = this.props.study;
        const requiredLength = study.minimumCommentLength;

        const value = this.state.value;
        const isError = (!value || value.length < requiredLength);
        const showError = (this.state.displayError && isError);
        const error = (!value || value.length === 0 ?
            "Please write your comment in the entry box above" :
            "Your comment must be at least " + requiredLength + " characters");

        const submitVisible = this.state.isEditingComment || (this.props.enabled && this.state.enabled);
        const submitEnabled = !isError && submitVisible;

        return (
            <>
            <ConfirmationDialog title={this.state.isEditingComment ?
                "Discard Comment Changes" : "Discard Comment"}
                                actionName={<><DeleteForeverIcon className="mr-2 mb-0.5" />{
                                    this.state.isEditingComment ?
                                        "Discard Changes" : "Discard Comment"
                                }</>}
                                visible={this.state.showDiscardConfirmation}
                                onConfirm={() => this.doCancel()}
                                onCancel={() => this.hideDiscardConfirmation()}>

                Are you sure you wish to discard {
                    this.state.isEditingComment ? "the changes to your comment" : "your comment"
                }?
            </ConfirmationDialog>

            <div className={"flex flex-col py-1 px-2 mb-1 bg-white shadow " +
                (this.props.className || "")}>
                <div className="flex flex-col mb-1.5">
                    <div className="flex flex-row justify-between w-full text-gray-700 mb-1">
                        <span>
                            {this.state.isEditingComment ? "Edit Comment:" : "Add Comment:"}
                        </span>
                    </div>
                    <textarea
                        className={
                            "transition-max-height duration-300 ease-out w-full px-3 py-2 " +
                            "border border-gray-400 rounded-md justify-self-center bg-gray-100 "}
                        style={{minHeight: "2.8em", height: "6em", maxHeight: submitVisible ? "12em" : "2.8em"}}
                        placeholder="Write your comment here"
                        rows="1"
                        value={this.state.value}
                        onChange={e => this.updateValue(e.target.value)}>
                    </textarea>
                    {showError &&
                        <ErrorLabel value={error} className="mt-1" />}

                    <div className={"transition-height duration-300 ease-out overflow-hidden " +
                                    (submitVisible ? " h-10 " : " h-0 ")}>
                        <div className={
                                    "h-8 inline-block px-3 py-1.5 mt-2 mr-1 rounded-md text-white text-sm select-none " +
                                    (submitEnabled ? " cursor-pointer bg-blue-500 active:bg-blue-600 hover:bg-blue-600 "
                                        : " bg-gray-400 ")}
                             title={isError ? error : "Click to submit your message as a comment"}
                             onClick={() => this.handleSubmitClick()}>

                            {this.state.isEditingComment ?
                                (this.state.value.trim().length <= 0 ?
                                    <>
                                        <DeleteForeverIcon className="-mt-1 pr-1 h-0" />
                                        Delete Comment
                                    </>
                                    : "Save Comment")
                                : "Submit Comment"}
                        </div>

                        <div className={
                                "h-8 inline-block px-3 py-1.5 mt-2 rounded-md text-white text-sm select-none " +
                                " cursor-pointer bg-gray-400 active:bg-gray-500 hover:bg-gray-500 "}
                             title={isError ? error : "Click to submit your message as a comment"}
                             onClick={() => this.handleCancelClick()}>

                            Cancel
                        </div>
                    </div>
                </div>
            </div>
        </>
        );
    }
}


class PostReactionsRow extends Component {
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

            let transforms, fontSize;
            if (reaction === "share") {
                transforms = "transform -translate-y-2.5 -translate-x-3 -scale-x-1";
                fontSize = "3.25rem";
            } else {
                transforms = "transform -translate-y-0.5 -translate-x-1";
            }

            let reactionCount;
            if (study.displayNumberOfReactions) {
                reactionCount = post.numberOfReactions[reaction];
            } else {
                reactionCount = undefined;
            }

            buttons.push(
                <ReactButton reaction={reaction} key={reaction}
                             selected={selected} onReact={onReact}
                             enabled={enabled}
                             reactionCount={reactionCount}
                             childClassName={transforms}
                             title={titles[reaction]}
                             className="mr-1" fontSize={fontSize}>

                    {icons[reaction]}
                </ReactButton>
            );
        }

        return (
            <div className={"text-lg flex flex-wrap flex-row pt-1 px-2 " +
                            (study.displayNumberOfReactions ? " pb-6 mb-0.5 " : " mb-1 ")}>
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
        const interactions = this.props.interactions;
        const post = state.currentPost.post;
        const commentComponents = [];

        const userCommentsEnabled = state.study.areUserCommentsEnabled();
        const showCommentBox = !interactions.comment && userCommentsEnabled;

        if (interactions.comment) {
            const userComment = new UserComment(interactions.comment);
            commentComponents.push(
                <Comment comment={userComment}
                         study={state.study}
                         key="user.comment"
                         enabled={false}
                         editable={true}
                         onCommentEdit={() =>  this.props.onCommentEdit()}
                         onCommentDelete={() => this.props.onCommentDelete()}/>);
        }
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            commentComponents.push(
                <Comment comment={comment}
                         study={state.study}
                         key={index + "." + comment.sourceName}
                         onReact={r => this.props.onCommentReact(index, r)}
                         enabled={this.props.enableReactions}
                         editable={false}
                         selectedReaction={interactions.findCommentReactionString(index)} />
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
                        <SourceElement source={state.currentSource} />
                    </div>

                    {/* The content of the post. */}
                    <div className="flex flex-col flex-grow text-left text-2xl bg-white
                                    font-bold">

                        <p className="p-2 mb-1">{post.headline}</p>
                        {postContent}
                    </div>

                    {/* The reactions to the post and their counts. */}
                    <hr />
                    <PostReactionsRow
                        onReact={this.props.onPostReact}
                        enabled={this.props.enableReactions}
                        selectedReaction={interactions.postReaction}
                        study={state.study}
                        post={state.currentPost} />
                </div>

                {/* The comments on the post. */}
                <div className="flex flex-row justify-between items-end">
                    {(showCommentBox || commentComponents.length > 0) &&
                        <p className="font-bold text-gray-600 p-1">Comments:</p>}
                </div>
                {userCommentsEnabled && !interactions.comment && showCommentBox &&
                    <CommentSubmissionRow study={state.study}
                                          initialValue={this.props.lastComment}
                                          submit={value => this.props.onCommentSubmit(value)}
                                          onCommentEditedStatusUpdate={edited => this.props.onCommentEditedStatusUpdate(edited)}
                                          enabled={this.props.enableReactions} />}
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

export class GameScreen extends ActiveGameScreen {
    constructor(props) {
        super(props);
        this.defaultState = {
            ...this.defaultState,
            currentState: null,

            error: null,
            reactionsAllowed: false,

            interactions: GamePostInteraction.empty(),
            lastComment: null,
            commentHasBeenEdited: false,

            dismissedPrompt: false,

            overrideFollowers: null,
            overrideCredibility: null,
            followerChange: null,
            credibilityChange: null,
            inputEnabled: true,
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

    onPostReaction(reaction) {
        this.setState({
            ...this.state,
            interactions: this.state.interactions.withToggledPostReaction(reaction)
        });
    }

    onCommentReaction(commentIndex, reaction) {
        this.setState({
            ...this.state,
            interactions: this.state.interactions.withToggledCommentReaction(commentIndex, reaction)
        });
    }

    onCommentSubmit(comment) {
        this.setState({
            ...this.state,
            lastComment: null,
            interactions: this.state.interactions.withComment(comment),
            commentHasBeenEdited: false
        });
    }

    onCommentEdit() {
        this.setState({
            ...this.state,
            lastComment: this.state.interactions.comment,
            interactions: this.state.interactions.withComment(null),
            commentHasBeenEdited: false
        });
    }

    onCommentDelete() {
        this.setState({
            ...this.state,
            lastComment: null,
            interactions: this.state.interactions.withComment(null),
            commentHasBeenEdited: false
        });
    }

    onCommentEditedStatusUpdate(hasBeenEdited) {
        this.setState({
            ...this.state,
            commentHasBeenEdited: hasBeenEdited
        });
    }

    onNextPost(game) {
        const beforeFollowers = Math.round(game.participant.followers);
        const beforeCredibility = Math.round(game.participant.credibility);
        game.advanceState(this.state.interactions);

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

            interactions: GamePostInteraction.empty(),
            lastComment: null,

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

        const madePostReaction = (this.state.interactions.postReaction !== null);
        const madeUserComment = (this.state.interactions.comment !== null);

        const currentPostNumber = participant.postInteractions.length;
        const totalPosts = game.study.length;
        const progressPercentage = Math.round(currentPostNumber / totalPosts * 100);

        let nextPostEnabled = false;
        let nextPostError = "";
        if (this.state.commentHasBeenEdited) {
            if (study.requireReactions && !madePostReaction) {
                nextPostError = "Please react to the post";
            } else {
                nextPostError = "Please complete your comment";
            }
        } else if (study.requireReactions && study.areUserCommentsRequired()) {
            if (!madePostReaction) {
                nextPostError = "Please react to the post";
            } else if (!madeUserComment) {
                nextPostError = "Comment on the post to continue";
            } else {
                nextPostEnabled = true;
            }
        } else if (study.requireReactions) {
            nextPostEnabled = madePostReaction;
            nextPostError = "React to the post to continue";
        } else if (study.areUserCommentsRequired()) {
            nextPostEnabled = madeUserComment;
            nextPostError = "Comment on the post to continue";
        } else {
            nextPostEnabled = true;
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
                            displayFollowers={study.displayFollowers}
                            displayCredibility={study.displayCredibility}
                            displayProgress = {study.displayProgress}
                            fancyPositioning={true}
                            participant={participant}
                            overrideFollowers={this.state.overrideFollowers}
                            overrideCredibility={this.state.overrideCredibility}
                            nextPostEnabled={nextPostEnabled && this.state.reactionsAllowed && this.state.inputEnabled}
                            progressPercentage = {progressPercentage}
                            onNextPost={() => {
                                const reaction = this.state.interactions.postReaction;
                                if (!study.requireReactions || reaction !== null) {
                                    this.onNextPost(game);
                                }
                            }}
                            nextPostText={
                                finished ?
                                    "The simulation is complete!" :
                                nextPostEnabled ?
                                    (this.state.reactionsAllowed ? "Continue to next post" : "Please wait to continue")
                                    : nextPostError
                            }
                            followerChange={this.state.followerChange}
                            credibilityChange={this.state.credibilityChange}/>}

                    {/* Space in the middle. */}
                    <div className="flex-1 max-w-mini" />

                    {/* The post and its associated comments. */}
                    <div className="bg-gray-200 w-full md:max-w-xl
                                    md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                         style={{minHeight: "100vh"}}>

                        {/* Post, reactions, and comments. */}
                        {state && !error &&
                            <PostComponent
                                state={state}
                                onPostReact={r => this.onPostReaction(r)}
                                onCommentReact={(i, r) => this.onCommentReaction(i, r)}
                                onCommentSubmit={value => this.onCommentSubmit(value)}
                                onCommentEditedStatusUpdate={edited => this.onCommentEditedStatusUpdate(edited)}
                                onCommentEdit={() => this.onCommentEdit()}
                                onCommentDelete={() => this.onCommentDelete()}
                                enableReactions={this.state.reactionsAllowed && this.state.inputEnabled}
                                interactions={this.state.interactions}
                                lastComment={this.state.lastComment}/>}

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