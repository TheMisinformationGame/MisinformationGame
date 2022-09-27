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
        const disabledByTime = this.state.disabled;
        const enabled = !disabledByTime && this.props.condition;
        return (
            <ConditionalLink to={this.props.to}
                             condition={enabled}
                             onClick={this.props.onClick}
                             tooltip={
                                 (!enabled ? (disabledByTime ?
                                    "The continue button will be enabled shortly"
                                    : this.props.disabledTooltip) : "")}
                             className={
                                 "px-3 py-2 rounded-md text-white " +
                                 (!enabled ? "" : "cursor-pointer ") +
                                 "select-none " +
                                 (this.props.className || "") + " " +
                                 (!enabled ? "bg-gray-400 " :
                                     (this.props.active ? "bg-blue-600 " : "bg-blue-500 active:bg-blue-600 ") +
                                     "hover:bg-blue-600")
                             }>

                {(disabledByTime ? "Continue" : this.props.buttonText || "Continue")}
            </ConditionalLink>
        );
    }
}


/**
 * Returns whether the page is scrolled to the bottom.
 */
function isScrolledDown() {
    const errorMargin = 20.0;
    const pageHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    return (window.innerHeight + window.pageYOffset) >= (pageHeight - errorMargin);
}


export class ContinueBanner extends Component {
    constructor(props) {
        super(props);
        this.state = {scrolledDown: isScrolledDown()};
        this.scrollTrackingTimer = null;

        // We create a new function to make sure that removing it as an
        // event listener won't clash with other ContinueBanner instances.
        this.trackScrolling = () => {
            const scrolledDown = isScrolledDown();
            if (this.state.scrolledDown !== scrolledDown) {
                this.setState({scrolledDown: scrolledDown})
            }
        };
    }

    componentDidMount() {
        if (this.props.requireScrollToBottom) {
            this.scrollTrackingTimer = setInterval(this.trackScrolling, 10);
        }
    }

    componentWillUnmount() {
        if (this.scrollTrackingTimer !== null) {
            clearInterval(this.scrollTrackingTimer);
            this.scrollTrackingTimer = null;
        }
    }

    render() {
        let text = "Continue";
        let disabledTooltip = undefined;
        let disabled = false;
        if (this.props.requireScrollToBottom && !this.state.scrolledDown) {
            text = <span className="text-lg">Scroll Down to Continue</span>;
            disabledTooltip = "Scroll to the bottom of the page to continue";
            disabled = true;
        }

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
                        condition={!disabled && this.props.condition}
                        buttonText={text}
                        disabledTooltip={disabledTooltip}
                        onClick={this.props.onClick}
                        delay={this.props.delay}
                        className="text-xl px-4 py-2" />
                </div>
            </>
        );
    }
}
