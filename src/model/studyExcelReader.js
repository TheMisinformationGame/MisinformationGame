import {Post, PostComment, ReactionValues, Source, Study} from "./study"
import {
    areCellsBlank,
    ExcelBoolean,
    ExcelImage, ExcelLimit,
    ExcelNumber, ExcelPercentage,
    ExcelString, ExcelTextOrImage, isCellBlank,
    readCell, readCellWithDefault,
    WorkbookColumn,
    WorkbookLoc
} from "../utils/excel";
import {
    CredibilitySelectionMethod,
    OverallRatioSelectionMethod,
    PredefinedSelectionMethod,
    SourceRatioSelectionMethod
} from "./selectionMethod";
import {LinearFunction, TruncatedNormalDistribution} from "./math";
import {StudyImage} from "./images";
import {doNonNullCheck, doTypeCheck} from "../utils/types";


const versionCell = new WorkbookLoc("Version", "About", "M2", ExcelNumber);

function generateV1ChangeDistDefaultsSpec(isTrue, firstRow, col, quantity, reactionPlural) {
    const truthSuffix = " (" + (isTrue ? "True" : "False") + " Posts)";
    return {
        mean: new WorkbookLoc(
            "Default " + quantity + " Change Mean from " + reactionPlural + truthSuffix,
            "Posts", col + firstRow, ExcelNumber
        ),
        stdDev: new WorkbookLoc(
            "Default " + quantity + " Change Std. Deviation from " + reactionPlural + truthSuffix,
            "Posts", col + (firstRow + 1), ExcelNumber
        ),
    };
}
function generateV1ChangesAfterPostDefaultsSpec(isTrue, firstRow, firstCol, quantity) {
    const likeCol = firstCol;
    const dislikeCol = String.fromCharCode(firstCol.charCodeAt(0) + 1);
    const shareCol = String.fromCharCode(firstCol.charCodeAt(0) + 2);
    const flagCol = String.fromCharCode(firstCol.charCodeAt(0) + 3);
    return {
        like: generateV1ChangeDistDefaultsSpec(isTrue, firstRow, likeCol, quantity, "Likes"),
        dislike: generateV1ChangeDistDefaultsSpec(isTrue, firstRow, dislikeCol, quantity, "Dislikes"),
        share: generateV1ChangeDistDefaultsSpec(isTrue, firstRow, shareCol, quantity, "Shares"),
        flag: generateV1ChangeDistDefaultsSpec(isTrue, firstRow, flagCol, quantity, "Flags")
    };
}
function generateV1PostDefaultsSpec(isTrue, firstRow) {
    return {
        changesToFollowers: generateV1ChangesAfterPostDefaultsSpec(isTrue, firstRow, "C", "Followers"),
        changesToCredibility: generateV1ChangesAfterPostDefaultsSpec(isTrue, firstRow, "G", "Credibility")
    };
}
const V1 = {
    name: new WorkbookLoc("Name", "General", "D4", ExcelString),
    description: new WorkbookLoc("Description", "General", "D5", ExcelString),
    introduction: new WorkbookLoc("Introduction", "General", "D6", ExcelString),
    prompt: new WorkbookLoc("Prompt", "General", "D7", ExcelString),
    length: new WorkbookLoc("Length", "General", "D8", ExcelNumber),
    debrief: new WorkbookLoc("Debrief", "General", "D9", ExcelString),
    genCompletionCode: new WorkbookLoc("Generate Completion Code", "General", "D10", ExcelBoolean),
    completionCodeDigits: new WorkbookLoc("Completion Code Digits", "General", "D11", ExcelNumber),

    sourcePostSelection: {
        worksheet: "Source & Post Selection",
        method: new WorkbookLoc(
            "Source & Post Selection Method",
            "Source & Post Selection", "E2", ExcelString
        ),

        overallRatio: {
            truePostPercentage: new WorkbookLoc(
                "Overall-Ratio True Post Percentage",
                "Source & Post Selection", "D14", ExcelPercentage
            )
        },
        credibility: {
            slope: new WorkbookLoc(
                "Credibility Linear Slope",
                "Source & Post Selection", "D19", ExcelNumber
            ),
            intercept: new WorkbookLoc(
                "Credibility Linear Intercept",
                "Source & Post Selection", "D20", ExcelNumber
            )
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
                    "Default Initial Followers Std. Deviation", "Sources", "E16", ExcelNumber)
            },
            credibility: {
                mean: new WorkbookLoc(
                    "Default Initial Credibility Mean", "Sources", "F16", ExcelNumber),
                stdDev: new WorkbookLoc(
                    "Default Initial Credibility Std. Deviation", "Sources", "G16", ExcelNumber)
            }
        }
    },

    post: {
        firstRow: 23,
        lastRow: 1006,
        rowStride: 3,
        worksheet: "Posts",
        valueColumns: "DEFGHIJKLMNOPQ",
        id: new WorkbookColumn("ID", "Posts", "C", ExcelString),
        headline: new WorkbookColumn("Headline", "Posts", "D", ExcelString),
        content: new WorkbookColumn("Content", "Posts", "E", ExcelTextOrImage),
        isTrue: new WorkbookColumn("Is True", "Posts", "F", ExcelBoolean),
        changesToFollowers: {
            min: -1e9,
            max: 1e9,
            like: new WorkbookColumn("Follower Change from Likes", "Posts", "G", ExcelNumber),
            dislike: new WorkbookColumn("Follower Change from Dislikes", "Posts", "H", ExcelNumber),
            share: new WorkbookColumn("Follower Change from Shares", "Posts", "I", ExcelNumber),
            flag: new WorkbookColumn("Follower Change from Flags", "Posts", "J", ExcelNumber)
        },
        changesToCredibility: {
            min: -100,
            max: 100,
            like: new WorkbookColumn("Credibility Change from Likes", "Posts", "K", ExcelNumber),
            dislike: new WorkbookColumn("Credibility Change from Dislikes", "Posts", "L", ExcelNumber),
            share: new WorkbookColumn("Credibility Change from Shares", "Posts", "M", ExcelNumber),
            flag: new WorkbookColumn("Credibility Change from Flags", "Posts", "N", ExcelNumber)
        },
        comment: {
            valueColumns: "OPQ",
            sourceID: new WorkbookColumn("Comment Source ID", "Posts", "O", ExcelString),
            message: new WorkbookColumn("Comment Message", "Posts", "P", ExcelString),
            likes: new WorkbookColumn("Comment Likes", "Posts", "Q", ExcelNumber)
        },
        trueDefaults: generateV1PostDefaultsSpec(true, 16),
        falseDefaults: generateV1PostDefaultsSpec(false, 18)
    },

    predefinedOrder: {
        worksheet: "Pre-Defined Source & Post Order",
        firstRow: 9,
        lastRow: 999,
        valueColumns: "CD",
        sourceID: new WorkbookColumn("Source ID", "Pre-Defined Source & Post Order", "C", ExcelString),
        postID: new WorkbookColumn("Post ID", "Pre-Defined Source & Post Order", "D", ExcelString)
    }
}

