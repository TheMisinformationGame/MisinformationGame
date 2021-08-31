import {Component} from "react";
import WarningIcon from '@material-ui/icons/Warning';

export default class ErrorLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-yellow-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1 text-yellow-400"><WarningIcon /></span>
                <span className="pt-0.5">{this.props.value ? this.props.value : "Warning"}</span>
            </div>
        );
    }
}
