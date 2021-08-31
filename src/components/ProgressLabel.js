import {Component} from "react";
import {CircularProgress} from "@material-ui/core";

export default class ErrorLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-blue-600 text-lg " + (this.props.className || "")}>
                <span className="mr-3"><CircularProgress size={24} /></span>
                <span>{this.props.value ? this.props.value : "Working..."}</span>
            </div>
        );
    }
}
