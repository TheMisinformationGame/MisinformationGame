import {SimpleActiveStudyScreen} from "./ActiveStudyScreen";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export class GameDebrief extends SimpleActiveStudyScreen {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            hidden: true
        }
    }

    renderWithStudy(study) {
        // TODO : This should get the currently active game and make sure that it is completed.
        //        Then, it should generate a new completion code for the game if one hasn't
        //        been generated already. Then, we should make sure to save the participant's
        //        progress to the database before we show them the debriefing page.

        const hidden = this.state.hidden;
        let completionCode;
        if (hidden) {
            completionCode = "";
            for (let digit = 0; digit < study.completionCodeDigits; ++digit) {
                completionCode += "*";
            }
        } else {
            completionCode = study.generateRandomCompletionCode();
        }

        return (
            <div className="m-1 bg-white p-10 relative">
                <p className="leading-5" dangerouslySetInnerHTML={{__html: study.debrief}} />

                <div className="mt-8">
                    <input id="confirmation-checkbox" type="checkbox"
                           className="inline-block align-middle w-6 h-6
                                      checked:bg-blue-600 checked:border-transparent"
                           onClick={e => this.setState({...this.state, hidden: !hidden})}/>
                    <label className="inline-block ml-4 font-semibold text-lg align-middle">
                        I confirm I have read the study debriefing
                    </label>
                </div>

                <div className="border border-black rounded-md
                                inline-block p-2 w-96 mt-4
                                text-center font-mono tracking-widest">

                    <p className={"leading-5 " + (hidden ? "select-none" : "select-all")}>
                        {completionCode}
                    </p>
                </div>
                <button className={"ml-1 p-2 rounded-lg " +
                                   (hidden ? "text-gray-500 cursor-default" :
                                             "hover:bg-gray-100 active:bg-gray-300")}
                        title={hidden ? "Completion Code is Hidden" : "Copy Completion Code"}
                        onClick={() => {navigator.clipboard.writeText(completionCode)}}>

                    <ContentCopyIcon  />
                </button>
                <p className="leading-5 mt-4">This is your completion code, please copy and paste it into your Mechanical Turks response as proof of completion.</p>
            </div>
        );
    }
}
