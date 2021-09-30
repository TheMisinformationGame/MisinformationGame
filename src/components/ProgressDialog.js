import React, {Component} from "react";
import {Dialog} from "./Dialog";
import StatusLabel from "./StatusLabel";

export class ProgressDialog extends Component {
    render() {
        return (
            <Dialog title={this.props.title} visible={this.props.visible}
                    onHide={this.props.onHide} className={this.props.className}
                    size="small">

                <div className="mt-3">
                    <StatusLabel status={this.props.status} className="text-2xl" size="large" />
                </div>
            </Dialog>
        );
    }
}