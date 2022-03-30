import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Component} from "react";
import {replaceHTMLPlaceholder} from "./GameIntroduction";


/**
 * A weird component that is designed to be written to
 * static HTML and then included into the page.
 */
class CompletionCodeWidget extends Component {
    render() {
        const realCompletionCode = this.props.completionCode;
        let hiddenCompletionCode = "";
        for (let digit = 0; digit < realCompletionCode.length; ++digit) {
            hiddenCompletionCode += "*";
        }

        return <>
            <div className="mt-8">
                <input id="confirmation-checkbox" type="checkbox"
                       className="inline-block align-middle w-6 h-6
                                      checked:bg-blue-600 checked:border-transparent" />
                <label className="inline-block ml-4 font-semibold text-lg align-middle">
                    I confirm I have read the study debriefing
                </label>
            </div>

            <div className="flex">
                <div className="border border-black rounded-md
                                inline-block p-2 w-96 mt-4
                                text-center font-mono tracking-widest">

                    <p className="leading-5">
                        <span id="real-completion-code" style={{"display": "none"}}>
                            {realCompletionCode}
                        </span>
                        <span id="hidden-completion-code" style={{"display": "inline-block"}}>
                            {hiddenCompletionCode}
                        </span>
                    </p>
                </div>
                <button id="copy-completion-code"
                        className="ml-1 p-2 rounded-lg transform translate-y-2
                                   text-gray-500 cursor-default
                                   hover:bg-gray-100 active:bg-gray-300">

                    <ContentCopyIcon  />
                </button>
            </div>
        </>
    }

    /**
     * This is required as this widget has to be collapsed to HTML text
     * to be replaced as a placeholder in the debriefing page. Therefore,
     * we link all its events to the components later, instead of through
     * the use of React.
     */
    static makeInteractive() {
        const checkbox = document.getElementById("confirmation-checkbox");
        const realCompletionCode = document.getElementById("real-completion-code");
        const hiddenCompletionCode = document.getElementById("hidden-completion-code");
        const copy = document.getElementById("copy-completion-code");
        if (!checkbox || !realCompletionCode || !hiddenCompletionCode || !copy)
            return;  // Not in the page.

        const completionCode = realCompletionCode.innerText;

        const updateStyles = function() {
            if (checkbox.checked) {
                realCompletionCode.style.display = "inline-block";
                hiddenCompletionCode.style.display = "none";
                copy.classList.remove("text-gray-500", "cursor-default");
                copy.classList.add("hover:bg-gray-100", "active:bg-gray-300")
            } else {
                realCompletionCode.style.display = "none";
                hiddenCompletionCode.style.display = "inline-block";
                copy.classList.add("text-gray-500", "cursor-default");
                copy.classList.remove("hover:bg-gray-100", "active:bg-gray-300")
            }
        };

        checkbox.addEventListener("change", updateStyles);
        copy.addEventListener("click", function() {
            if (checkbox.checked) {
                navigator.clipboard.writeText(completionCode).then(() => {
                    console.log("Copied \"" + completionCode + "\" to the clipboard");
                }).catch(err => {
                    console.error("Unable to copy \"" + completionCode + "\" to the clipboard");
                    console.error(err);
                });
            }
        });

        updateStyles();
    }
}


export class GameDebrief extends ActiveGameScreen {
    componentDidMount() {
        super.componentDidMount();
        CompletionCodeWidget.makeInteractive();
    }

    renderWithStudyAndGame(study, game) {
        let debriefHTML = study.debrief;

        if (study.genCompletionCode) {
            debriefHTML = replaceHTMLPlaceholder(debriefHTML, "{{COMPLETION-CODE}}", () => {
                return <CompletionCodeWidget completionCode={game.completionCode} />
            }, 1);
        }

        return (
            <div className="m-1 bg-white p-10 max-w-4xl ml-auto mr-auto">
                <p className="leading-tight" dangerouslySetInnerHTML={{__html: debriefHTML}} />
            </div>
        );
    }
}
