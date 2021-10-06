import {ContinueBanner} from "../components/ContinueButton";
import {ActiveGameScreen} from "./ActiveGameScreen";


class GameIntroductionScreen extends ActiveGameScreen {
    constructor(props) {
        super(props, true);
    }

    getContent(study) {
        throw new Error("Implement getContent(study)");
    }

    getTarget(study) {
        throw new Error("Implement getTarget(study)");
    }

    getContinueDelaySeconds(study) {
        throw new Error("Implement getContinueDelaySeconds(study)");
    }

    renderWithStudyAndGame(study, game) {
        const content = this.getContent(study);
        const target = this.getTarget(study) + window.location.search;
        const delay = this.getContinueDelaySeconds(study);

        // If this page is empty, redirect them to the next page.
        if (content.trim().length === 0) {
            setTimeout(() => {
                this.props.history.push(target);
            });
            return (
                <div>Redirecting...</div>
            );
        }
        return (
            <div>
                <div className="p-10">
                    <p dangerouslySetInnerHTML={{__html: content}} />
                </div>
                <ContinueBanner to={target} condition={true} delay={delay} />
            </div>
        );
    }
}

export class GamePreIntroduction extends GameIntroductionScreen {
    getContent(study) {
        return study.preIntro;
    }

    getTarget(study) {
        return "/game/" + study.id + "/rules";
    }

    getContinueDelaySeconds(study) {
        return study.preIntroDelaySeconds;
    }
}

export class GamePostIntroduction extends GameIntroductionScreen {
    getContent(study) {
        return study.postIntro;
    }

    getTarget(study) {
        return "/game/" + study.id;
    }

    getContinueDelaySeconds(study) {
        return study.postIntroDelaySeconds;
    }
}
