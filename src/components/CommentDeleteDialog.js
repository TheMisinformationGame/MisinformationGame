import React, {Component} from "react";

/**
 * Simple minimal dialog for deleting comments
 */
export class CommentDeleteDialog extends Component {
    render() {
        if (!this.props.visible) {
            return null;
        }

        return (
            <>
                {/* Backdrop overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center"
                     onClick={this.props.onCancel}>
                    
                    {/* Dialog box */}
                    <div className="relative flex flex-col m-8 px-8 py-6 shadow-2xl
                                    w-full max-w-md rounded-2xl bg-white"
                         onClick={(event) => event.stopPropagation()}>

                        <div className="text-lg text-gray-800 mb-6 text-center">
                            {this.props.children}
                        </div>
                        <div className="flex gap-6 justify-center">
                            <button className="py-2 px-6 text-blue-600 hover:text-blue-800
                                            text-center font-bold uppercase cursor-pointer
                                            transition-colors duration-200"
                                 onClick={this.props.onConfirm}>
                                Delete
                            </button>
                            <button className="py-2 px-6 text-gray-600 hover:text-gray-800
                                            text-center font-bold uppercase cursor-pointer
                                            transition-colors duration-200"
                                 onClick={this.props.onCancel}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}
