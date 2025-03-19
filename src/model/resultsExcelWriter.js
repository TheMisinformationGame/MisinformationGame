import FileSaver from 'file-saver';
import {readAllCompletedStudyResults} from "../database/getFromDB";
import {createDateFromUnixEpochTimeSeconds, formatUTCDate} from "../utils/time";
import * as he from "he";

const excel = require("exceljs");


/**
 * Makes the header row bold.
 */
function styleWorksheetHeader(worksheet) {
    for (let index = 0; index < worksheet.columns.length; ++index) {
        const columnLetters = worksheet.getColumn(index + 1).letter;
        const cell = worksheet.getCell(columnLetters + "1");
        cell.font = {
            name: "Arial",
            family: 2,
            size: 12,
            bold: true
        };
    }
}

/**
 * Sets the columns of {@param worksheet} to the columns
 * specified in {@param columnSpecs}. Rows can be disabled
 * by setting "enabled" to false for that row.
 */
function setWorksheetColumns(worksheet, columnSpecs) {
    const columns = [];
    for (let index = 0; index < columnSpecs.length; ++index) {
        const spec = columnSpecs[index];

        // If the include key is missing or true, then include this row.
        if (spec["enabled"] !== undefined) {
            if (!spec["enabled"])
                continue;
            delete spec["enabled"];
        }

        columns.push(spec);
    }
    worksheet.columns = columns;
}

/**
 * Converts the given number value into a value to be
 * written into the result spreadsheet. If the value
 * is NaN, it is written as an empty cell.
 */
function numToCellValue(value) {
    if (isNaN(value))
        return "";
    return value;
}

/**
 * Creates the workbook to store the results into.
 */
