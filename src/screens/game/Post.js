import React, {Component} from "react";
import {PromiseImage} from "../../components/PromiseImage";
import {getDataManager} from "../../model/manager";
import {CredibilityLabel} from "../../components/CredibilityLabel";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReplyIcon from "@mui/icons-material/Reply";
import FlagIcon from "@mui/icons-material/Flag";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import {UserComment} from "../../model/study";
import {isOfType} from "../../utils/types";
import {CommentSubmissionRow} from "./CommentEntry";
import {Comment} from "./Comment";
import {ReactButton} from "./ReactButton";
import {capitalise} from "../../utils/text";
import {VideoEmbed} from "../../components/VideoEmbed";
import {LinkPopupModal} from "../../components/LinkPopupModal";


export const POST_SUBMITTED_TOOLTIP = "User may no longer interact with this post, as it has been saved";
export const REACTION_DISABLED_TOOLTIP = "Please wait before reacting to this post";


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
                    <div className={
                            "flex flex-row items-center " + text_xl +
                            (small || source.study.uiSettings.displayFollowers ? "" : " pt-2")}>

                        <span className="inline-block mr-1" style={{lineHeight: "1.5em"}}>
                            {source.source.name}
                        </span>

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
                transforms = "transform -translate-y-2 -scale-x-1";
                fontSize = "2.75rem";
            } else {
                transforms = "transform -translate-y-0.5";
                fontSize = "2rem";
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
                             title={
                                    enabled ?
                                        capitalise(reaction) :
                                        (study.uiSettings.displayPostsInFeed ?
                                            POST_SUBMITTED_TOOLTIP :
                                            REACTION_DISABLED_TOOLTIP)}
                             className="mr-1"
                             fontSize={fontSize}>

                    {icons[reaction]}
                </ReactButton>
            );
        }

        return (
            <div className={"text-lg flex flex-wrap flex-row pt-2 px-4 pb-2 " +
                (study.uiSettings.displayNumberOfReactions ? " mb-0.5 " : " mb-1 ")}>
                <div className={"flex flex-grow" + (study.uiSettings.displayNumberOfReactions ? " pb-6 " : "")}>
                    {buttons}
                </div>

                {study.isPostReactionEnabled("skip") &&
                    <ReactButton
                        reaction="skip"
                        selected={interactions.hasPostReaction("skip")}
                        grayOut={interactions.postReactions.length > 0}
                        onReact={onReact}
                        enabled={enabled}
                        wide={true}
                        fontSize="1.25rem"
                        childClassName="transform translate-y-1">

                        <p className="whitespace-nowrap leading-tight">Skip Post</p>
                    </ReactButton>}
            </div>
        );
    }
}


/**
 * A post to display, including comments.
 */
export class PostComponent extends Component {
    constructor(props) {
        super(props);
        this.postContentRef = React.createRef();
        
        // Initialize comments visibility based on study settings
        // Only use state management if hiding is enabled
        const hideByDefault = props.state.study.uiSettings.hideCommentsByDefault;
        this.state = {
            commentsVisible: !hideByDefault,
            hasToggledFromDefault: false,
            showPopup: false,
            popupUrl: null,
            currentClickData: null,
            popupBlocking: false // Track if popup is blocking interaction
        };
    }

    componentDidMount() {
        this.attachClickHandlers();
    }

    componentDidUpdate() {
        this.attachClickHandlers();
    }

    attachClickHandlers() {
        if (!this.postContentRef.current)
            return;

        // Remove existing listener to avoid duplicates
        this.postContentRef.current.removeEventListener('click', this.handleContentClick, true);
        // Add the click listener to the entire content area (capture phase to intercept before onclick)
        this.postContentRef.current.addEventListener('click', this.handleContentClick, true);
    }

