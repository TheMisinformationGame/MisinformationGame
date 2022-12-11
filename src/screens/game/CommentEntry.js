import React, {Component} from "react";
import {MountAwareComponent} from "../../components/MountAwareComponent";
import {ConfirmationDialog} from "../../components/ConfirmationDialog";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import {ErrorLabel} from "../../components/StatusLabel";


/**
 * An example comment submission user interface for the rules page.
 * This is not functional, but is instead just for illustrative purposes.
 *
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


/**
 * The user interface that allows participants to make comments.
 */
export class CommentSubmissionRow extends MountAwareComponent {
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
        const requiredLength = this.props.study.advancedSettings.minimumCommentLength;
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
        const requiredLength = study.advancedSettings.minimumCommentLength;

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