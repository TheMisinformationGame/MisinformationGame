import {
    Source,
    Study,
    StudyAdvancedSettings,
    StudyBasicSettings, StudyPagesSettings,
    StudyUserInterfaceSettings
} from "./study"
import {
    areCellsBlank,
    ExcelBoolean,
    ExcelImage, ExcelLimit,
    ExcelNumber, ExcelPercentage,
    ExcelString, isCellBlank,
    readCell, readCellWithDefault,
    WorkbookColumn,
    WorkbookLoc
} from "../utils/excel";
import {TruncatedNormalDistribution} from "./math";
import {StudyImage} from "./images";
import {V1, readV1SourcePostSelectionMethod, readV1Posts} from "./studyExcelReaderV1";


/**
 * The location of all study parameter cells for version-2 studies.
 */
export const V2 = {
    pages: V1.pages,
    post: V1.post,

    general: {
        basic: {
            name: new WorkbookLoc("Name", "General", "D4", ExcelString),
            description: new WorkbookLoc("Description", "General", "D5", ExcelString),
            prompt: new WorkbookLoc("Prompt", "General", "D6", ExcelString),
            length: new WorkbookLoc("Length of Game", "General", "D7", ExcelNumber),
            requireReactions: new WorkbookLoc("Require Reactions", "General", "D8", ExcelBoolean),
            requireComments: new WorkbookLoc("Require Comments", "General", "D9", ExcelString),
            requireIdentification: new WorkbookLoc("Require Participant Identification", "General", "D10", ExcelBoolean)
        },

        userInterface: {
            displayPostsInFeed: new WorkbookLoc("Display Posts in a Feed", "General", "D14", ExcelBoolean),
            displayFollowers: new WorkbookLoc("Display Followers", "General", "D15", ExcelBoolean),
            displayCredibility: new WorkbookLoc("Display Credibility", "General", "D16", ExcelBoolean),
            displayProgress: new WorkbookLoc("Display Progress", "General", "D17", ExcelBoolean),
            displayNumberOfReactions: new WorkbookLoc("Display Number of Reactions", "General", "D18", ExcelBoolean),
            allowMultipleReactions: new WorkbookLoc("Allow Multiple Reactions at Once", "General", "D19", ExcelBoolean),

            postEnabledReactions: {
                like: new WorkbookLoc("Post Likes Enabled", "General", "D20", ExcelBoolean),
                dislike: new WorkbookLoc("Post Dislikes Enabled", "General", "D21", ExcelBoolean),
                share: new WorkbookLoc("Post Shares Enabled", "General", "D22", ExcelBoolean),
                flag: new WorkbookLoc("Post Flags Enabled", "General", "D23", ExcelBoolean),
                skip: new WorkbookLoc("Post Skip Enabled", "General", "D24", ExcelBoolean),
            },

            commentEnabledReactions: {
                like: new WorkbookLoc("Comment Likes Enabled", "General", "D25", ExcelBoolean),
                dislike: new WorkbookLoc("Comment Dislikes Enabled", "General", "D26", ExcelBoolean),
            }
        },

        advanced: {
            minimumCommentLength: new WorkbookLoc("Minimum Comment Length", "General", "D30", ExcelNumber),
            promptDelaySeconds: new WorkbookLoc("Prompt Continue Delay (Seconds)", "General", "D31", ExcelNumber),
            reactDelaySeconds: new WorkbookLoc("Reaction Delay (Seconds)", "General", "D32", ExcelNumber),
            genCompletionCode: new WorkbookLoc("Generate Completion Code", "General", "D33", ExcelBoolean),
            completionCodeDigits: new WorkbookLoc("Completion Code Digits", "General", "D34", ExcelNumber),
            genRandDefaultAvatars: new WorkbookLoc("Generate Random Default Avatars", "General", "D35", ExcelBoolean),
        }
    },

    source: {
        firstRow: 19,
        lastRow: 1002,
        worksheet: "Sources",
        valueColumns: "DEFGHIJ",
        id: new WorkbookColumn("ID", "Sources", "C", ExcelString),
        name: new WorkbookColumn("Name", "Sources", "D", ExcelString),
        avatar: new WorkbookColumn("Avatar", "Sources", "E", ExcelImage),
        maxPosts: new WorkbookColumn("Max Posts", "Sources", "F", ExcelLimit),
        followers: new WorkbookColumn("Initial Followers", "Sources", "G", ExcelNumber),
        credibility: new WorkbookColumn("Initial Credibility", "Sources", "H", ExcelNumber),
        truePostPercentage: new WorkbookColumn("True Post Percentage", "Sources", "I", ExcelPercentage),
        defaults: {
            maxPosts: new WorkbookLoc("Max Posts", "Sources", "C16", ExcelLimit),
            followers: {
                mean: new WorkbookLoc(
                    "Default Initial Followers Mean", "Sources", "D16", ExcelNumber),
                stdDev: new WorkbookLoc(
                    "Default Initial Followers Std. Deviation", "Sources", "E16", ExcelNumber),
                skewShape: new WorkbookLoc(
                    "Default Initial Followers Skew Shape", "Sources", "F16", ExcelNumber)
            },
            credibility: {
                mean: new WorkbookLoc(
                    "Default Initial Credibility Mean", "Sources", "G16", ExcelNumber),
                stdDev: new WorkbookLoc(
                    "Default Initial Credibility Std. Deviation", "Sources", "H16", ExcelNumber),
                skewShape: new WorkbookLoc(
                    "Default Initial Followers Skew Shape", "Sources", "I16", ExcelNumber)
            }
        }
    }
}

