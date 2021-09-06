import {Post, PostComment, ReactionValues, Source, Study} from "./study"
import {
    areCellsBlank,
    ExcelBoolean,
    ExcelImage,
    ExcelNumber, ExcelPercentage,
    ExcelString, ExcelTextOrImage,
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
import {FIRESTORE_IMAGE_LIMIT, StudyImage} from "./images";


const versionCell = new WorkbookLoc("Version", "About", "M2", ExcelNumber);
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
        maxPosts: new WorkbookColumn("Max Posts", "Sources", "F", ExcelNumber),
        followersMean: new WorkbookColumn("Followers Mean", "Sources", "G", ExcelNumber),
        followersStdDev: new WorkbookColumn("Followers Std. Deviation", "Sources", "H", ExcelNumber),
        credibilityMean: new WorkbookColumn("Credibility Mean", "Sources", "I", ExcelNumber),
        credibilityStdDev: new WorkbookColumn("Credibility Std. Deviation", "Sources", "J", ExcelNumber),
        truePostPercentage: new WorkbookColumn("True Post Percentage", "Sources", "K", ExcelPercentage),
        defaults: {
            maxPosts: new WorkbookLoc("Max Posts", "Sources", "F16", ExcelNumber),
            followersMean: new WorkbookLoc("Followers Mean", "Sources", "G16", ExcelNumber),
            followersStdDev: new WorkbookLoc("Followers Std. Deviation", "Sources", "H16", ExcelNumber),
            credibilityMean: new WorkbookLoc("Credibility Mean", "Sources", "I16", ExcelNumber),
            credibilityStdDev: new WorkbookLoc("Credibility Std. Deviation", "Sources", "J16", ExcelNumber)
        }
    },

    post: {
        firstRow: 16,
        lastRow: 999,
        rowStride: 3,
        worksheet: "Posts",
        valueColumns: "DEFGHIJKLMNOPQ",
        id: new WorkbookColumn("ID", "Posts", "C", ExcelString),
        headline: new WorkbookColumn("Headline", "Posts", "D", ExcelString),
        content: new WorkbookColumn("Content", "Posts", "E", ExcelTextOrImage),
        isTrue: new WorkbookColumn("Is True", "Posts", "F", ExcelBoolean),
        changesToFollowers: {
            like: new WorkbookColumn("Changes to Followers for Likes", "Posts", "G", ExcelNumber),
            dislike: new WorkbookColumn("Changes to Followers for Dislikes", "Posts", "H", ExcelNumber),
            share: new WorkbookColumn("Changes to Followers for Shares", "Posts", "I", ExcelNumber),
            flag: new WorkbookColumn("Changes to Followers for Flags", "Posts", "J", ExcelNumber)
        },
        changesToCredibility: {
            like: new WorkbookColumn("Changes to Credibility for Likes", "Posts", "K", ExcelNumber),
            dislike: new WorkbookColumn("Changes to Credibility for Dislikes", "Posts", "L", ExcelNumber),
            share: new WorkbookColumn("Changes to Credibility for Shares", "Posts", "M", ExcelNumber),
            flag: new WorkbookColumn("Changes to Credibility for Flags", "Posts", "N", ExcelNumber)
        },
        comment: {
            valueColumns: "OPQ",
            sourceID: new WorkbookColumn("Comment Source ID", "Posts", "O", ExcelString),
            message: new WorkbookColumn("Comment Message", "Posts", "P", ExcelString),
            likes: new WorkbookColumn("Comment Likes", "Posts", "Q", ExcelNumber)
        },
        defaults: {
            changesToFollowers: {
                like: new WorkbookLoc("Changes to Followers for Likes", "Posts", "G11", ExcelNumber),
                dislike: new WorkbookLoc("Changes to Followers for Dislikes", "Posts", "H11", ExcelNumber),
                share: new WorkbookLoc("Changes to Followers for Shares", "Posts", "I11", ExcelNumber),
                flag: new WorkbookLoc("Changes to Followers for Flags", "Posts", "J11", ExcelNumber)
            },
            changesToCredibility: {
                like: new WorkbookLoc("Changes to Credibility for Likes", "Posts", "K11", ExcelNumber),
                dislike: new WorkbookLoc("Changes to Credibility for Dislikes", "Posts", "L11", ExcelNumber),
                share: new WorkbookLoc("Changes to Credibility for Shares", "Posts", "M11", ExcelNumber),
                flag: new WorkbookLoc("Changes to Credibility for Flags", "Posts", "N11", ExcelNumber)
            }
        }
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

function readV1PredefinedSourcePostOrder(workbook) {
    const order = [];
    for (let row = V1.predefinedOrder.firstRow; row <= V1.predefinedOrder.lastRow; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, V1.predefinedOrder.worksheet, V1.predefinedOrder.valueColumns, [row]))
            continue;

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
    const followersMean = readCellWithDefault(
        workbook, V1.source.followersMean.row(row), defaults.followersMean);
    const followersStdDev = readCellWithDefault(
        workbook, V1.source.followersStdDev.row(row), defaults.followersStdDev);

    // Followers can fall anywhere within 5 standard deviations of the mean.
    // This helps us to avoid extreme values.
    return new TruncatedNormalDistribution(
        followersMean, followersStdDev,
        Math.max(0, followersMean - 5 * followersStdDev),
        followersMean + 5 * followersStdDev
    );
}

