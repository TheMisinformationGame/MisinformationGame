import {Link} from "react-router-dom";
import {Component} from "react";

export class ConditionalLink extends Component {
    render() {
        if (this.props.condition) {
            return (<Link to={this.props.to} className={this.props.className}>
                {this.props.children}
            </Link>);
        } else {
            return <div className={this.props.className} onClick={this.props.onClick}>
                {this.props.children}
            </div>
        }
    }
}
