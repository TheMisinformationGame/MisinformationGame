import {Dialog} from "./Dialog";
import React, {Component} from "react";
import CloseIcon from '@mui/icons-material/Close';

export class ConfirmationDialog extends Component {
    render() {
        return (
            <Dialog title={this.props.title} visible={this.props.visible}
                    onHide={this.props.onCancel} className={this.props.className}>

                <div className="my-4">
                    {this.props.children}
                </div>
                <div className="flex gap-3">
                    <button className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 active:bg-red-700
                                    text-white text-center font-semibold rounded-xl cursor-pointer
                                    shadow-md hover:shadow-lg transition-all duration-200
                                    flex items-center justify-center gap-2"
                         onClick={this.props.onConfirm}>
                        {this.props.actionName}
                    </button>
                    <button className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 active:bg-gray-400
                                    text-gray-800 text-center font-semibold rounded-xl cursor-pointer
                                    shadow-md hover:shadow-lg transition-all duration-200
                                    flex items-center justify-center gap-2"
                         onClick={this.props.onCancel}>
                        <CloseIcon className="" />
                        Cancel
                    </button>
                </div>
            </Dialog>
        );
    }
}