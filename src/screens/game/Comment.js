import React, {Component} from "react";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import {ConfirmationDialog} from "../../components/ConfirmationDialog";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import {CommentReactButton} from "./ReactButton";


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
                    selected={interaction !== null && interaction.hasReaction(reaction)}
                    grayOut={
                        !study.uiSettings.allowMultipleReactions &&
                        interaction !== null && interaction.reactions.length > 0
                    }
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
                        <div className="flex flex-row-reverse flex-grow-0 p-1 pr-0">
                            {commentReactions}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