function readV1PredefinedSourcePostOrder(workbook, length) {
    const order = [];
    const lastRow = V1.predefinedOrder.firstRow + length;
    if (lastRow > V1.predefinedOrder.lastRow) {
        const maxLength = V1.predefinedOrder.lastRow - V1.predefinedOrder.firstRow + 1;
        throw new Error(
            "Study length is too long for pre-defined selection method. " +
            "The study has a length of " + length + ", but the pre-defined selection " +
            "method has a max number of " + maxLength + " pairs."
        );
    }

    for (let row = V1.predefinedOrder.firstRow; row <= lastRow; ++row) {
        if (areCellsBlank(workbook, V1.predefinedOrder.worksheet, V1.predefinedOrder.valueColumns, [row])) {
            throw new Error(
                "Expected a source/post pair on row " + row + " of the " +
                "Pre-Defined Source & Post Order sheet"
            );
        }

        order.push([
            readCell(workbook, V1.predefinedOrder.sourceID.row(row)),
            readCell(workbook, V1.predefinedOrder.postID.row(row))
        ]);
    }
    return order;
}

function readV1SourcePostSelectionMethod(workbook) {
    const method = readCell(workbook, V1.sourcePostSelection.method);
    if (method === "Overall-Ratio") {
        return new OverallRatioSelectionMethod(
            readCell(workbook, V1.sourcePostSelection.overallRatio.truePostPercentage)
        );
    } else if (method === "Source-Ratios") {
        return new SourceRatioSelectionMethod();
    } else if (method === "Credibility") {
        return new CredibilitySelectionMethod(
            new LinearFunction(
                readCell(workbook, V1.sourcePostSelection.credibility.slope),
                readCell(workbook, V1.sourcePostSelection.credibility.intercept)
            )
        );
    } else if (method === "Pre-Defined") {
        return new PredefinedSelectionMethod(
            readV1PredefinedSourcePostOrder(workbook)
        );
    } else {
        throw new Error("Unknown Source & Post Selection Method " + method);
    }
}

