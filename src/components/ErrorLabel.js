import {Component} from "react";
import ErrorIcon from "@material-ui/icons/Error";

export default class ErrorLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-red-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1"><ErrorIcon /></span>
                <span className="pt-0.5">{this.props.value ? this.props.value : "Error"}</span>
            </div>
        );
    }
}