function readV2FollowersDistribution(workbook, row, defaults) {
    let mean, stdDev, skewShape;
    if (isCellBlank(workbook, V2.source.followers.row(row))) {
        mean = defaults.followersMean;
        stdDev = defaults.followersStdDev;
        skewShape = defaults.followersSkewShape;
    } else {
        mean = readCell(workbook, V2.source.followers.row(row));
        stdDev = 0;
        skewShape = 0;
    }

    // Followers can fall anywhere within 3 standard deviations
    // of the mean. This helps us to avoid extreme values.
    return new TruncatedNormalDistribution(
        mean, stdDev, skewShape,
        Math.max(0, mean - 3 * stdDev),
        Math.max(0, mean + 3 * stdDev)
    );
}

function readV2CredibilityDistribution(workbook, row, defaults) {
    let mean, stdDev, skewShape;
    if (isCellBlank(workbook, V2.source.credibility.row(row))) {
        mean = defaults.credibilityMean;
        stdDev = defaults.credibilityStdDev;
        skewShape = defaults.credibilitySkewShape;
    } else {
        mean = readCell(workbook, V2.source.credibility.row(row));
        stdDev = 0;
        skewShape = 0;
    }

    // Credibility can fall anywhere from 0 to 100.
    return new TruncatedNormalDistribution(mean, stdDev, skewShape, 0, 100);
}

/**
 * Returns a Promise to a list of sources read from the workbook.
 */
function readV2Sources(workbook, study) {
    const sources = [];
    const defaults = {
        maxPosts: readCell(workbook, V2.source.defaults.maxPosts),
        followersMean: readCell(workbook, V2.source.defaults.followers.mean),
        followersStdDev: readCell(workbook, V2.source.defaults.followers.stdDev),
        followersSkewShape: readCell(workbook, V2.source.defaults.followers.skewShape),
        credibilityMean: readCell(workbook, V2.source.defaults.credibility.mean),
        credibilityStdDev: readCell(workbook, V2.source.defaults.credibility.stdDev),
        credibilitySkewShape: readCell(workbook, V2.source.defaults.credibility.skewShape)
    };
    for (let row = V2.source.firstRow; row <= V2.source.lastRow; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, V2.source.worksheet, V2.source.valueColumns, [row]))
            continue;

        const sourceID = readCell(workbook, V2.source.id.row(row));
        const followers = readV2FollowersDistribution(workbook, row, defaults);
        const credibility = readV2CredibilityDistribution(workbook, row, defaults);

        // Read and convert the avatar image to our own format.
        const avatarValue = readCellWithDefault(workbook, V2.source.avatar.row(row), null);
        let avatarPromise;
        if (avatarValue) {
            avatarPromise = StudyImage.fromExcelImage(readCell(workbook, V2.source.avatar.row(row)));
        } else {
            avatarPromise = Promise.resolve(null);
        }

        // If using the Source-Ratios selection method, then read the true-post percentage for each source.
        let truePostPercentage = -1;
        if (study.sourcePostSelectionMethod.type === "Source-Ratios") {
            truePostPercentage = readCellWithDefault(workbook, V2.source.truePostPercentage.row(row), 0.5);
        }

        sources.push(
            avatarPromise.then((avatar) => {
                return new Source(
                    sourceID,
                    readCell(workbook, V2.source.name.row(row)),
                    avatar,
                    Source.randomStyle(),
                    readCellWithDefault(workbook, V2.source.maxPosts.row(row), defaults.maxPosts),
                    followers, credibility,
                    truePostPercentage
                );
            })
        );
    }
    return Promise.all(sources);
}

