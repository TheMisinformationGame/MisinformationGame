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
                <div className="flex justify-around">
                    <div className={"w-52 pt-3 pb-3 bg-yellow-400 hover:bg-yellow-500 " +
                                    "text-center select-none border-black border border-opacity-50 " +
                                    "border-solid font-semibold rounded-md cursor-pointer "}
                         onClick={this.props.onConfirm}>

                        {this.props.actionName}
                    </div>
                    <div className={"w-52 pt-3 pb-3 bg-gray-300 hover:bg-gray-400 " +
                    "text-center select-none border-black border border-opacity-50 " +
                    "border-solid font-semibold rounded-md cursor-pointer "}
                         onClick={this.props.onCancel}>

                        <CloseIcon className="mr-1 mb-1" />
                        Cancel
                    </div>
                </div>
            </Dialog>
        );
    }
}