function readV1CredibilityDistribution(workbook, row, defaults) {
    const credibilityMean = readCellWithDefault(
        workbook, V1.source.credibilityMean.row(row), defaults.credibilityMean);
    const credibilityStdDev = readCellWithDefault(
        workbook, V1.source.credibilityStdDev.row(row), defaults.credibilityStdDev);

    // Credibility can fall anywhere from 0 to 100.
    return new TruncatedNormalDistribution(credibilityMean, credibilityStdDev, 0, 100);
}

/**
 * Returns a Promise to a list of sources read from the workbook.
 */
function readV1Sources(workbook) {
    const sources = [];
    const defaults = {
        maxPosts: readCell(workbook, V1.source.defaults.maxPosts),
        followersMean: readCell(workbook, V1.source.defaults.followersMean),
        followersStdDev: readCell(workbook, V1.source.defaults.followersStdDev),
        credibilityMean: readCell(workbook, V1.source.defaults.credibilityMean),
        credibilityStdDev: readCell(workbook, V1.source.defaults.credibilityStdDev)
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

function readV1ReactionValues(workbook, locations, row, defaultLocs) {
    const defaultLike = readCell(workbook, defaultLocs.like);
    const defaultDislike = readCell(workbook, defaultLocs.like);
    const defaultShare = readCell(workbook, defaultLocs.like);
    const defaultFlag = readCell(workbook, defaultLocs.like);
    return new ReactionValues(
        readCellWithDefault(workbook, locations.like.row(row), defaultLike),
        readCellWithDefault(workbook, locations.dislike.row(row), defaultDislike),
        readCellWithDefault(workbook, locations.share.row(row), defaultShare),
        readCellWithDefault(workbook, locations.flag.row(row), defaultFlag)
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

/**
 * Returns a Promise to a list of posts read from the workbook.
 */
function readV1Posts(workbook) {
    const posts = [];
    for (let row = V1.post.firstRow; row <= V1.post.lastRow; row += V1.post.rowStride) {
        // Skip blank rows.
        const rows = range(row, row + V1.post.rowStride);
        if (areCellsBlank(workbook, V1.post.worksheet, V1.post.valueColumns, rows))
            continue;

        const postID = readCell(workbook, V1.post.id.row(row));

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
                    readCell(workbook, V1.post.isTrue.row(row)),
                    readV1ReactionValues(
                        workbook, V1.post.changesToFollowers, row, V1.post.defaults.changesToFollowers),
                    readV1ReactionValues(
                        workbook, V1.post.changesToCredibility, row, V1.post.defaults.changesToCredibility),
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
