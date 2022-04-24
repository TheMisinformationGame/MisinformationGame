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
        const requireConfirmation = this.props.requireConfirmation;
        let hiddenCompletionCode = "";
        for (let digit = 0; digit < realCompletionCode.length; ++digit) {
            hiddenCompletionCode += "*";
        }

        return <>
            {requireConfirmation &&
                <div className="mt-8">
                    <input id="confirmation-checkbox" type="checkbox"
                           className="inline-block align-middle w-6 h-6
                                          checked:bg-blue-600 checked:border-transparent" />
                    <label className="inline-block ml-4 font-semibold text-lg align-middle">
                        I confirm I have read the study debriefing
                    </label>
                </div>}

            <div className="flex">
                <div className="border border-black rounded-md
                                inline-block p-2 w-96 mt-4
                                text-center font-mono tracking-widest">

                    <p className="leading-5">
                        <span id="real-completion-code" style={{"display": "none"}}>
                            {realCompletionCode}
                        </span>
                        {requireConfirmation &&
                            <span id="hidden-completion-code" style={{"display": "inline-block"}}>
                                {hiddenCompletionCode}
                            </span>}
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
        const copy = document.getElementById("copy-completion-code");
        const realCompletionCode = document.getElementById("real-completion-code");
        const checkbox = document.getElementById("confirmation-checkbox");
        const hiddenCompletionCode = document.getElementById("hidden-completion-code");
        if (!copy || !realCompletionCode)
            return;  // Not in the page.

        const isCopyEnabled = () => !checkbox || checkbox.checked;
        const completionCode = realCompletionCode.innerText;

        copy.addEventListener("click", function() {
            if (isCopyEnabled()) {
                navigator.clipboard.writeText(completionCode).then(() => {
                    console.log("Copied \"" + completionCode + "\" to the clipboard");
                }).catch(err => {
                    console.error("Unable to copy \"" + completionCode + "\" to the clipboard");
                    console.error(err);
                });
            }
        });

        const updateStyles = function() {
            if (isCopyEnabled()) {
                realCompletionCode.style.display = "inline-block";
                if (hiddenCompletionCode) {
                    hiddenCompletionCode.style.display = "none";
                }
                copy.classList.remove("text-gray-500", "cursor-default");
                copy.classList.add("hover:bg-gray-100", "active:bg-gray-300")
            } else {
                realCompletionCode.style.display = "none";
                hiddenCompletionCode.style.display = "inline-block";
                copy.classList.add("text-gray-500", "cursor-default");
                copy.classList.remove("hover:bg-gray-100", "active:bg-gray-300")
            }
        };

        if (checkbox && hiddenCompletionCode) {
            checkbox.addEventListener("change", updateStyles);
        }
        updateStyles();
    }
}


export class GameDebrief extends ActiveGameScreen {
    componentDidUpdate() {
        // This must be run after every time the DOM of this component has been updated.
        window.requestAnimationFrame(CompletionCodeWidget.makeInteractive);
    }

    renderWithStudyAndGame(study, game) {
        let debriefHTML = study.debrief;
        let placeCompletionCodeAtEnd = false;

        if (study.genCompletionCode) {
            let ret = replaceHTMLPlaceholder(debriefHTML, "{{COMPLETION-CODE}}", () => {
                return <CompletionCodeWidget completionCode={game.completionCode} requireConfirmation={false} />;
            }, 1);
            debriefHTML = ret.content;

            if (ret.occurrences === 0) {
                ret = replaceHTMLPlaceholder(debriefHTML, "{{COMPLETION-CODE-WITH-CONFIRMATION}}", () => {
                    return <CompletionCodeWidget completionCode={game.completionCode} requireConfirmation={true} />;
                }, 1);
                debriefHTML = ret.content;
            }

            // If there are no occurrences, then place the completion
            // code at the bottom of the page.
            placeCompletionCodeAtEnd = (ret.occurrences === 0);
        }

        return (
            <div className="m-1 bg-white p-10 max-w-4xl ml-auto mr-auto">
                <p className="leading-tight" dangerouslySetInnerHTML={{__html: debriefHTML}} />

                {placeCompletionCodeAtEnd &&
                    <CompletionCodeWidget completionCode={game.completionCode} requireConfirmation={false} />}
            </div>
        );
    }
}
