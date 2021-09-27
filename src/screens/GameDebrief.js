import "../App.css"
import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";

export class GameDebrief extends SimpleActiveStudyScreen {
    renderWithStudy(study) {
        return (
            <div className="m-1 bg-white p-10">
                <p className="leading-5 mb-4" dangerouslySetInnerHTML={{__html: study.debrief}} />
            </div>
        );
    }
}
