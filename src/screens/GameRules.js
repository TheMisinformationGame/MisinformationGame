import reactionOptions from "./reaction-options.png"
import progressView from "./progress-view.png"
import {ContinueBanner} from "../components/ContinueButton";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Redirect} from "react-router-dom";
import React from "react";

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
            return (<Redirect to={"/game/" + study.id + "/id" + window.location.search} />);
        if (stage === "debrief")
            return (<Redirect to={"/game/" + study.id + "/debrief" + window.location.search} />);

        const target = "/game/" + study.id + "/post-intro" + window.location.search;
        const continueDelaySeconds = 15;
        return (
            <div>
                <div className="m-1 bg-white p-10">
                    <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                    <p className="leading-5 mb-4">
                    You will be shown a series of posts, which you are encouraged to interact with. To begin with, you will have a certain number of followers, and a credibility rating. These may change dynamically as you continue interacting with the posts.</p>
                    <p className="leading-5 mb-4">
                    When you see a post, there are the following options: </p>
                    <img className="rounded-md max-w-xs my-8" src={reactionOptions} alt="Row of icons: Like, Dislike, Share, Flag, Skip" />
                    <ul className="list-none list-inside mt-4">
                        <li className="leading-5 mb-4"><ThumbUpIcon /> The <b><i>like</i></b> button will indicate to others that you like the content of this post.</li>
                        <li className="leading-5 mb-4"><ThumbDownIcon /> The <b><i>dislike</i></b> button will indicate to others that you dislike the content of this post.</li>
                        <li className="leading-5 mb-4"><ReplyIcon /> The <b><i>share</i></b> button will show this post to your followers.</li>
                        <li className="leading-5 mb-4"><FlagIcon /> The <b><i>flag</i></b> button will report this post as harmful or misleading.</li>
                        <li className="leading-5 mb-4"> The <b><i>skip post </i></b> button will take you straight to the next post.</li>
                    </ul>

                    <p className="leading-5 my-4">You will also be able to track your progress in terms of your follower count and credibility rating:</p>
                    <img className="rounded-md max-w-xs my-8" src={progressView} alt="Follower count and credibility rating" />

                    <p className="leading-5 my-4">Your <b><i>follower count</i></b> is the number of other users following you on this network.</p>
                    <p className="leading-5 my-4">Your <b><i>credibility rating</i></b> is an indication of how credible you are perceived to be.</p>

                    {/* <p className="leading-5 mb-4">Each time you react to a post you will likely increase or decrease your followers and credibility. Your followers count represents the number of people following you. The credibility percentage records how credibile you are perceved to be.

                    When you look at the post itself you will see that there are users in the top left of both posts and comments. These users have credibilty next to their name and the user who posted the top post will also have a number of followers displayed. Keep these numbers in mind when deciding how to react to a post.


                    </p> */}
                </div>

                <ContinueBanner to={target} condition={true} delay={continueDelaySeconds} />
            </div>
        );
    }
}
