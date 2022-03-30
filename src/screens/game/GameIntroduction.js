import {ContinueBanner} from "../../components/ContinueButton";
import {ActiveGameScreen} from "./ActiveGameScreen";
import {Redirect} from "react-router-dom";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";


/**
 * Replaces all occurrences of the placeholder {@param placeholder}
 * in {@param rulesHTML} with the DOM element returned
 * from {@param domGeneratorFn} if {@param max} is not set. If
 * {@param max} is set, then only up to the first {@param max}
 * occurrences will be replaced.
 */
export function replaceHTMLPlaceholder(rulesHTML, placeholder, domGeneratorFn, max) {
    max = max || 0;

    let placeholderHTML = null;
    let occurrences = 0;
    while ((max <= 0 || occurrences < max) && rulesHTML.includes(placeholder)) {
        if (placeholderHTML === null) {
            placeholderHTML = renderToStaticMarkup(domGeneratorFn());
        }
        rulesHTML = rulesHTML.replace(placeholder, placeholderHTML)
        occurrences += 1;
    }

    return {
        content: rulesHTML,
        occurrences: occurrences
    };
}


export class GameIntroductionScreen extends ActiveGameScreen {
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
        const stage = game.getCurrentStage();
        if (stage === "identification")
            return (<Redirect to={"/study/" + study.id + "/id" + window.location.search} />);
        if (stage === "debrief")
            return (<Redirect to={"/study/" + study.id + "/debrief" + window.location.search} />);

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
                <div className="m-1 bg-white p-10 max-w-4xl ml-auto mr-auto">
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
        return "/study/" + study.id + "/rules";
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
        return "/study/" + study.id + "/feed";
    }

    getContinueDelaySeconds(study) {
        return study.postIntroDelaySeconds;
    }
}