function readV1FollowersDistribution(workbook, row, defaults) {
    let mean, stdDev;
    if (isCellBlank(workbook, V1.source.followers.row(row))) {
        mean = defaults.followersMean;
        stdDev = defaults.followersStdDev;
    } else {
        mean = readCell(workbook, V1.source.followers.row(row));
        stdDev = 0;
    }

    // Followers can fall anywhere within 5 standard deviations
    // of the mean. This helps us to avoid extreme values.
    return new TruncatedNormalDistribution(
        mean, stdDev,
        Math.max(0, mean - 5 * stdDev),
        mean + 5 * stdDev
    );
}

function readV1CredibilityDistribution(workbook, row, defaults) {
    let mean, stdDev;
    if (isCellBlank(workbook, V1.source.credibility.row(row))) {
        mean = defaults.credibilityMean;
        stdDev = defaults.credibilityStdDev;
    } else {
        mean = readCell(workbook, V1.source.credibility.row(row));
        stdDev = 0;
    }

    // Credibility can fall anywhere from 0 to 100.
    return new TruncatedNormalDistribution(mean, stdDev, 0, 100);
}

/**
 * Returns a Promise to a list of sources read from the workbook.
 */
function readV1Sources(workbook) {
    const sources = [];
    const defaults = {
        maxPosts: readCell(workbook, V1.source.defaults.maxPosts),
        followersMean: readCell(workbook, V1.source.defaults.followers.mean),
        followersStdDev: readCell(workbook, V1.source.defaults.followers.stdDev),
        credibilityMean: readCell(workbook, V1.source.defaults.credibility.mean),
        credibilityStdDev: readCell(workbook, V1.source.defaults.credibility.stdDev)
    };
    for (let row = V1.source.firstRow; row <= V1.source.lastRow; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, V1.source.worksheet, V1.source.valueColumns, [row]))
            continue;

        const sourceID = readCell(workbook, V1.source.id.row(row));
        const followers = readV1FollowersDistribution(workbook, row, defaults);
        const credibility = readV1CredibilityDistribution(workbook, row, defaults);

        // Read and convert the avatar image to our own format.
        const avatarPromise = StudyImage.fromExcelImage(readCell(workbook, V1.source.avatar.row(row)));

        sources.push(
            avatarPromise.then((avatar) => {
                return new Source(
                    sourceID,
                    readCell(workbook, V1.source.name.row(row)),
                    avatar,
                    readCellWithDefault(workbook, V1.source.maxPosts.row(row), defaults.maxPosts),
                    followers, credibility,
                    readCell(workbook, V1.source.truePostPercentage.row(row))
                );
            })
        );
    }
    return Promise.all(sources);
}

function readV1ReactionValue(workbook, loc, min, max, defaultDist) {
    doNonNullCheck(workbook);
    doTypeCheck(loc, WorkbookLoc);
    doTypeCheck(min, "number");
    doTypeCheck(max, "number");
    doTypeCheck(defaultDist, TruncatedNormalDistribution);
    if (isCellBlank(workbook, loc))
        return defaultDist;

    const value = readCell(workbook, loc);
    return new TruncatedNormalDistribution(value, 0, min, max);
}

function readV1ReactionValues(workbook, spec, row, defaults) {
    const min = spec.min;
    const max = spec.max;
    return new ReactionValues(
        readV1ReactionValue(workbook, spec.like.row(row), min, max, defaults.like),
        readV1ReactionValue(workbook, spec.dislike.row(row), min, max, defaults.dislike),
        readV1ReactionValue(workbook, spec.share.row(row), min, max, defaults.share),
        readV1ReactionValue(workbook, spec.flag.row(row), min, max, defaults.flag)
    );
}

function readV1Comments(workbook, firstRow) {
    const comments = [];
    for (let row = firstRow; row < firstRow + V1.post.rowStride; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, V1.post.worksheet, V1.post.comment.valueColumns, [row]))
            continue;

        comments.push(new PostComment(
            readCell(workbook, V1.post.comment.sourceID.row(row)),
            readCell(workbook, V1.post.comment.message.row(row)),
            readCell(workbook, V1.post.comment.likes.row(row))
        ));
    }
    return comments;
}

