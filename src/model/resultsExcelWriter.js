import FileSaver from 'file-saver';
import {readAllCompletedStudyResults} from "../database/getFromDB";
import {createDateFromUnixEpochTimeSeconds, formatUTCDate} from "../utils/time";

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
 * Creates the workbook to store the results into.
 */
function constructWorkbook(study, results, problems) {
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
        studyName: study.name,
        participants: results.length + Object.keys(problems).length,
        date: formatUTCDate(new Date())
    });
    coverWorksheet.getCell("C2").alignment = {vertical: "top", horizontal: "left"};
    styleWorksheetHeader(coverWorksheet);

    // We store all participant reactions into one results worksheet.
    const resultsWorksheet = workbook.addWorksheet("Results");
    resultsWorksheet.columns = [
        {header: "Session ID", key: "sessionID", width: 24},
        {header: "Participant ID", key: "participantID", width: 24},
        {header: "Post Order", key: "postOrder", width: 16},
        {header: "Post ID", key: "postID", width: 12},
        {header: "Source ID", key: "sourceID", width: 14},
        {header: "Source Followers", key: "sourceFollowers", width: 22},
        {header: "Source Credibility", key: "sourceCredibility", width: 22},
        {header: "Before Participant Credibility", key: "beforeCredibility", width: 36},
        {header: "Before Participant Followers", key: "beforeFollowers", width: 36},
        {header: "After Participant Credibility", key: "afterCredibility", width: 36},
        {header: "After Participant Followers", key: "afterFollowers", width: 36},
        {header: "Reaction", key: "reaction", width: 12},
        {header: "First Time to Interact (MS)", key: "firstInteractTime", width: 32},
        {header: "Last Time to Interact (MS)", key: "lastInteractTime", width: 32},
        {header: "Credibility Change", key: "credibilityChange", width: 22},
        {header: "Follower Change", key: "followerChange", width: 22}
    ];
    for(let index = 0; index < results.length; index++) {
        const game = results[index];
        const participant = game.participant;

        for (let stateIndex = 0; stateIndex < game.states.length; stateIndex++) {
            const state = game.states[stateIndex];
            const beforeCredibility = Math.round(participant.credibilityHistory[stateIndex]);
            const afterCredibility = Math.round(participant.credibilityHistory[stateIndex + 1]);
            const beforeFollowers = Math.round(participant.followerHistory[stateIndex]);
            const afterFollowers = Math.round(participant.followerHistory[stateIndex + 1]);
            resultsWorksheet.addRow({
                sessionID: game.sessionID,
                participantID: participant.participantID || "",
                postOrder: stateIndex + 1,
                postID: state.currentPost.post.id,
                sourceID: state.currentSource.source.id,
                sourceFollowers: Math.round(state.currentSource.followers),
                sourceCredibility: Math.round(state.currentSource.credibility),
                beforeCredibility: beforeCredibility,
                beforeFollowers: beforeFollowers,
                afterCredibility: afterCredibility,
                afterFollowers: afterFollowers,
                reaction: participant.reactions[stateIndex],
                firstInteractTime: participant.firstInteractTimesMS[stateIndex],
                lastInteractTime: participant.lastInteractTimesMS[stateIndex],
                credibilityChange: afterCredibility - beforeCredibility,
                followerChange: afterFollowers - beforeFollowers
            });
        }
    }
    styleWorksheetHeader(resultsWorksheet);

    // We store participant metadata in another sheet.
    const participantWorksheet = workbook.addWorksheet("Participants");
    participantWorksheet.columns = [
        {header: "Session ID", key: "sessionID", width: 24},
        {header: "Participant ID", key: "participantID", width: 24},
        {header: "Completion Code", key: "completionCode", width: 24},
        {header: "Game Start Time (UTC)", key: "gameStartTime", width: 30},
        {header: "Game Finish Time (UTC)", key: "gameEndTime", width: 30},
        {header: "Study Modification Time (UTC)", key: "studyModTime", width: 36},
    ];
    for(let index = 0; index < results.length; index++) {
        const game = results[index];
        const startTime = createDateFromUnixEpochTimeSeconds(game.startTime);
        const endTime = createDateFromUnixEpochTimeSeconds(game.endTime);
        const studyModTime = createDateFromUnixEpochTimeSeconds(game.study.lastModifiedTime);
        participantWorksheet.addRow({
            participantID: game.participant.participantID,
            sessionID: game.sessionID,
            completionCode: game.completionCode || "",
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
    const results = await readAllCompletedStudyResults(study.id, problems);
    const workbook = constructWorkbook(study, results, problems);

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });
    FileSaver.saveAs(blob, "results.xlsx");
    return problems;
}

