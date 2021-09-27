import {Component} from "react"
import {ErrorLabel} from '../components/StatusLabel';
import "../App.css"
import {ConditionalLink} from "../components/ConditionalLink";
import {getDataManager} from "../model/manager";
import {ActiveStudyScreen} from "./ActiveStudyScreen";


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

export class GameIdentification extends ActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            displayError: false,
            ignoreKeyDowns: false,
            submitOnEnterUp: false
        };
        this.submitCancelTimer = null;
    };

    componentDidMount() {
        super.componentDidMount();

        // Preload the active study.
        getDataManager().getActiveGame().then((game) => {
            game.preloadCurrentState();
        });
    }

    componentWillUnmount() {
        if (this.submitCancelTimer !== null) {
            clearTimeout(this.submitCancelTimer);
        }
    }

    static isValidValue(value) {
        return value && value.trim() !== "";
    }

    static isEnterKey(e) {
        return e.charCode === 13 || e.keyCode === 13
    }

    handleKeyDown(e) {
        if (this.state.ignoreKeyDowns || !GameIdentification.isEnterKey(e))
            return;

        if (GameIdentification.isValidValue(this.state.value)) {
            // Set the state so the release of the enter key will submit.
            this.setState({
                ...this.state, displayError: true,
                submitOnEnterUp: true, ignoreKeyDowns: true
            });

            // If the user waits a second without releasing enter, cancel the submit.
            this.submitCancelTimer = setTimeout(() => {
                this.submitCancelTimer = null;
                this.setState({...this.state, submitOnEnterUp: false});
            }, 1000);
        } else {
            // If the ID is invalid, display the error.
            this.setState({...this.state, displayError: true});
        }
    }

    handleKeyUp(e, target) {
        if (!GameIdentification.isEnterKey(e))
            return;

        if (this.state.submitOnEnterUp && GameIdentification.isValidValue(this.state.value)) {
            this.props.history.push(target);
        } else if(this.state.ignoreKeyDowns) {
            this.setState({...this.state, ignoreKeyDowns: false});
        }
    }

    render() {
        const target = "/game/" + getDataManager().getActiveStudyID() + "/intro";
        return (
            <div className="w-full bg-gray-100" style={{minHeight: "100vh"}}>
                <div className="bg-white rounded-xl shadow-xl border border-gray-400
                                  grid space-y-2 px-10 py-4 max-w-full
                                  fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                    <p className="font-bold">Enter your access ID:</p>
                    <input className="px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100"
                           placeholder="ID Number"
                           value={this.state.value}
                           onChange={e => this.setState({...this.state, value: e.target.value})}
                           onKeyDown={e => this.handleKeyDown(e)}
                           onKeyUp={e => this.handleKeyUp(e, target)}>
                    </input>
                    {this.state.displayError && (!this.state.value || this.state.value.trim() === "") &&
                        <ErrorLabel value="Please enter an ID" />}

                    <ContinueButton to={target}
                                    condition={GameIdentification.isValidValue(this.state.value)}
                                    onClick={() => this.setState({...this.state, displayError: true})}
                                    active={this.state.submitOnEnterUp} />
                </div>
            </div>
        )
    }
}
