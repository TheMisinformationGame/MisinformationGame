import React, {Component} from "react";
import {PromiseImage} from "../../components/PromiseImage";
import {getDataManager} from "../../model/manager";
import {CredibilityLabel} from "../../components/CredibilityLabel";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReplyIcon from "@mui/icons-material/Reply";
import FlagIcon from "@mui/icons-material/Flag";
import {UserComment} from "../../model/study";
import {isOfType} from "../../utils/types";
import {CommentSubmissionRow} from "./CommentEntry";
import {Comment} from "./Comment";
import {ReactButton} from "./ReactButton";


/**
 * The source that made a post.
 */
class SourceElement extends Component {
    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");

        const sourceStyle = (source.study.advancedSettings.genRandomDefaultAvatars ? source.source.style : {});
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
                    <div className={"flex " + (small || source.study.uiSettings.displayFollowers ? "" : "pt-1")}>
                        <p className={text_xl}>{source.source.name}</p>
                        {source.study.uiSettings.displayCredibility &&
                            <CredibilityLabel credibility={source.credibility} className={text_xl} />}
                    </div>

                    {!small && source.study.uiSettings.displayFollowers &&
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


/**
 * Contains the reactions that may be made to the post.
 */
class PostReactionsRow extends Component {
    render() {
        const onReact = this.props.onReact;
        const enabled = this.props.enabled;
        const interactions = this.props.interactions;
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
            if (!study.uiSettings.postEnabledReactions[reaction])
                continue;

            let transforms, fontSize;
            if (reaction === "share") {
                transforms = "transform -translate-y-2.5 -translate-x-3 -scale-x-1";
                fontSize = "3.25rem";
            } else {
                transforms = "transform -translate-y-0.5 -translate-x-1";
            }

            let reactionCount;
            if (study.uiSettings.displayNumberOfReactions) {
                reactionCount = post.numberOfReactions[reaction];
            } else {
                reactionCount = undefined;
            }

            buttons.push(
                <ReactButton reaction={reaction} key={reaction}
                             selected={interactions.hasPostReaction(reaction)}
                             grayOut={
                                 (!study.uiSettings.allowMultipleReactions || interactions.hasPostReaction("skip")) &&
                                 interactions.postReactions.length > 0
                             }
                             onReact={onReact}
                             enabled={enabled}
                             reactionCount={reactionCount}
                             childClassName={transforms}
                             title={titles[reaction]}
                             className="mr-1"
                             fontSize={fontSize}>

                    {icons[reaction]}
                </ReactButton>
            );
        }

        return (
            <div className={"text-lg flex flex-wrap flex-row pt-1 px-2 " +
                (study.uiSettings.displayNumberOfReactions ? " mb-0.5 " : " mb-1 ")}>
                <div className={"flex flex-grow" + (study.uiSettings.displayNumberOfReactions ? " pb-6 " : "")}>
                    {buttons}
                </div>

                <ReactButton reaction="skip"
                             selected={interactions.hasPostReaction("skip")}
                             grayOut={interactions.postReactions.length > 0}
                             onReact={onReact}
                             enabled={enabled}
                             className="w-32"
                             fontSize="1.25rem"
                             childClassName="transform translate-y-1">
                    <p>Skip Post</p>
                </ReactButton>
            </div>
        );
    }
}


/**
 * A post to display, including comments.
 */
export class PostComponent extends Component {
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
                         onCommentDelete={() => this.props.onCommentDelete()} />);
        }
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            commentComponents.push(
                <Comment comment={comment}
                         study={state.study}
                         className={showCommentBox || commentComponents.length > 0 ? "mt-1" : ""}
                         key={index + "." + comment.sourceName}
                         onReact={r => this.props.onCommentReact(index, r)}
                         enabled={this.props.enableReactions}
                         editable={false}
                         interaction={interactions.findCommentReaction(index)} />
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
            <div id={this.props.id} className="flex flex-col bg-gray-100 shadow-md">
                <div className="bg-white">
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
                        interactions={interactions}
                        study={state.study}
                        post={state.currentPost} />
                </div>

                {/* The comments on the post. */}
                <div className="flex flex-row justify-between items-end">
                    {(showCommentBox || commentComponents.length > 0) &&
                        <p className="font-bold text-gray-500 p-1">Comments:</p>}
                </div>

                {showCommentBox &&
                    <CommentSubmissionRow
                        study={state.study}
                        initialValue={interactions.lastComment}
                        submit={value => this.props.onCommentSubmit(value)}
                        onCommentEditedStatusUpdate={edited => this.props.onCommentEditedStatusUpdate(edited)}
                        enabled={this.props.enableReactions} />}

                {commentComponents}
            </div>
        );
    }
}
