import React, {Component} from "react";
import SupervisedUserCircleIcon from "@material-ui/icons/SupervisedUserCircle";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import {CredibilityLabel} from "./CredibilityLabel";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

class ChangeLabel extends Component {
    render() {
        if (!this.props.change)
            return null;

        let icon, change, colour;
        if (this.props.change > 0) {
            icon = <ArrowDropUpIcon className="mr-1.5" />
            change = "+" + this.props.change;
            colour = "#006be2";
        } else {
            icon = <ArrowDropDownIcon className="mr-1.5" />
            change = this.props.change;
            colour = "#961818";
        }
        return (<span className={"font-semibold " + (this.props.className || "")} style={{color: colour}}>
            {icon} {change}
        </span>);
    }
}

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
        return (
            <div className={
                "w-full bg-white " + (fancyPositioning ?
                    /* If we are on the game screen we need to do a lot. */
                    " fixed md:static md:max-w-xs md:mt-2 lg:mt-5 " +
                    " bottom-0 md:bottom-auto md:top-0 left-1/2 md:left-0 " +
                    " transform -translate-x-1/2 md:translate-x-0 " +
                    " z-10 transform -translate-x-1/2 md:translate-x-0 " +
                    " md:rounded-xl shadow-2xl md:shadow-xl md:border md:border-gray-400 "
                    : /* Or, if we aren't on the game screen, then only a little. */
                    " static max-w-xs rounded-xl border border-gray-400 shadow ")}>

                <div className={
                    "p-2 px-4 pb-3 " + (fancyPositioning ? "border-t border-gray-400 md:border-none" : "")}>

                    <p className="text-xl font-semibold mb-2">
                        Your Progress {stringPercent}
                    </p>

                    {displayFollowers &&
                        <p className="text-xl">
                            <SupervisedUserCircleIcon className="align-bottom mr-1" />
                            <span className="inline-block text-lg w-24 transform -translate-y-0.5">
                                Followers:
                            </span>
                            <span className="font-semibold">
                                &nbsp;{Math.round(followers)}&nbsp;
                            </span>
                            <ChangeLabel change={this.props.followerChange} />
                        </p>}
                    
                    {displayCredibility &&
                        <p className="text-xl">
                            <CheckCircleIcon className="align-bottom mr-1" />
                            <span className="inline-block text-lg w-24">
                                Credibility:
                            </span>
                            <CredibilityLabel credibility={credibility}
                                              className="transform translate-y-2" />
                            <ChangeLabel change={this.props.credibilityChange} />
                        </p>}

                    <div onClick={onNextPost}
                         title={nextPostEnabled || this.props.hideTooltip ? "" :
                             "You must react to the post before you can continue to the next post"}
                         className={
                             " mt-3 px-3 py-2 rounded-md text-white select-none " +
                             (nextPostEnabled ? " cursor-pointer " : "") +
                             (nextPostEnabled ?
                                 " bg-blue-500 active:bg-blue-600 hover:bg-blue-600 " : " bg-gray-400 ")
                         }>

                        {this.props.nextPostText}
                    </div>
                </div>
            </div>
        );
    }
}
