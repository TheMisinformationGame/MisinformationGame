import React, {Component} from "react";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import {ConfirmationDialog} from "../../components/ConfirmationDialog";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import {CommentReactButton} from "./ReactButton";
import {POST_SUBMITTED_TOOLTIP} from "./Post";
import {capitalise} from "../../utils/text";


/**
 * A comment underneath a post.
 */
export class Comment extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showDeleteConfirmation: false
        };
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

    render() {
        const comment = this.props.comment;
        const study = this.props.study;

        const onReact = this.props.onReact;
        const editable = this.props.editable;
        const enabled = this.props.enabled;
        const reactionsEnabled = this.props.enabled && !editable;
        const interaction = this.props.interaction;

        const reactions = ["dislike", "like"];
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
                    childClassName="transform -translate-y-3 -translate-x-1"
                    title={enabled ? capitalise(reaction) : POST_SUBMITTED_TOOLTIP}
                    fontSize="1.7rem">

                    {icons[reaction]}
                </CommentReactButton>
            )
        }

        return (
            <>
                <ConfirmationDialog
                    title="Delete Your Comment"
                    actionName={<><DeleteForeverIcon className="mr-2 mb-0.5" />
                        Delete Comment
                    </>}
                    visible={enabled && this.state.showDeleteConfirmation}
                    onConfirm={() => this.doDelete()}
                    onCancel={() => this.hideDeleteConfirmation()}>

                    Are you sure you wish to delete your comment?
                </ConfirmationDialog>

                <div className={
                    "flex flex-col m-2 rounded-lg p-1 pr-2 " +
                    (enabled ? " bg-white " : " bg-gray-25 ") +
                    (this.props.className || "")
                }>
                    <div className="flex mb-3">
                        <div className="flex-grow pl-2">
                            <div className="w-full">
                                <div className={
                                    "inline-block underline text-gray-700 mr-2 " +
                                    (editable ? "pt-1" : "")}>

                                    {comment.sourceName}
                                </div>

                                {editable && enabled &&
                                    <div className={
                                        "inline-block mb-1 transform -translate-y-0.5 " +
                                        (enabled ? "text-gray-600 cursor-pointer" : "text-gray-500")
                                    }>
                                        <span title={enabled ? "Edit Comment" : POST_SUBMITTED_TOOLTIP}>
                                            <EditIcon
                                                className={enabled ? "hover:text-gray-800" : ""}
                                                onClick={() => {
                                                    if (enabled) {
                                                        this.props.onCommentEdit();
                                                    }
                                                }} />
                                        </span>
                                        <span title={enabled ? "Delete Comment" : POST_SUBMITTED_TOOLTIP}>
                                            <DeleteForeverIcon
                                                className={enabled ? "hover:text-gray-800" : ""}
                                                onClick={() => {
                                                    if (enabled) {
                                                        this.showDeleteConfirmation();
                                                    }
                                                }} />
                                        </span>
                                    </div>}
                            </div>

                            <p className="w-full text-lg ml-1" style={{whiteSpace: "pre-wrap"}}>{comment.message}</p>
                        </div>

                        <div className="flex flex-row-reverse flex-grow-0 p-1 pr-0">
                            {commentReactions}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
