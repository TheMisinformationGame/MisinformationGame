import {Component} from "react";
import {ConditionalLink} from "./ConditionalLink";
import {MountAwareComponent} from "./MountAwareComponent";


export class ContinueButton extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.state = {disabled: true};
    }

    componentDidMount() {
        super.componentDidMount();
        const delaySeconds = this.props.delay;
        if (!delaySeconds || delaySeconds <= 0) {
            this.setState({...this.state, disabled: false});
            return;
        }

        this.setState({...this.state, disabled: true});
        setTimeout(() => {
            this.setStateIfMounted({...this.state, disabled: false});
        }, delaySeconds * 1000);
    }

    render() {
        const disabled = this.state.disabled;
        return (
            <ConditionalLink to={this.props.to}
                             condition={!disabled && this.props.condition}
                             onClick={this.props.onClick}
                             tooltip={disabled ? "The continue button will be enabled shortly" : ""}
                             className={
                                 "px-3 py-2 rounded-md text-white " +
                                 (disabled ? "" : "cursor-pointer ") +
                                 "select-none " +
                                 (this.props.className || "") + " " +
                                 (disabled ? "bg-gray-400 " :
                                     (this.props.active ? "bg-blue-600 " : "bg-blue-500 active:bg-blue-600 ") +
                                     "hover:bg-blue-600")
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
                        delay={this.props.delay}
                        className="text-xl px-4 py-2" />
                </div>
            </>
        );
    }
}
