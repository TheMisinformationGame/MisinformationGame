import React, {Component} from "react";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {CredibilityLabel} from "../../components/CredibilityLabel";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

/**
 * A label that indicates the change to the follower or credibility number.
 */
class ChangeLabel extends Component {
    render() {
        if (!this.props.change)
            return null;

        let icon, change, colour;
        if (this.props.change > 0) {
            icon = <ArrowDropUpIcon  />;
            change = "+" + this.props.change;
            colour = "#006be2";
        } else {
            icon = <ArrowDropDownIcon />;
            change = this.props.change;
            colour = "#961818";
        }
        return (<span className={"inline-block whitespace-nowrap font-semibold " + (this.props.className || "")}
                      style={{color: colour}}>

            <span className="inline-block" style={{marginRight: "-0.1em"}}>
                {icon}
            </span> {change}
        </span>);
    }
}

/**
 * The progress dialog of a participant.
 */
export class ParticipantProgress extends Component {
    render() {
        const participant = this.props.participant;
        const nextPostEnabled = this.props.nextPostEnabled;
        const fancyPositioning = this.props.fancyPositioning;

        const followers = (this.props.overrideFollowers || participant.followers);
        const credibility = (this.props.overrideCredibility || participant.credibility);

        const displayFollowers = this.props.displayFollowers;
        const displayCredibility = this.props.displayCredibility;

        const stringPercent = this.props.displayProgress  ? `(${this.props.progressPercentage}%)` : '';

        const onNextPost = () => {
            if (nextPostEnabled) {
                this.props.onNextPost();
            }
        };
        return (<div className={(fancyPositioning ?
                " fixed md:sticky z-10 inline-block w-full " +
                " md:w-80 md:max-w-xs box-border " +
                " bottom-0 md:bottom-auto md:top-0 left-1/2 md:left-0 " : "")}>

            <div className={
                "bg-white " + (fancyPositioning ?
                    /* If we are on the game screen we need to do a lot. */
                    " block w-full md:mt-2 lg:mt-5 " +
                    " transform -translate-x-1/2 md:translate-x-0 " +
                    " md:rounded-xl shadow-up md:shadow-xl md:border md:border-gray-400 "
                    : /* Or, if we aren't on the game screen, then only a little. */
                    " static w-80 max-w-xs rounded-xl border border-gray-400 shadow ")}>

                <div className={
                    "p-2 " + (fancyPositioning ? "border-t border-gray-400 md:border-none" : "")}>

                    <p className="text-xl font-semibold mb-1.5">
                        Your Progress {stringPercent}
                    </p>

                    <div className="block">
                        {displayFollowers &&
                            <p className="text-xl flex flex-row items-middle mt-1">
                                <span className="inline-block">
                                    <SupervisedUserCircleIcon className="mr-1" />
                                </span>
                                <span className="inline-block text-lg md:w-24">
                                    Followers:
                                </span>
                                <span className="font-semibold">
                                    &nbsp;{Math.round(followers)}&nbsp;
                                </span>
                                <ChangeLabel change={this.props.followerChange} />
                            </p>}

                        {displayCredibility &&
                            <p className="text-xl flex flex-row items-middle mt-1">
                                <span className="inline-block">
                                    <CheckCircleIcon className="mr-1" />
                                </span>
                                <span className="inline-block text-lg md:w-24">
                                    Credibility:
                                </span>
                                <CredibilityLabel credibility={credibility} />
                                <ChangeLabel change={this.props.credibilityChange} />
                            </p>}
                    </div>

                    <div onClick={onNextPost}
                          title={nextPostEnabled || this.props.hideTooltip ? "" :
                              "You must react to the post before you can continue to the next post"}
                          className={
                              " mt-2 px-3 py-2 rounded-md text-white select-none " +
                              (nextPostEnabled ? " cursor-pointer " : "") +
                              (nextPostEnabled ?
                                  " bg-blue-500 active:bg-blue-600 hover:bg-blue-600 " : " bg-gray-400 ")
                          }>

                        {this.props.nextPostText}
                    </div>
                </div>
            </div>
        </div>);
    }
}
