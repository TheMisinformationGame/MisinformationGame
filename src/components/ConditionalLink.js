import {Link} from "react-router-dom";
import {Component} from "react";

export class ConditionalLink extends Component {
    render() {
        const className = (this.props.className || "") + " force-white-text";
        
        if (this.props.condition && this.props.to) {
            return (
                <Link to={this.props.to}
                      onClick={this.props.onSubmit}
                      className={className}
                      title={this.props.tooltip}>

                    {this.props.children}
                </Link>
            );
        } else {
            return <div className={className} onClick={this.props.onClick} title={this.props.tooltip}>
                {this.props.children}
            </div>
        }
    }
}
