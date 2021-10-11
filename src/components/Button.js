import React, {Component} from "react";
import {Link} from "react-router-dom";

export class Button extends Component {
    onClick() {
        if (!this.props.enabled)
            return;

        this.props.onClick();
    }

    render() {
        return (
            <div onClick={() => this.onClick()}
                 title={this.props.tooltip}
                 className={
                     " px-3 py-2 rounded-md text-white select-none " +
                     (this.props.enabled ?
                         " cursor-pointer bg-blue-500 active:bg-blue-600 hover:bg-blue-600 "
                         : " bg-gray-400 ") +
                     (this.props.className || "")
                 }>

                {this.props.children}
            </div>
        );
    }
}

export class LinkButton extends Button {
    onClick() {
        // Do nothing.
    }

    render() {
        return (
            <Link to={this.props.to}>
                {super.render()}
            </Link>
        );
    }
}
