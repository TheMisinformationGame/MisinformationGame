import {Component} from "react";
import DoneIcon from '@material-ui/icons/Done';

export default class ErrorLabel extends Component {
    render() {
        return (
            <div className={"flex flex-wrap text-green-600 text-lg " + (this.props.className || "")}>
                <span className="mr-1 text-green-500"><DoneIcon /></span>
                <span className="pt-0.5">{this.props.value ? this.props.value : "Success"}</span>
            </div>
        );
    }
}
