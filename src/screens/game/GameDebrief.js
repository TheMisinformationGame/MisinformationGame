import {SimpleActiveStudyScreen} from "../ActiveStudyScreen";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {ActiveGameScreen} from "./ActiveGameScreen";

export class GameDebrief extends ActiveGameScreen {
    constructor(props) {
        super(props);
        this.state = {
            ...this.state,
            hidden: true
        }
    }

    renderWithStudyAndGame(study, game) {
        const hidden = this.state.hidden;
        let completionCode;
        if (hidden) {
            completionCode = "";
            for (let digit = 0; digit < study.completionCodeDigits; ++digit) {
                completionCode += "*";
            }
        } else {
            completionCode = game.completionCode;
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
            </div>
        );
    }
}