function readV2StudyBasicSettings(workbook, displayPostsInFeed) {
    let requireReactions = false,
        requireComments = readCell(workbook, V2.general.basic.requireComments);

    // Some settings are incompatible with the feed style.
    if (displayPostsInFeed) {
        if (requireComments.toLowerCase() === "required") {
            requireComments = "optional";
        }
    } else {
        requireReactions = readCell(workbook, V2.general.basic.requireReactions);
    }

    return StudyBasicSettings.createV2(
        readCell(workbook, V2.general.basic.name),
        readCell(workbook, V2.general.basic.description),
        readCell(workbook, V2.general.basic.prompt),
        readCell(workbook, V2.general.basic.length),
        requireReactions,
        requireComments,
        readCell(workbook, V2.general.basic.requireIdentification),
    );
}

function readV2StudyUserInterfaceSettings(workbook, displayPostsInFeed) {
    return StudyUserInterfaceSettings.createV2(
        displayPostsInFeed,
        readCell(workbook, V2.general.userInterface.displayFollowers),
        readCell(workbook, V2.general.userInterface.displayCredibility),
        readCell(workbook, V2.general.userInterface.displayProgress),
        readCell(workbook, V2.general.userInterface.displayNumberOfReactions),
        readCell(workbook, V2.general.userInterface.allowMultipleReactions),
        { // postEnabledReactions
            "like": readCell(workbook, V2.general.userInterface.postEnabledReactions.like),
            "dislike": readCell(workbook, V2.general.userInterface.postEnabledReactions.dislike),
            "share": readCell(workbook, V2.general.userInterface.postEnabledReactions.share),
            "flag": readCell(workbook, V2.general.userInterface.postEnabledReactions.flag),
            "skip": readCell(workbook, V2.general.userInterface.postEnabledReactions.skip)
        },
        { // commentEnabledReactions
            "like": readCell(workbook, V2.general.userInterface.commentEnabledReactions.like),
            "dislike": readCell(workbook, V2.general.userInterface.commentEnabledReactions.dislike),
        },
    );
}

function readV2StudyAdvancedSettings(workbook, basicSettings) {
    const commentsEnabled = (basicSettings.requireComments !== "disabled"),
          genCompletionCode = readCell(workbook, V2.general.advanced.genCompletionCode);

    return StudyAdvancedSettings.createV2(
        (commentsEnabled ? readCell(workbook, V2.general.advanced.minimumCommentLength) : 0),
        readCell(workbook, V2.general.advanced.promptDelaySeconds),
        readCell(workbook, V2.general.advanced.reactDelaySeconds),
        genCompletionCode,
        (genCompletionCode ? readCellWithDefault(workbook, V2.general.advanced.completionCodeDigits, 4) : 0),
        readCellWithDefault(workbook, V2.general.advanced.genRandDefaultAvatars, true),
    );
}

function readV2StudyPagesSettings(workbook) {
    return StudyPagesSettings.createV2(
        readCellWithDefault(workbook, V2.pages.preIntro, ""),
        readCellWithDefault(workbook, V2.pages.preIntroDelaySeconds, 0),
        readCellWithDefault(workbook, V2.pages.rules, ""),
        readCellWithDefault(workbook, V2.pages.rulesDelaySeconds, 0),
        readCellWithDefault(workbook, V2.pages.postIntro, ""),
        readCellWithDefault(workbook, V2.pages.postIntroDelaySeconds, 0),
        readCell(workbook, V2.pages.debrief)
    );
}

/**
 * Returns a Promise of a version-2 Study object for the study
 * configured in the spreadsheet {@param workbook}.
 */
export function readV2Study(workbook) {
    // First, read the basic settings of the spreadsheet.
    const displayPostsInFeed = readCell(workbook, V2.general.userInterface.displayPostsInFeed);
    const basicSettings = readV2StudyBasicSettings(workbook, displayPostsInFeed),
          uiSettings = readV2StudyUserInterfaceSettings(workbook, displayPostsInFeed),
          advancedSettings = readV2StudyAdvancedSettings(workbook, basicSettings),
          pagesSettings = readV2StudyPagesSettings(workbook);

    const study = new Study(
        "unknown", // id
        "unknown", // authorID
        "unknown", // authorName
        -1, // lastModifiedTime
        false, // enabled

        basicSettings,
        uiSettings,
        advancedSettings,
        pagesSettings,

        readV1SourcePostSelectionMethod(workbook, basicSettings.length),
        [], // Sources
        [], // Posts
    );

    // We must then read the sources and posts using Promises
    // due to the way that the image loading works.
    const sourcesPromise = readV2Sources(workbook, study);
    const postsPromise = readV1Posts(workbook, study);
    return Promise.all([sourcesPromise, postsPromise]).then((sourcesAndPosts) => {
        study.sources = sourcesAndPosts[0];
        study.posts = sourcesAndPosts[1];
        study.updateLastModifiedTime();
        return study;
    });
}