function constructWorkbook(study, results, problems) {
    const showFollowers = study.uiSettings.displayFollowers;
    const showCredibility = study.uiSettings.displayCredibility;
    const showPostLikes = study.uiSettings.postEnabledReactions.like;
    const showPostDislikes = study.uiSettings.postEnabledReactions.dislike;
    const showPostShares = study.uiSettings.postEnabledReactions.share;
    const showPostFlags = study.uiSettings.postEnabledReactions.flag;
    const showCommentLikes = study.uiSettings.commentEnabledReactions.like;
    const showCommentDislikes = study.uiSettings.commentEnabledReactions.dislike;

    const workbook = new excel.Workbook();

    // Write the metadata about the study.
    const coverWorksheet = workbook.addWorksheet("Overview");
    coverWorksheet.columns = [
        {header : "Study ID", key : "studyId", width: 24},
        {header : "Study Name", key : "studyName", width: 32},
        {header : "Participants", key : "participants", width: 18},
        {header : "Results Download Time (UTC)", key : "date", width: 34}
    ];
    coverWorksheet.addRow({
        studyId: study.id,
        studyName: study.basicSettings.name,
        participants: results.length + Object.keys(problems).length,
        date: formatUTCDate(new Date())
    });
    coverWorksheet.getCell("C2").alignment = {vertical: "top", horizontal: "left"};
    styleWorksheetHeader(coverWorksheet);

    // We store all post reactions into one worksheet.
    let containsAnyPosts = false;
    const postsWorksheet = workbook.addWorksheet("Posts");
    setWorksheetColumns(postsWorksheet, [
        {header: "Session ID", key: "sessionID", width: 24},
        {header: "Participant ID", key: "participantID", width: 24},
        {header: "Post Order", key: "postOrder", width: 16},
        {header: "Post ID", key: "postID", width: 12},

        {header: "Source ID", key: "sourceID", width: 14},
        {header: "Source Credibility", key: "sourceCredibility", width: 22, enabled: showCredibility},
        {header: "Source Followers", key: "sourceFollowers", width: 22, enabled: showFollowers},

        {header: "Post Headline", key: "postHeadline", width: 32},
        {header: "Post Likes", key: "postLikes", width: 20, enabled: showPostLikes},
        {header: "Post Dislikes", key: "postDislikes", width: 20, enabled: showPostDislikes},
        {header: "Post Shares", key: "postShares", width: 20, enabled: showPostShares},
        {header: "Post Flags", key: "postFlags", width: 20, enabled: showPostFlags},

        {header: "Liked Post", key: "likedPost", width: 20, enabled: showPostLikes},
        {header: "Disliked Post", key: "dislikedPost", width: 20, enabled: showPostDislikes},
        {header: "Shared Post", key: "sharedPost", width: 20, enabled: showPostShares},
        {header: "Flagged Post", key: "flaggedPost", width: 20, enabled: showPostFlags},
        {header: "Skipped Post", key: "skippedPost", width: 20},
        {header: "User Comment", key: "comment", width: 20, enabled: study.areUserCommentsEnabled()},

        {header: "Dwell Time (MS)", key: "dwellTime", width: 22},
        {header: "First Time to Interact (MS)", key: "firstInteractTime", width: 32},
        {header: "Last Time to Interact (MS)", key: "lastInteractTime", width: 32},

        {header: "Credibility Change", key: "credibilityChange", width: 22, enabled: showCredibility},
        {header: "Follower Change", key: "followerChange", width: 22, enabled: showFollowers},

        {header: "Credibility Before", key: "beforeCredibility", width: 22, enabled: showCredibility},
        {header: "Followers Before", key: "beforeFollowers", width: 22, enabled: showFollowers},
        {header: "Credibility After", key: "afterCredibility", width: 22, enabled: showCredibility},
        {header: "Followers After", key: "afterFollowers", width: 22, enabled: showFollowers},
    ]);
    for(let index = 0; index < results.length; index++) {
        const game = results[index];
        const participant = game.participant;

        for (let stateIndex = 0; stateIndex < game.states.length; stateIndex++) {
            const state = game.states[stateIndex];
            const likes = state.currentPost.numberOfReactions.like;
            const dislikes = state.currentPost.numberOfReactions.dislike;
            const shares = state.currentPost.numberOfReactions.share;
            const flags = state.currentPost.numberOfReactions.flag;
            const interaction = participant.postInteractions.get(stateIndex);
            const beforeCredibility = Math.round(participant.credibilityHistory[stateIndex]);
            const afterCredibility = Math.round(participant.credibilityHistory[stateIndex + 1]);
            const beforeFollowers = Math.round(participant.followerHistory[stateIndex]);
            const afterFollowers = Math.round(participant.followerHistory[stateIndex + 1]);
            postsWorksheet.addRow({
                sessionID: game.sessionID,
                participantID: participant.participantID || "",
                postOrder: stateIndex + 1,
                postID: state.currentPost.post.id,

                sourceID: state.currentSource.source.id,
                sourceFollowers: Math.round(state.currentSource.followers),
                sourceCredibility: Math.round(state.currentSource.credibility),

                postHeadline: state.currentPost.post.headline || "",
                postLikes: (likes === undefined ? "" : likes),
                postDislikes: (dislikes === undefined ? "" : dislikes),
                postShares: (shares === undefined ? "" : shares),
                postFlags: (flags === undefined ? "" : flags),

                likedPost: interaction.hasPostReaction("like"),
                dislikedPost: interaction.hasPostReaction("dislike"),
                sharedPost: interaction.hasPostReaction("share"),
                flaggedPost: interaction.hasPostReaction("flag"),
                skippedPost: interaction.hasPostReaction("skip"),
                comment: he.decode(interaction.comment || ""),

                dwellTime: numToCellValue(interaction.timer.getDwellTimeMS()),
                firstInteractTime: numToCellValue(interaction.timer.getTimeToFirstInteractMS()),
                lastInteractTime: numToCellValue(interaction.timer.getTimeToLastInteractMS()),

                credibilityChange: afterCredibility - beforeCredibility,
                followerChange: afterFollowers - beforeFollowers,

                beforeCredibility: beforeCredibility,
                beforeFollowers: beforeFollowers,
                afterCredibility: afterCredibility,
                afterFollowers: afterFollowers,
            });
            containsAnyPosts = true;
        }
    }
    styleWorksheetHeader(postsWorksheet);
    if (!containsAnyPosts) {
        workbook.removeWorksheet(postsWorksheet.name);
    }


    // We store comment reactions in another worksheet
    let containsAnyComments = false;
    const commentsWorksheet = workbook.addWorksheet("Comments");
    setWorksheetColumns(commentsWorksheet, [
        {header: "Session ID", key: "sessionID", width: 24},
        {header: "Participant ID", key: "participantID", width: 24},
        {header: "Post Order", key: "postOrder", width: 16},
        {header: "Post ID", key: "postID", width: 12},

        {header: "Comment Order", key:"commentOrder", width: 20},
        {header: "Comment Text", key: "commentContent", width: 32},
        {header: "Comment Likes", key: "commentLikes", width: 24, enabled: showCommentLikes},
        {header: "Comment Dislikes", key: "commentDislikes", width: 24, enabled: showCommentDislikes},

        {header: "Liked Comment", key: "likedComment", width: 20, enabled: showCommentLikes},
        {header: "Disliked Comment", key: "dislikedComment", width: 20, enabled: showCommentDislikes},

        {header: "First Time to Interact (MS)", key: "firstInteractTime", width: 32},
        {header: "Last Time to Interact (MS)", key: "lastInteractTime", width: 32},
    ]);
    for (let index = 0 ; index < results.length; index++){
        const game = results[index];
        const participant = game.participant;

        for (let stateIndex = 0 ; stateIndex < game.states.length; ++stateIndex) {
            const state = game.states[stateIndex];
            const interaction = participant.postInteractions.get(stateIndex);

            for (let commentIndex = 0; commentIndex < state.currentPost.comments.length; ++commentIndex) {
                const comment = state.currentPost.comments[commentIndex];
                const likes = comment.numberOfReactions.like;
                const dislikes = comment.numberOfReactions.dislike;
                const cInter = interaction.findCommentReaction(commentIndex);
                commentsWorksheet.addRow({
                    sessionID: game.sessionID,
                    participantID: participant.participantID || "",
                    postOrder: stateIndex + 1,
                    postID: state.currentPost.post.id,

                    commentOrder: (comment.comment.index + 1),
                    commentContent: he.decode(comment.comment.message),
                    commentLikes: (likes === undefined ? "" : likes),
                    commentDislikes: (dislikes === undefined ? "" : dislikes),

                    likedComment: cInter !== null && cInter.hasReaction("like"),
                    dislikedComment: cInter !== null && cInter.hasReaction("dislike"),

                    firstInteractTime: (cInter !== null ? numToCellValue(cInter.timer.getTimeToFirstInteractMS()) : ""),
                    lastInteractTime: (cInter !== null ? numToCellValue(cInter.timer.getTimeToLastInteractMS()) : "")
                });
                containsAnyComments = true;
            }
        }
    }
    styleWorksheetHeader(commentsWorksheet);
    if (!containsAnyComments) {
        workbook.removeWorksheet(commentsWorksheet.name);
    }


    // We store participant metadata in another sheet.
    const participantWorksheet = workbook.addWorksheet("Participants");
    setWorksheetColumns(participantWorksheet, [
        {header: "Session ID", key: "sessionID", width: 24},
        {header: "Participant ID", key: "participantID", width: 24},
        {header: "Completion Code", key: "completionCode", width: 24, enabled: study.advancedSettings.genCompletionCode},
        {header: "Duration (Seconds)", key: "gameDuration", width: 24},
        {header: "Game Start Time (UTC)", key: "gameStartTime", width: 30},
        {header: "Game Finish Time (UTC)", key: "gameEndTime", width: 30},
        {header: "Study Modification Time (UTC)", key: "studyModTime", width: 36},
    ]);
    for(let index = 0; index < results.length; index++) {
        const game = results[index];
        const duration = game.endTime - game.startTime;
        const startTime = createDateFromUnixEpochTimeSeconds(game.startTime);
        const endTime = createDateFromUnixEpochTimeSeconds(game.endTime);
        const studyModTime = createDateFromUnixEpochTimeSeconds(game.studyModTime);
        participantWorksheet.addRow({
            participantID: game.participant.participantID,
            sessionID: game.sessionID,
            completionCode: game.completionCode || "",
            gameDuration: duration,
            gameStartTime: formatUTCDate(startTime),
            gameEndTime: formatUTCDate(endTime),
            studyModTime: formatUTCDate(studyModTime)
        });
    }
    styleWorksheetHeader(participantWorksheet);


    // If there were problems loading any results, report them.
    if (Object.keys(problems).length > 0) {
        const problemsWorksheet = workbook.addWorksheet("Problems");
        problemsWorksheet.columns = [
            {header: "Session ID", key: "sessionID", width: 24},
            {header: "Participant ID", key: "participantID", width: 24},
            {header: "Error", key: "error", width: 48},
        ];
        for (let sessionID in problems) {
            if (!problems.hasOwnProperty(sessionID))
                continue;

            const problem = problems[sessionID];
            problemsWorksheet.addRow({
                sessionID: sessionID,
                participantID: problem.participantID || "",
                error: problem.error
            });
        }
        styleWorksheetHeader(problemsWorksheet);
    }
    return workbook;
}

/**
 * Downloads the results of the study {@param study}
 * into a results spreadsheet.
 */
export async function downloadResults(study) {
    const problems = {};
    const results = await readAllCompletedStudyResults(study, problems);
    const workbook = constructWorkbook(study, results, problems);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });

    // Remove characters that could potentially interfere with user's file systems.
    const safeStudyName = study.basicSettings.name.replace(/[^a-z0-9]/gi, '_');
    FileSaver.saveAs(blob, "results--" + safeStudyName + ".xlsx");
    return problems;
}

