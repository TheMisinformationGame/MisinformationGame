import {Component} from "react";
import {ConditionalLink} from "./ConditionalLink";


export class ContinueButton extends Component {
    render() {
        return (
            <ConditionalLink to={this.props.to} condition={this.props.condition} onClick={this.props.onClick}
                             className={
                                 "px-3 py-2 rounded-md text-white cursor-pointer " +
                                 "select-none bg-blue-500 hover:bg-blue-600 " +
                                 (this.props.className || "") + " " +
                                 (this.props.active ? "bg-blue-600" : "active:bg-blue-600")
                             }>

                Continue
            </ConditionalLink>
        );
    }
}

export class ContinueBanner extends Component {
    render() {
        return (
            <>
                {/* Used for reserving space below the banner. */}
                <div className="h-16" />

                {/* The banner itself. */}
                <div className="bg-gray-100 py-1 border-t border-gray-400 shadow-up
                                fixed bottom-0 left-0 w-full h-16
                                flex justify-center items-center">
                    <ContinueButton
                        to={this.props.to}
                        condition={this.props.condition}
                        onClick={this.props.onClick}
                        className="text-xl px-4 py-2" />
                </div>
            </>
        );
    }
}
