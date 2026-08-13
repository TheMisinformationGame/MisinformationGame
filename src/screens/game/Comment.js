import React, {Component} from "react";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import {CommentDeleteDialog} from "../../components/CommentDeleteDialog";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import {CommentReactButton} from "./ReactButton";
import {POST_SUBMITTED_TOOLTIP} from "./Post";
import {capitalise} from "../../utils/text";
import {LinkPopupModal} from "../../components/LinkPopupModal";


/**
 * A comment underneath a post.
 */
export class Comment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteConfirmation: false,
            showPopup: false,
            popupUrl: null,
            currentClickData: null,
            popupBlocking: false
        };
        this.commentContentRef = React.createRef();
    }

    componentDidMount() {
        this.attachClickHandlers();
    }

    componentDidUpdate() {
        this.attachClickHandlers();
    }

    attachClickHandlers() {
        if (!this.commentContentRef.current)
            return;

        // Remove existing listener to avoid duplicates
        this.commentContentRef.current.removeEventListener('click', this.handleContentClick, true);
        // Add the click listener to the entire content area (capture phase to intercept before onclick)
        this.commentContentRef.current.addEventListener('click', this.handleContentClick, true);
    }

    handleContentClick = (event) => {
        // Traverse up to find the actual clickable element
        let target = event.target;
        let url = null;
        let clickData = null;
        
        // Walk up the DOM tree to find a link or onclick handler
        while (target && target !== this.commentContentRef.current) {
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
        const openInModal = this.props.study.advancedSettings.openLinksInModal;
        
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

    showDeleteConfirmation() {
        this.setState(() => {
            return {showDeleteConfirmation: true};
        });
    }

    hideDeleteConfirmation() {
        this.setState(() => {
            return {showDeleteConfirmation: false};
        });
    }

    doDelete() {
        this.props.onCommentDelete();
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
        const comment = this.props.comment;
        const study = this.props.study;

        const onReact = this.props.onReact;
        const editable = this.props.editable;
        const enabled = this.props.enabled && !this.state.popupBlocking;
        const reactionsEnabled = enabled && !editable;
        const interaction = this.props.interaction;

        const reactions = ["like", "dislike"];
        const commentReactions = [];

        const icons = {
            "like": <ThumbUpIcon/>,
            "dislike": <ThumbDownIcon/>,
        };
        for (let index = 0; index < reactions.length; ++index) {
            const reaction = reactions[index];
            if (!study.uiSettings.commentEnabledReactions[reaction])
                continue;

            let reactionCount;
            if (study.uiSettings.displayNumberOfReactions) {
                reactionCount = comment.numberOfReactions[reaction].sample();
            } else {
                reactionCount = undefined;
            }

            commentReactions.push(
                <CommentReactButton
                    reaction={reaction}
                    key={reaction}
                    selected={interaction && interaction.hasReaction(reaction)}
                    grayOut={
                        !study.uiSettings.allowMultipleReactions &&
                        interaction && interaction.reactions.length > 0
                    }
                    onReact={onReact}
                    enabled={reactionsEnabled}
                    reactionCount={reactionCount}
                    childClassName="transform -translate-y-0.5"
                    title={enabled ? capitalise(reaction) : POST_SUBMITTED_TOOLTIP}
                    fontSize="1.7rem">

                    {icons[reaction]}
                </CommentReactButton>
            )
        }

        return (
            <>
                <CommentDeleteDialog
                    visible={enabled && this.state.showDeleteConfirmation}
                    onConfirm={() => this.doDelete()}
                    onCancel={() => this.hideDeleteConfirmation()}>

                    Are you sure you wish to delete this comment?
                </CommentDeleteDialog>

                <div className={
                    "flex items-start gap-2 mx-2 my-3 " +
                    (enabled ? " " : " opacity-75 ") +
                    (this.props.className || "")
                }>
                    {/* Avatar with first letter - outside the comment box */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold text-sm">
                        {comment.sourceName[0]}
                    </div>
                    
                    <div className="flex-grow rounded-lg p-3 pr-3 border border-gray-200 bg-gray-50 relative overflow-visible">
                        <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-gray-800">
                                {comment.sourceName}
                            </div>
                                
                                {editable && enabled &&
                                    <div className="flex gap-1">
                                        <button
                                            title={enabled ? "Edit Comment" : POST_SUBMITTED_TOOLTIP}
                                            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                            onClick={() => {
                                                if (enabled) {
                                                    this.props.onCommentEdit();
                                                }
                                            }}>
                                            <EditIcon fontSize="small" />
                                        </button>
                                        <button
                                            title={enabled ? "Delete Comment" : POST_SUBMITTED_TOOLTIP}
                                            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                                            onClick={() => {
                                                if (enabled) {
                                                    this.showDeleteConfirmation();
                                                }
                                            }}>
                                            <DeleteForeverIcon fontSize="small" />
                                        </button>
                                    </div>}
                            </div>
                            
                            <p
                                ref={this.commentContentRef}
                                className="text-base text-gray-700 leading-relaxed mt-1"
                                style={{ whiteSpace: "pre-wrap" }}
                                dangerouslySetInnerHTML={{__html: comment.message}} />
                            
                        {/* Reactions at the bottom */}
                        <div className="flex flex-row items-center gap-0.5 mt-1.5">
                            {commentReactions}
                        </div>
                    </div>
                </div>

                {/* Link Popup Modal */}
                {this.state.showPopup && (
                    <LinkPopupModal
                        url={this.state.popupUrl}
                        onClose={this.handlePopupClose}
                    />
                )}
            </>
        );
    }
}
