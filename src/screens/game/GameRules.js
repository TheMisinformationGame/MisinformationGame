import reactionOptions from "../reaction-options.png"
import {ContinueBanner} from "../../components/ContinueButton";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Redirect} from "react-router-dom";
import React from "react";
import {ParticipantProgress} from "../../components/ParticipantProgress";
import {CredibilityLabel} from "../../components/CredibilityLabel";

/**
 * The page that is shown to explain the rules of the game to participants.
 */
export class GameRules extends ActiveGameScreen {
    constructor(props) {
        super(props, true);
    }

    renderWithStudyAndGame(study, game) {
        const stage = game.getCurrentStage();
        if (stage === "identification")
            return (<Redirect to={"/study/" + study.id + "/id" + window.location.search} />);
        if (stage === "debrief")
            return (<Redirect to={"/study/" + study.id + "/debrief" + window.location.search} />);

        const target = "/study/" + study.id + "/post-intro" + window.location.search;
        const continueDelaySeconds = 20;

        const followersAndCredibility = (study.displayFollowers ? "follower count" : "") + 
                                        (study.displayFollowers && study.displayCredibility ? " and " : "") +
                                        (study.displayCredibility ? "credibility rating" : "")
        return (
            <div>
                <div className="m-1 bg-white p-10 max-w-4xl ml-auto mr-auto">
                    <h2 className="align-middle text-4xl mb-4">How to Participate</h2>
                    <p className="leading-5 mb-4">
                        You will be shown a series of posts, which you are encouraged to interact with.
                        To begin with, you will start with 0 followers and a credibility rating of 50.
                        As you interact with posts, these values may change based upon your interactions.
                    </p>
                    <p className="leading-5 my-4 mt-6">
                        When you are shown a post, you may choose one of the following reactions:
                    </p>
                    <img className="w-full max-w-xs mt-4 mb-6 rounded-md shadow border border-gray-400"
                         src={reactionOptions}
                         alt="Row of icons: Like, Dislike, Share, Flag, Skip" />

                    <ul className="list-none list-inside mt-4">
                        <li className="leading-5 mb-4">
                            <ThumbUpIcon className="text-gray-700 mr-2" />
                            The <b><i>like</i></b> button will indicate to others that you like
                            the content of this post.
                        </li>
                        <li className="leading-5 mb-4">
                            <ThumbDownIcon className="text-gray-700 mr-2" />
                            The <b><i>dislike</i></b> button will indicate to others that you dislike
                            the content of this post.
                        </li>
                        <li className="leading-5 mb-4">
                            <span className="inline-block transform scale-125">
                                <ReplyIcon className="text-gray-700 mr-2 transform flip-x" />
                            </span>
                            The <b><i>share</i></b> button will show this post to your followers.
                        </li>
                        <li className="leading-5 mb-4">
                            <FlagIcon className="text-gray-700 mr-2" />
                            The <b><i>flag</i></b> button will report this post as harmful or misleading.
                        </li>
                        <li className="leading-5 mb-4">
                            The <b><i>skip post </i></b> button will allow you to not interact with the post at all.
                        </li>
                    </ul>

                    {study.requireComments && 
                    <p className="leading-5 mb-4 mt-6">
                        The text box below the post is where you add your own comment.
                    </p>
                    }
                    {/* Image of comment box, once implemented */}

                    {study.requireReactions &&
                    <p className="leading-5 mb-4 mt-6">
                        To move on to the next post, you must first select to like, dislike, share, flag,
                        or skip the post, which can be done underneath the content of the post. Once you
                        have reacted to the post, you will be able to press the
                        <b>&nbsp;Continue to Next Post&nbsp;</b>
                        button underneath <b>Your Progress</b>.
                    </p>
                    }
                    {!study.requireReactions &&
                    <p className="leading-5 mb-4 mt-6">
                        For any post shown, you may "react" to it with any of the buttons available. Once
                        you have reacted to the post, you can press the 
                        <b>&nbsp;Continue to Next Post&nbsp;</b>
                        button underneath <b>Your Progress</b>.
                    </p>
                    }

                    {(study.displayFollowers || study.displayCredibility) &&
                    <p className="leading-5 mb-4 mt-6">
                        Your own {followersAndCredibility} will also be shown under
                        <b>&nbsp;Your Progress</b>,
                    </p>
                    }
                    <ParticipantProgress
                        displayFollowers={study.displayFollowers}
                        displayCredibility={study.displayCredibility}
                        displayProgress = {study.displayProgress}
                        overrideFollowers={13}
                        overrideCredibility={56}
                        hideTooltip={true}
                        nextPostText="Continue to Next Post"
                        onNextPost={() => {}}
                        nextPostEnabled={false}
                        progressPercentage = {0}
                        />
                    {study.displayProgress && 
                    <p className="leading-5 my-4">
                        Your progress is indicated through a <b><i>Percentage</i></b> value.
                        This will indicate how many posts you have left to react to. 
                    </p>
                    }
                    {study.displayFollowers &&
                    <p className="leading-5 my-4">
                        Your <b><i>follower count</i></b> is the number of other users
                        following you on this network.
                    </p>
                    }
                    {study.displayCredibility &&
                    <p className="leading-5 my-4">
                        Your <b><i>credibility rating</i></b> is an indication of how
                        credible you are perceived to be on a scale from 0 to 100.
                        Credibility ratings will also be colour coded
                        from <span className="font-semibold"
                                   style={{color: CredibilityLabel.getCredibilityColour(5)}}>
                            dark red
                        </span> for the 0-10 range
                        to <span className="font-semibold"
                                 style={{color: CredibilityLabel.getCredibilityColour(95)}}>
                            dark blue
                        </span> for the 90-100 range.
                    </p>
                    }

                </div>

                <ContinueBanner to={target} condition={true} delay={continueDelaySeconds} />
            </div>
        );
    }
}