function range(fromInclusive, toExclusive) {
    const arr = [];
    for (let value = fromInclusive; value < toExclusive; ++value) {
        arr.push(value);
    }
    return arr;
}

function readV1PostChangeDistDefault(workbook, defaultsSpec, min, max) {
    return new TruncatedNormalDistribution(
        readCell(workbook, defaultsSpec.mean),
        readCell(workbook, defaultsSpec.stdDev),
        min, max
    );
}

function readV1PostQuantityDefaults(workbook, defaultsSpec, min, max) {
    return {
        like: readV1PostChangeDistDefault(workbook, defaultsSpec.like, min, max),
        dislike: readV1PostChangeDistDefault(workbook, defaultsSpec.dislike, min, max),
        share: readV1PostChangeDistDefault(workbook, defaultsSpec.share, min, max),
        flag: readV1PostChangeDistDefault(workbook, defaultsSpec.flag, min, max)
    };
}

function readV1PostDefaults(workbook, defaultsSpec) {
    return {
        changesToFollowers: readV1PostQuantityDefaults(
            workbook, defaultsSpec.changesToFollowers,
            V1.post.changesToFollowers.min,
            V1.post.changesToFollowers.max
        ),
        changesToCredibility: readV1PostQuantityDefaults(
            workbook, defaultsSpec.changesToCredibility,
            V1.post.changesToCredibility.min,
            V1.post.changesToCredibility.max
        )
    };
}

/**
 * Returns a Promise to a list of posts read from the workbook.
 */
function readV1Posts(workbook) {
    const posts = [];
    const trueDefaults = readV1PostDefaults(workbook, V1.post.trueDefaults);
    const falseDefaults = readV1PostDefaults(workbook, V1.post.falseDefaults);
    for (let row = V1.post.firstRow; row <= V1.post.lastRow; row += V1.post.rowStride) {
        // Skip blank rows.
        const rows = range(row, row + V1.post.rowStride);
        if (areCellsBlank(workbook, V1.post.worksheet, V1.post.valueColumns, rows))
            continue;

        const postID = readCell(workbook, V1.post.id.row(row));
        const isTrue = readCell(workbook, V1.post.isTrue.row(row));
        const defaults = (isTrue ? trueDefaults : falseDefaults);

        // If the content is an image, we have to convert it to our format.
        const contentExcelValue = readCell(workbook, V1.post.content.row(row));
        let contentPromise;
        if (typeof content !== "string") {
            contentPromise = StudyImage.fromExcelImage(contentExcelValue);
        } else {
            contentPromise = Promise.resolve(contentExcelValue);
        }

        posts.push(
            contentPromise.then((content) => {
                return new Post(
                    postID,
                    readCell(workbook, V1.post.headline.row(row)),
                    content,
                    isTrue,
                    readV1ReactionValues(
                        workbook, V1.post.changesToFollowers, row, defaults.changesToFollowers),
                    readV1ReactionValues(
                        workbook, V1.post.changesToCredibility, row, defaults.changesToCredibility),
                    readV1Comments(workbook, row)
                )
            })
        );
    }
    return Promise.all(posts);
}

/**
 * Returns a Promise of a version 1 Study object for the study
 * configured in the spreadsheet {@param workbook}.
 */
function readV1Study(workbook) {
    const sourcesPromise = readV1Sources(workbook);
    const postsPromise = readV1Posts(workbook);
    return Promise.all([sourcesPromise, postsPromise]).then((sourcesAndPosts) => {
        const sources = sourcesAndPosts[0];
        const posts = sourcesAndPosts[1];
        return new Study(
            readCell(workbook, V1.name),
            readCell(workbook, V1.description),
            readCell(workbook, V1.introduction),
            readCell(workbook, V1.prompt),
            readCell(workbook, V1.length),
            readCell(workbook, V1.debrief),
            readCell(workbook, V1.genCompletionCode),
            readCell(workbook, V1.completionCodeDigits),
            readV1SourcePostSelectionMethod(workbook),
            sources, posts
        );
    });
}

/**
 * Returns a Promise of a Study object for the study
 * configured in the spreadsheet {@param workbook}.
 */
export function readStudyWorkbook(workbook) {
    try {
        const version = readCell(workbook, versionCell);

        if (version === 1) {
            return readV1Study(workbook);
        } else {
            return Promise.reject(new Error("Unknown study version " + version));
        }
    } catch (error) {
        return Promise.reject(error);
    }
}