    handleContentClick = (event) => {
        // Traverse up to find the actual clickable element
        let target = event.target;
        let url = null;
        let clickData = null;
        
        // Walk up the DOM tree to find a link or onclick handler
        while (target && target !== this.postContentRef.current) {
            clickData = {
                tagName: target.tagName.toLowerCase(),
                timestamp: Date.now()
            };
            
            // If it's a link, get the URL
            if (target.tagName.toLowerCase() === 'a') {
                clickData.url = target.href;
                clickData.text = target.textContent || target.innerText;
                url = target.href;
                break;
            }
            // If it has an onclick handler
            else if (target.onclick || target.getAttribute('onclick')) {
                clickData.hasOnClick = true;
                clickData.text = target.textContent || target.innerText;
                
                // Try to extract URL from onclick attribute
                const onclickAttr = target.getAttribute('onclick');
                if (onclickAttr) {
                    const urlMatch = onclickAttr.match(/window\.open\(['"]([^'"]+)['"]/);
                    if (urlMatch) {
                        url = urlMatch[1];
                        clickData.url = url;
                    }
                }
                break;
            }
            
            target = target.parentElement;
        }
        
        // If we didn't find a clickable element, use original target
        if (!clickData) {
            clickData = {
                tagName: event.target.tagName.toLowerCase(),
                timestamp: Date.now(),
                text: event.target.textContent || event.target.innerText
            };
        }

        // Record the link click first
        if (this.props.onLinkClick) {
            this.props.onLinkClick(clickData);
        }

        // Check if we should open links in modal
        const openInModal = this.props.state.study.advancedSettings.openLinksInModal;
        
        if (openInModal && url) {
            // Prevent default action (opening link in new tab)
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (this.props.onPopupOpen) {
                this.props.onPopupOpen();
            }
            
            // Show the popup modal and block interactions
            this.setState({
                showPopup: true,
                popupUrl: url,
                currentClickData: clickData,
                popupBlocking: true
            });
            
            // Don't let the event bubble further
            return false;
        }
    }

    handleCommentVisibilityToggle = () => {
        // Only allow toggling if hiding is enabled
        if (!this.props.state.study.uiSettings.hideCommentsByDefault) {
            return;
        }

        const newVisibility = !this.state.commentsVisible;
        const fromDefault = !this.state.hasToggledFromDefault;
        
        this.setState({
            commentsVisible: newVisibility,
            hasToggledFromDefault: true
        });

        // Track the visibility toggle
        if (this.props.onCommentVisibilityToggle) {
            this.props.onCommentVisibilityToggle(
                newVisibility ? "show" : "hide",
                fromDefault
            );
        }
    }

    handlePopupClose = (popupData) => {
        this.setState({
            showPopup: false,
            popupUrl: null,
            currentClickData: null,
            popupBlocking: false
        });

        // Report popup timing data
        if (this.props.onPopupClose) {
            this.props.onPopupClose(popupData);
        }
    }

    render() {
        const state = this.props.state;
        const interactions = this.props.interactions;
        const enabled = this.props.enabled && !interactions.isCompleted() && !this.state.popupBlocking;

        const post = state.currentPost.post;
        const commentComponents = [];

        const userCommentsEnabled = state.study.areUserCommentsEnabled();
        const showCommentBox = !interactions.comment && userCommentsEnabled;

        if (interactions.comment) {
            const displayName = this.props.displayName || "You";
            const userComment = new UserComment(interactions.comment, displayName);
            commentComponents.push(
                <Comment
                    className="mt-0"
                    comment={userComment}
                    study={state.study}
                    key="user.comment"
                    enabled={enabled}
                    editable={true}
                    onCommentEdit={() =>  this.props.onCommentEdit()}
                    onCommentDelete={() => this.props.onCommentDelete()}
                    onPopupOpen={this.props.onCommentPopupOpen ? () => this.props.onCommentPopupOpen(-1) : undefined}
                    onPopupClose={this.props.onCommentPopupClose ? (popupData) => this.props.onCommentPopupClose(-1, popupData) : undefined} />);
        }
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            commentComponents.push(
                <Comment
                    comment={comment}
                    study={state.study}
                    className={showCommentBox || interactions.comment || index > 0 ? "mt-1" : "mt-0"}
                    key={index + "." + comment.sourceName}
                    onReact={r => this.props.onCommentReact(index, r)}
                    onLinkClick={url => this.props.onCommentLinkClick(index, url)}
                    onPopupOpen={this.props.onCommentPopupOpen ? () => this.props.onCommentPopupOpen(index) : undefined}
                    onPopupClose={this.props.onCommentPopupClose ? (popupData) => this.props.onCommentPopupClose(index, popupData) : undefined}
                    enabled={enabled}
                    editable={false}
                    interaction={interactions.findCommentReaction(index)} />
            );
        }

        let postContent;
        if (isOfType(post.content, "string")) {
            postContent = (
                <VideoEmbed 
                    content={post.content}
                    contentRef={this.postContentRef}
                    onVideoEvent={(eventData) => this.props.onLinkClick(eventData)} />
            );
        } else {
            postContent = (<div className="flex justify-center bg-gray-100 max-h-40vh md:max-h-60vh overflow-hidden mx-4 mb-3 rounded-lg">
                <PromiseImage image={
                    getDataManager().getStudyImage(state.study, post.id, post.content)
                } imageClassName="object-cover shadow w-full h-full" />
            </div>);
        }

        return (
            <div
                id={this.props.id}
                className={
                    "flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 " +
                    (enabled ? " text-black " : " text-gray-700 ") +
                    (this.props.className || "")
                }>

                <div className={enabled ? "bg-white" : "bg-gray-50"}>
                    {/* The source of the post. */}
                    <div className="flex p-4 pb-2">
                        <SourceElement source={state.currentSource} />
                    </div>

                    {/* The content of the post. */}
                    <div className="flex flex-col flex-grow text-left text-lg">

                        <p className="px-4 py-3">{post.headline}</p>
                        {postContent}
                    </div>

                    {/* The reactions to the post and their counts. */}
                    <div className="border-t border-gray-200" />
                    <PostReactionsRow
                        onReact={this.props.onPostReact}
                        enabled={enabled}
                        interactions={interactions}
                        study={state.study}
                        post={state.currentPost} />
                </div>

                {/* The comments section - conditional rendering based on hideCommentsByDefault */}
                {state.study.uiSettings.hideCommentsByDefault ? (
                    <>
                        {/* Collapsible comments UI */}
                        {(showCommentBox || commentComponents.length > 0) && (
                            <div className="flex flex-row justify-between items-center bg-gray-50 border-t border-b border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                                 onClick={this.handleCommentVisibilityToggle}>
                                <div className="flex items-center py-3 px-4">
                                    <ChatBubbleOutlineIcon className="text-blue-600 mr-2" style={{ fontSize: '1.35rem' }} />
                                    <span className="text-gray-700 text-base font-semibold">
                                        ({commentComponents.length}) {this.state.commentsVisible ? 'Hide Comments' : 'Show Comments'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Comment input box - always visible when enabled */}
                        {showCommentBox && (
                            <CommentSubmissionRow
                                className="mt-0"
                                study={state.study}
                                initialValue={interactions.lastComment}
                                submit={value => this.props.onCommentSubmit(value)}
                                enabled={enabled} />
                        )}

                        {/* Existing comments or empty state message */}
                        {this.state.commentsVisible && (
                            <div className={showCommentBox ? "" : "mt-1"}>
                                {commentComponents.length > 0 ? (
                                    commentComponents
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 px-4 text-gray-400">
                                        <div className="text-6xl mb-3">📄</div>
                                        <p className="text-lg font-semibold text-gray-600">No comments yet</p>
                                        <p className="text-sm text-gray-500">Be the first to comment.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Original simple comments UI (no collapsing) */}
                        <div className="flex flex-row justify-between items-end bg-white border-t border-gray-200">
                            {(showCommentBox || commentComponents.length > 0) &&
                                <p className="font-semibold text-gray-600 text-base p-3 px-4">Comments</p>}
                        </div>

                        {showCommentBox &&
                            <CommentSubmissionRow
                                className="mt-0"
                                study={state.study}
                                initialValue={interactions.lastComment}
                                submit={value => this.props.onCommentSubmit(value)}
                                enabled={enabled} />}

                        {commentComponents}
                    </>
                )}

                {/* Link Popup Modal */}
                {this.state.showPopup && (
                    <LinkPopupModal
                        url={this.state.popupUrl}
                        onClose={this.handlePopupClose}
                    />
                )}
            </div>
        );
    }
}
