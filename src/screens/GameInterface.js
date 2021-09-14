import placeholderPostImage from "../placeholderPost.png";
import "../App.css"
import { Component } from "react";
import { readStudySettings } from '../utils/getFromDB';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import BlockIcon from '@material-ui/icons/Block';
import LaunchIcon from '@material-ui/icons/Launch';
import FlagIcon from '@material-ui/icons/Flag';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';


class Source extends Component {

    static pickCredibilityColourClass(credibility) {
        if (credibility < 30)
            return "text-red-500";
        if (credibility < 70)
            return "text-yellow-500";
        return "text-green-600";
    }

    render() {
        const smol = !!this.props.small;
        const text_xl = (smol ? "text-lg" : "text-xl");
        return (
            <div className={this.props.className}>
                <div className="flex">
                    <p className={text_xl}>{this.props.name} (</p>
                    <p className={text_xl + " " + Source.pickCredibilityColourClass(this.props.credibility)}>
                        &nbsp;{this.props.credibility}&nbsp;
                    </p>
                    <p className={text_xl}>)</p>
                </div>
                {smol || /* Hides the followers if smol is true. */
                    <div className="flex">
                        <p className="text-sm">{this.props.followers}&nbsp;followers</p>
                    </div>
                }
            </div>
        );
    }
}

class Comment extends Component {
    render() {
        return (
            <div className={"flex flex-col p-1 px-2 border-b-2 border-grey" + (this.props.className || "")}>
                <Source name={this.props.name}
                        small={true}
                        credibility={this.props.credibility}
                        followers={this.props.followers} />

                <p className="w-full">{this.props.message}</p>
            </div>
        );
    }
}

class ReactionsRow extends Component {
    /**
     * Unfortunately Tailwind CSS just doesn't quite cut
     * it for the fine adjustments we need to make to
     * make the reaction buttons look correct.
     */
    render() {
        const buttonClassName = "fill-current px-4 cursor-pointer " +
                                "transform hover:scale-125 transition duration-100 " +
                                "filter hover:drop-shadow";
        const buttonStyle = {
            fill: "rgb(70, 70, 70)",
            fontSize: "3rem"
        };
        return (
            <div className="flex flex-row justify-center p-2 bg-white"
                 style={{boxShadow: "0 -0.1rem 0.3rem rgba(0, 0, 0, 0.2)"}}>

                <div id="like" className={buttonClassName}>
                    <ThumbUpIcon style={buttonStyle} />
                </div>
                <div id="dislike" className={buttonClassName}>
                    <ThumbDownIcon style={buttonStyle} />
                </div>
                <div id="skip" className={buttonClassName}>
                    <BlockIcon style={buttonStyle} />
                </div>
                <div id="share" className={buttonClassName}>
                    <LaunchIcon style={buttonStyle} />
                </div>
                <div id="flag" className={buttonClassName}>
                    <FlagIcon style={buttonStyle} />
                </div>
            </div>
        );
    }
}

class GameScreen extends Component {
    componentDidMount(){
        const studyID = "8UsCG45359Hp57i5hmIiaaa";
        readStudySettings(studyID).then(study => {
            console.log(study)
        }).catch((err) => {
            console.error(err);
        });
    };

    render() {
        // We have to use min-height: 100vh, as the Tailwind min-h-full doesn't work :(
        const fullHeightStyle = {minHeight: "100vh"};
        return (
            <div className="w-full bg-gray-400" style={fullHeightStyle}>

                <div className="w-full max-w-xl ml-auto mr-auto bg-gray-200
                                border-l-2 border-r-2 border-gray-700 shadow-2xl"
                     style={fullHeightStyle}>

                    {/* Post and comments. */}
                    <div className="flex flex-col bg-white shadow">
                        <div className="flex p-2">
                            <Source name="Source 1" credibility={87} followers={987} />
                        </div>
                        <div className="flex flex-col flex-grow text-left text-3xl font-bold">
                            <p className="p-2">Sensationalised Image Post</p>
                            <img src={placeholderPostImage} className="w-full" alt="logo" />
                        </div>
                        <Comment name="Source 2" credibility={10} followers={1284}
                                 message="I like this content." />
                        <Comment name="Source 3" credibility={50} followers={53}
                                 message="This content is obviously fake..." />
                    </div>

                    {/* Used for reserving space below reactions and progress. */}
                    <div className="h-40" />

                    {/* Reactions and progress. */}
                    <div className="w-full fixed bottom-0 ml-auto mr-auto shadow-2xl
                                    w-full max-w-xl border-r-4 border-opacity-0">

                        <ReactionsRow />
                        <div className="p-2 px-4 pb-3 bg-gray-200">
                            <p className="text-xl font-bold mb-1">
                                Your Progress
                            </p>
                            <p className="text-xl">
                                <SupervisedUserCircleIcon className="align-bottom mr-1" />
                                Followers: 1024
                                <CheckCircleIcon className="align-bottom ml-6 mr-1" />
                                Credibility: 72
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default GameScreen;
