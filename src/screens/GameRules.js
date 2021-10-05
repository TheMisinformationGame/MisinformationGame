import reactionOptions from "./reaction-options.png"
import progressView from "./progress-view.png"
import "../App.css"
import {ContinueBanner} from "../components/ContinueButton";
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ReplyIcon from '@mui/icons-material/Reply';
import FlagIcon from '@material-ui/icons/Flag';

/**
 * The page that is shown to explain the rules of the game to participants.
 */
export class GameRules extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props, true);
    }

    renderWithStudy(study) {
        const target = "/game/" + study.id + "/post-intro";
        const continueDelaySeconds = 5;
        return (
            <div>
                <div className="m-1 bg-white p-10">
                    <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                    <p className="leading-5 mb-4">
                    You will be shown a series of posts, which you are encouraged to interact with. To begin with you will have a number of followers, and a credibility rating. These may change as you continue interacting with the posts.</p>
                    <p className="leading-5 mb-4">
                    When you see a post, there are the following options: </p>
                    <ul className="list-none list-inside">
                        <li className="leading-5 mb-4"><ThumbUpIcon /> The <b><i>like</i></b> button indicates that you like the content of this post.</li>
                        <li className="leading-5 mb-4"><ThumbDownIcon /> The <b><i>dislike</i></b> button indicates that you dislike the content of this post.</li>
                        <li className="leading-5 mb-4"><ReplyIcon /> The <b><i>share</i></b> button will show this post to your followers.</li>
                        <li className="leading-5 mb-4"><FlagIcon /> The <b><i>flag</i></b> button will report this post. Use this for rulebreaking or dangerous posts.</li>
                        <li className="leading-5 mb-4"> The <b><i>skip post </i></b> button will take you straight to the next post.</li>
                    </ul>

                    <img className="border-2 border-black rounded-md" src={reactionOptions} alt="Example of what the game will look like" />

                    <p className="leading-5 my-4">Your <b><i>follower count</i></b> is the number of other users following you on this network. </p>
                    <p className="leading-5 my-4">Your <b><i>credibility rating</i></b> is an indication of how credible you are percieved to be. </p>

                    <img className="border-2 border-black rounded-md" src={progressView} alt="Example of what the game will look like" />
                    {/* <p className="leading-5 mb-4">Each time you react to a post you will likely increase or decrease your followers and credibility. Your followers count represents the number of people following you. The credibility percentage records how credibile you are perceved to be.

                    When you look at the post itself you will see that there are users in the top left of both posts and comments. These users have credibilty next to their name and the user who posted the top post will also have a number of followers displayed. Keep these numbers in mind when deciding how to react to a post.


                    </p> */}
                </div>

                <ContinueBanner to={target} condition={true} delay={continueDelaySeconds} />
            </div>
        );
    }
}
