import React from "react";
import {ParticipantProgress} from "./ParticipantProgress";
import {GameIntroductionScreen, replaceHTMLPlaceholder} from "./GameIntroduction";
import {ExampleCommentEntryBox} from "./CommentEntry";
import {DislikeIcon, LikeIcon, ShareIcon, FlagIcon} from "../../components/ReactionIcons";


/**
 * Generates a placeholder to list the available post or comment reactions.
 */
function generateReactionsPlaceholder(nounSubject, pluralSubject, isReactionEnabled) {
    const buttons = [];
    if (isReactionEnabled("like")) {
        buttons.push(<LikeIcon key="like" />);
    }
    if (isReactionEnabled("dislike")) {
        buttons.push(<DislikeIcon key="dislike" />);
    }
    if (isReactionEnabled("share")) {
        buttons.push(<ShareIcon key="share" />);
    }
    if (isReactionEnabled("flag")) {
        buttons.push(<FlagIcon key="flag" />);
    }

    let content;
    if (buttons.length > 0) {
        content = (<>
            <div className="inline-block">
                {buttons}
            </div>
            {isReactionEnabled("skip") &&
                <span className="inline-block ml-8 text-gray-700" style={{marginTop: "0.1rem"}} key="skip">
                    Skip {nounSubject}
                </span>}
        </>);
    } else {
        content = (<span className="italic">
            There are no enabled reactions for {pluralSubject}
        </span>);
    }
    return (
        <div className="inline-block w-full mb-2">
            <div className="inline-block pr-2 pl-3 py-1 mt-4
                                    rounded-md shadow border border-gray-400">
                {content}
            </div>
        </div>
    );
}


/**
 * The page that is shown to explain the rules of the game to participants.
 */
export class GameRules extends GameIntroductionScreen {
    getContent(study) {
        let rulesHTML = study.pagesSettings.rules;

        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{LIKE}}", () => <LikeIcon key="like" />).content;
        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{DISLIKE}}", () => <DislikeIcon key="dislike" />).content;
        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{SHARE}}", () => <ShareIcon key="share" />).content;
        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{FLAG}}", () => <FlagIcon key="flag" />).content;

        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{ENABLED-POST-REACTIONS}}", () => {
            return generateReactionsPlaceholder(
                "Post", "posts", reaction => study.isPostReactionEnabled(reaction)
            );
        }).content;

        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{ENABLED-COMMENT-REACTIONS}}", () => {
            return generateReactionsPlaceholder(
                "Comment", "comments", reaction => study.isCommentReactionEnabled(reaction)
            );
        }).content;

        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{COMMENT-ENTRY-EXAMPLE}}", () => {
            return <ExampleCommentEntryBox />;
        }).content;

        rulesHTML = replaceHTMLPlaceholder(rulesHTML, "{{YOUR-PROGRESS-EXAMPLE}}", () => {
            return <div className="inline-block w-full mb-2">
                <ParticipantProgress
                    displayFollowers={study.uiSettings.displayFollowers}
                    displayCredibility={study.uiSettings.displayCredibility}
                    displayProgress = {study.uiSettings.displayProgress}
                    overrideFollowers={13}
                    overrideCredibility={56}
                    hideTooltip={true}
                    nextPostText="Continue to Next Post"
                    onNextPost={() => {}}
                    nextPostEnabled={false}
                    progressPercentage = {0} />
            </div>;
        }).content;

        return rulesHTML;
    }

    getTarget(study) {
        return "/study/" + study.id + "/post-intro";
    }

    getContinueDelaySeconds(study) {
        return study.pagesSettings.rulesDelaySeconds;
    }
}
