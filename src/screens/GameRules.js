import gameImage from "./game-mockup.png"
import "../App.css"
import {ContinueBanner} from "../components/ContinueButton";
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";


/**
 * The page that is shown to explain the rules of the game to participants.
 */
export class GameRules extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props, true);
    }

    renderWithStudy(study) {
        const target = "/game/" + study.id + "/post-intro";
        return (
            <div>
                <div className="m-1 bg-white p-10">
                    <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                    <p className="leading-5 mb-4">
                    When participating in a study you will have five options. These are the "like", "dislike", "skip", "share" and "flag" buttons on the bottom row. You can react to the post you are looking at with these options.</p>
                    <ul className="list-disc list-inside">
                        <li className="leading-5 mb-4">The like button will tell everyone that you like this post.</li>
                        <li className="leading-5 mb-4">The dislike button will tell everyone that you dislike this post.</li>
                        <li className="leading-5 mb-4">The skip button will remove the post from your screen but will not tell your followers anything.</li>
                        <li className="leading-5 mb-4">The share button will show the post to your followers.</li>
                        <li className="leading-5 mb-4">The flag button will report the post. Use this for rulebreaking or dangerious posts.</li>
                    </ul>

                    <p className="leading-5 mb-4">Each time you react to a post you will likely increase or decrease your followers and credibility. Your followers count represents the number of people following you. The credibility percentage records how credibile you are perceved to be.

                    When you look at the post itself you will see that there are users in the top left of both posts and comments. These users have credibilty next to their name and the user who posted the top post will also have a number of followers displayed. Keep these numbers in mind when deciding how to react to a post.


                    </p>
                    <img className="max-h-64" src={gameImage} alt="Example of what the game will look like" />
                </div>

                <ContinueBanner to={target} condition={true} delay={study.introDelaySeconds} />
            </div>
        );
    }
}
