import {ErrorLabel} from '../../components/StatusLabel';
import {getDataManager} from "../../model/manager";
import {ContinueButton} from "../../components/ContinueButton"
import {ActiveGameScreen} from "./ActiveGameScreen";
import React from "react";


export class GameIdentification extends ActiveGameScreen {
    constructor(props) {
        super(props, ["identification"]);
        this.state = {
            ...this.state,
            value: "",
            displayError: false,
            ignoreKeyDowns: false,
            submitOnEnterUp: false
        };
    };

    afterGameLoaded(game) {
        super.afterGameLoaded(game);
        if (!game.participant.participantID)
            return;

        this.setStateIfMounted(() => {
            return {value: game.participant.participantID};
        });
    }

    componentDidMount() {
        super.componentDidMount();

        // Preload the study.
        getDataManager().getActiveStudy().catch(err => {
            console.error(err);
        });
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
            this.setState(() => {
                return {
                    displayError: true,
                    submitOnEnterUp: true,
                    ignoreKeyDowns: true
                };
            });

            // If the user waits a second without releasing enter, cancel.
            setTimeout(() => {
                this.setStateIfMounted(() => {
                    return {submitOnEnterUp: false};
                });
            }, 1000);
        } else {
            // If the ID is invalid, display the error.
            this.setState(() => {
                return {displayError: true};
            });
        }
    }

    handleKeyUp(game, e, target) {
        if (!GameIdentification.isEnterKey(e))
            return;

        if (this.state.submitOnEnterUp && GameIdentification.isValidValue(this.state.value)) {
            this.submitID(game, this.state.value);
            this.props.navigate(target);
        } else if (this.state.ignoreKeyDowns) {
            this.setState(() => {
                return {ignoreKeyDowns: false, submitOnEnterUp: false};
            });
        }
    }

    updateID(game, id) {
        this.setState(() => {
            return {value: id};
        });
    }

    submitID(game, id) {
        game.participant.participantID = id;
        game.saveLocally();
    }

    renderWithStudyAndGame(study, game) {
        const target = "/study/" + study.id + window.location.search;
        return (
            <div className="w-full bg-gray-100" style={{minHeight: "100vh"}}>
                <div className="bg-white rounded-xl shadow-xl border border-gray-400
                                grid space-y-2 px-10 py-4 max-w-full
                                fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">

                    <p className="font-bold">Enter your access ID:</p>
                    <input className="px-3 py-2 border border-gray-400 rounded-md justify-self-center bg-gray-100"
                           placeholder="ID Number"
                           value={this.state.value}
                           onChange={e => this.updateID(game, e.target.value)}
                           onKeyDown={e => this.handleKeyDown(e)}
                           onKeyUp={e => this.handleKeyUp(game, e, target)}>
                    </input>
                    {this.state.displayError && (!this.state.value || this.state.value.trim() === "") &&
                        <ErrorLabel value="Please enter an ID" />}

                    <ContinueButton
                        to={target}
                        onSubmit={() => this.submitID(game, this.state.value)}
                        condition={GameIdentification.isValidValue(this.state.value)}
                        disabledTooltip="Enter your access ID to continue"
                        onClick={() => this.setState(() => {
                            return {displayError: true};
                        })}
                        active={this.state.submitOnEnterUp} />
                </div>
            </div>
        )
    }
}
