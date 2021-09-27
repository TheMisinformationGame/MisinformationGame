import gameImage from "./game-mockup.png"
import "../App.css"
import {ContinueButton} from "./GameIdentification";
import {getDataManager} from "../model/manager";
import {ActiveStudyScreen} from "./ActiveStudyScreen";

export class GameIntroduction extends ActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {study: null};
    }

    componentDidMount() {
        getDataManager().getActiveStudy().then((study) => {
            this.setState({study: study});
        });
        // Preload the game.
        getDataManager().getActiveGame().then((game) => {
            game.preloadCurrentState();
        });
    }

    render() {
        const study = this.state.study;
        const target = "/game/" + getDataManager().getActiveStudyID();
        return (
            <div className="m-px">
                {this.state.study && <div className="m-px bg-white opacity-90 p-10">
                    <h2 className="align-middle text-4xl mb-4">{study.name}</h2>
                    <p className="leading-5 mb-4" dangerouslySetInnerHTML={{__html: study.introduction}} />
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
                </div>}

                {/* Used for reserving space below the continue button. */}
                <div className="h-16" />

                <div className="bg-gray-100 py-1 border-t-2 border-gray-400 shadow-2xl
                                fixed bottom-0 left-0 w-full h-16
                                flex justify-center items-center">
                    <ContinueButton to={target} className="text-xl px-4 py-2" condition={true} />
                </div>
            </div>
        );
    }
}
