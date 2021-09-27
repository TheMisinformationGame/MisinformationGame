import "../App.css"
import {ContinueBanner} from "../components/ContinueButton";
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";


class GameIntroductionScreen extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props, true);
    }

    getContent(study) {
        throw new Error("Implement getContent(study)");
    }

    getTarget(study) {
        throw new Error("Implement getTarget(study)");
    }

    renderWithStudy(study) {
        return (
            <div>
                <div className="p-10">
                    <p dangerouslySetInnerHTML={{__html: study.introduction}} />
                </div>
                <ContinueBanner to={this.getTarget(study)} condition={true} />
            </div>
        );
    }
}

export class GamePreIntroduction extends GameIntroductionScreen {
    getContent(study) {
        return study.introduction;
    }

    getTarget(study) {
        return "/game/" + study.id + "/rules";
    }
}

export class GamePostIntroduction extends GameIntroductionScreen {
    getContent(study) {
        return study.introduction;
    }

    getTarget(study) {
        return "/game/" + study.id;
    }
}
