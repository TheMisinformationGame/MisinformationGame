import {Post, PostComment, ReactionValues, Source, Study} from "./study"
import {
    areCellsBlank,
    ExcelBoolean,
    ExcelImage, ExcelLimit,
    ExcelNumber, ExcelPercentage, ExcelHTML,
    ExcelString, ExcelHTMLOrImage, isCellBlank,
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


const versionCell = new WorkbookLoc("Version", "About", "M2", ExcelNumber);


/**
 * Specification of a normal distribution.
 */
function generateV1DistributionSpec(isTrue, firstRow, col, quantity, reactionPlural) {
    const truthSuffix = " (" + (isTrue ? "True" : "False") + " Posts)";
    return {
        mean: new WorkbookLoc(
            "Default mean of " + quantity + " for " + reactionPlural + truthSuffix,
            "Posts", col + firstRow, ExcelNumber
        ),
        stdDev: new WorkbookLoc(
            "Default std. deviation of " + quantity + " for " + reactionPlural + truthSuffix,
            "Posts", col + (firstRow + 1), ExcelNumber
        ),
    };
}
/**
 * Specification of a normal distribution for each reaction (like, dislike, share, flag).
 */
function generateV1ReactionDistributionsSpec(isTrue, firstRow, firstCol, quantity) {
    const likeCol = firstCol;
    const dislikeCol = String.fromCharCode(firstCol.charCodeAt(0) + 1);
    const shareCol = String.fromCharCode(firstCol.charCodeAt(0) + 2);
    const flagCol = String.fromCharCode(firstCol.charCodeAt(0) + 3);
    return {
        like: generateV1DistributionSpec(isTrue, firstRow, likeCol, quantity, "Likes"),
        dislike: generateV1DistributionSpec(isTrue, firstRow, dislikeCol, quantity, "Dislikes"),
        share: generateV1DistributionSpec(isTrue, firstRow, shareCol, quantity, "Shares"),
        flag: generateV1DistributionSpec(isTrue, firstRow, flagCol, quantity, "Flags")
    };
}
/**
 * Specification of the default distributions for posts.
 */
function generateV1PostDefaultsSpec(isTrue, firstRow) {
    return {
        changesToFollowers: generateV1ReactionDistributionsSpec(isTrue, firstRow, "D", "Changes to Followers"),
        changesToCredibility: generateV1ReactionDistributionsSpec(isTrue, firstRow, "H", "Changes to Credibility"),
        numberOfReactions: generateV1ReactionDistributionsSpec(isTrue, firstRow, "L", "Number of Reactions"),
    };
}

/**
 * The location of all study parameter cells for version-1 studies.
 */
const V1 = {
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
            displayFollowers: new WorkbookLoc("Display Followers", "General", "D14", ExcelBoolean),
            displayCredibility: new WorkbookLoc("Display Credibility", "General", "D15", ExcelBoolean),
            displayProgress: new WorkbookLoc("Display Progress", "General", "D16", ExcelBoolean),
            displayNumberOfReactions: new WorkbookLoc("Display Number of Reactions", "General", "D17", ExcelBoolean),

            postEnabledReactions: {
                like: new WorkbookLoc("Post Likes Enabled", "General", "D18", ExcelBoolean),
                dislike: new WorkbookLoc("Post Dislikes Enabled", "General", "D19", ExcelBoolean),
                share: new WorkbookLoc("Post Shares Enabled", "General", "D20", ExcelBoolean),
                flag: new WorkbookLoc("Post Flags Enabled", "General", "D21", ExcelBoolean),
            },

            commentEnabledReactions: {
                like: new WorkbookLoc("Comment Likes Enabled", "General", "D22", ExcelBoolean),
                dislike: new WorkbookLoc("Comment Dislikes Enabled", "General", "D23", ExcelBoolean),
            }
        },

        advanced: {
            minimumCommentLength: new WorkbookLoc("Minimum Comment Length", "General", "D27", ExcelNumber),
            promptDelaySeconds: new WorkbookLoc("Prompt Continue Delay (Seconds)", "General", "D28", ExcelNumber),
            reactDelaySeconds: new WorkbookLoc("Reaction Delay (Seconds)", "General", "D29", ExcelNumber),
            genCompletionCode: new WorkbookLoc("Generate Completion Code", "General", "D30", ExcelBoolean),
            completionCodeDigits: new WorkbookLoc("Completion Code Digits", "General", "D31", ExcelNumber),
            genRandDefaultAvatars: new WorkbookLoc("Generate Random Default Avatars", "General", "D32", ExcelBoolean),
        }
    },

    pages: {
        preIntro: new WorkbookLoc("Introduction before Game Rules", "Pages", "B4", ExcelHTML),
        preIntroDelaySeconds: new WorkbookLoc(
            "Introduction before Game Rules Continue Delay (Seconds)", "Pages", "D3", ExcelNumber
        ),
        rules: new WorkbookLoc("Game Rules", "Pages", "B19", ExcelHTML),
        rulesDelaySeconds: new WorkbookLoc(
            "Game Rules Continue Delay (Seconds)", "Pages", "D18", ExcelNumber
        ),
        postIntro: new WorkbookLoc("Introduction after Game Rules", "Pages", "B34", ExcelHTML),
        postIntroDelaySeconds: new WorkbookLoc(
            "Introduction after Game Rules Continue Delay (Seconds)", "Pages", "D33", ExcelNumber
        ),
        debrief: new WorkbookLoc("Debrief", "Pages", "B48", ExcelHTML),
    },

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
        firstRow: 25,
        lastRow: 1008,
        rowStride: 3,
        worksheet: "Posts",
        valueColumns: "EIMNOPQRSTUVWXY",
        id: new WorkbookColumn("ID", "Posts", "D", ExcelString),
        headline: new WorkbookColumn("Headline", "Posts", "E", ExcelString),
        content: new WorkbookColumn("Content", "Posts", "I", ExcelHTMLOrImage),
        isTrue: new WorkbookColumn("Is True", "Posts", "M", ExcelBoolean),
        changesToFollowers: {
            min: -1e9, // Effectively unlimited
            max: 1e9,  // Effectively unlimited
            like: new WorkbookColumn("Follower Change from Likes", "Posts", "N", ExcelNumber),
            dislike: new WorkbookColumn("Follower Change from Dislikes", "Posts", "O", ExcelNumber),
            share: new WorkbookColumn("Follower Change from Shares", "Posts", "P", ExcelNumber),
            flag: new WorkbookColumn("Follower Change from Flags", "Posts", "Q", ExcelNumber)
        },
        changesToCredibility: {
            min: -100,
            max: 100,
            like: new WorkbookColumn("Credibility Change from Likes", "Posts", "R", ExcelNumber),
            dislike: new WorkbookColumn("Credibility Change from Dislikes", "Posts", "S", ExcelNumber),
            share: new WorkbookColumn("Credibility Change from Shares", "Posts", "T", ExcelNumber),
            flag: new WorkbookColumn("Credibility Change from Flags", "Posts", "U", ExcelNumber)
        },
        numberOfReactions: {
            min: 0,
            max: 1e9,  // Effectively unlimited
            like: new WorkbookColumn("Number of Likes", "Posts", "V", ExcelNumber),
            dislike: new WorkbookColumn("Number of Dislikes", "Posts", "W", ExcelNumber),
            share: new WorkbookColumn("Number of Shares", "Posts", "X", ExcelNumber),
            flag: new WorkbookColumn("Number of Flags", "Posts", "Y", ExcelNumber)
        },
        comment: {
            valueColumns: ["Z", "AB", "AG", "AH"],
            sourceName: new WorkbookColumn("Comment Source Name", "Posts", "Z", ExcelString),
            message: new WorkbookColumn("Comment Message", "Posts", "AB", ExcelHTML),
            likes: new WorkbookColumn("Comment Likes", "Posts", "AG", ExcelNumber),
            dislikes: new WorkbookColumn("Comment Dislikes", "Posts", "AH", ExcelNumber)
        },
        trueDefaults: generateV1PostDefaultsSpec(true, 18),
        falseDefaults: generateV1PostDefaultsSpec(false, 20)
    },

    predefinedOrder: {
        worksheet: "Pre-Defined Source/Post Pairs",
        firstRow: 10,
        lastRow: 1000,
        valueColumns: "CD",
        randomiseOrder: new WorkbookLoc("Randomise Order", "Pre-Defined Source/Post Pairs", "D6", ExcelBoolean),
        sourceID: new WorkbookColumn("Source ID", "Pre-Defined Source/Post Pairs", "C", ExcelString),
        postID: new WorkbookColumn("Post ID", "Pre-Defined Source/Post Pairs", "D", ExcelString)
    }
}

/**
 * Read the source/post pair from the {@param row}'th row in {@param workbook}.
 */
function readV1PredefinedSourcePostPair(workbook, row) {
    return {
        sourceID: readCell(workbook, V1.predefinedOrder.sourceID.row(row)),
        postID: readCell(workbook, V1.predefinedOrder.postID.row(row))
    };
}

/**
 * Loads the first {@param length} rows of source/post pairs in {@param workbook}.
 */
function readV1PredefinedSourcePostPairsFixedLength(workbook, length) {
    if (!length || length <= 0)
        throw new Error("Length must be positive");

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
        order.push(readV1PredefinedSourcePostPair(workbook, row));
    }
    return order;
}

/**
 * Reads all the pre-defined source/post pairs from the workbook.
 * Ignores empty rows, and loads all pairs that are set.
 */
function readV1PredefinedSourcePostPairs(workbook) {
    const pairs = [];
    for (let row = V1.predefinedOrder.firstRow; row <= V1.predefinedOrder.lastRow; ++row) {
        if (areCellsBlank(workbook, V1.predefinedOrder.worksheet, V1.predefinedOrder.valueColumns, [row]))
            continue;

        pairs.push(readV1PredefinedSourcePostPair(workbook, row));
    }
    return pairs;
}

function readV1SourcePostSelectionMethod(workbook, length) {
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
        const randomiseOrder = readCell(workbook, V1.predefinedOrder.randomiseOrder);

        // If the order is randomised, we load all the pairs, otherwise we only load length of them.
        let pairs;
        if (randomiseOrder) {
            pairs = readV1PredefinedSourcePostPairs(workbook);
            if (pairs.length < length) {
                throw new Error(
                    "Expected at least " + length + " Pre-Defined Source/Post Pairs, " +
                    "however only " + pairs.length + " were found"
                );
            }
        } else {
            pairs = readV1PredefinedSourcePostPairsFixedLength(workbook, length);
        }
        return new PredefinedSelectionMethod(randomiseOrder, pairs);
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
function readV1Sources(workbook, study) {
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
        const avatarValue = readCellWithDefault(workbook, V1.source.avatar.row(row), null);
        let avatarPromise;
        if (avatarValue) {
            avatarPromise = StudyImage.fromExcelImage(readCell(workbook, V1.source.avatar.row(row)));
        } else {
            avatarPromise = Promise.resolve(null);
        }

        // If using the Source-Ratios selection method, then read the true-post percentage for each source.
        let truePostPercentage = -1;
        if (study.sourcePostSelectionMethod.type === "Source-Ratios") {
            truePostPercentage = readCellWithDefault(workbook, V1.source.truePostPercentage.row(row), 0.5);
        }

        sources.push(
            avatarPromise.then((avatar) => {
                return new Source(
                    sourceID,
                    readCell(workbook, V1.source.name.row(row)),
                    avatar,
                    Source.randomStyle(),
                    readCellWithDefault(workbook, V1.source.maxPosts.row(row), defaults.maxPosts),
                    followers, credibility,
                    truePostPercentage
                );
            })
        );
    }
    return Promise.all(sources);
}

function readV1ReactionValue(workbook, reaction, spec, row, defaults, enabledReactions) {
    if (!enabledReactions[reaction])
        return null;

    const loc = spec[reaction].row(row);
    if (isCellBlank(workbook, loc))
        return defaults[reaction];

    const value = readCell(workbook, loc);
    return new TruncatedNormalDistribution(value, 0, spec.min, spec.max);
}

function readV1ReactionValues(workbook, spec, row, defaults, enabledReactions) {
    return new ReactionValues(
        readV1ReactionValue(workbook, "like", spec, row, defaults, enabledReactions),
        readV1ReactionValue(workbook, "dislike", spec, row, defaults, enabledReactions),
        readV1ReactionValue(workbook, "share", spec, row, defaults, enabledReactions),
        readV1ReactionValue(workbook, "flag", spec, row, defaults, enabledReactions)
    );
}

function readV1Comments(workbook, firstRow) {
    const comments = [];
    for (let row = firstRow; row < firstRow + V1.post.rowStride; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, V1.post.worksheet, V1.post.comment.valueColumns, [row]))
            continue;

        const index = row - firstRow;
        const likes = readCellWithDefault(workbook, V1.post.comment.likes.row(row), 0);
        const dislikes = readCellWithDefault(workbook, V1.post.comment.dislikes.row(row), 0);

        comments.push(new PostComment(
            index,
            readCell(workbook, V1.post.comment.sourceName.row(row)),
            readCell(workbook, V1.post.comment.message.row(row)),
            new ReactionValues(
                TruncatedNormalDistribution.exactly(likes),
                TruncatedNormalDistribution.exactly(dislikes),
                null,
                null
            )
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

function readV1PostQuantityDefaults(workbook, defaultsSpec, min, max, enabledReactions) {
    const def = {};
    const reactions = ["like", "dislike", "share", "flag"];
    for (let index = 0; index < reactions.length; ++index) {
        const reaction = reactions[index];
        if (!enabledReactions[reaction])
            continue;

        def[reaction] = readV1PostChangeDistDefault(
            workbook, defaultsSpec[reaction], min, max
        );
    }
    return def;
}

function readV1PostDefaults(workbook, defaultsSpec, enabledReactions) {
    return {
        changesToFollowers: readV1PostQuantityDefaults(
            workbook, defaultsSpec.changesToFollowers,
            V1.post.changesToFollowers.min,
            V1.post.changesToFollowers.max,
            enabledReactions
        ),
        changesToCredibility: readV1PostQuantityDefaults(
            workbook, defaultsSpec.changesToCredibility,
            V1.post.changesToCredibility.min,
            V1.post.changesToCredibility.max,
            enabledReactions
        ),
        numberOfReactions: readV1PostQuantityDefaults(
            workbook, defaultsSpec.numberOfReactions,
            V1.post.numberOfReactions.min,
            V1.post.numberOfReactions.max,
            enabledReactions
        ),
    };
}

/**
 * Returns a Promise to a list of posts read from the workbook.
 */
function readV1Posts(workbook, study) {
    const posts = [];
    const enabledReactions = study.postEnabledReactions;
    const trueDefaults = readV1PostDefaults(workbook, V1.post.trueDefaults, enabledReactions);
    const falseDefaults = readV1PostDefaults(workbook, V1.post.falseDefaults, enabledReactions);
    for (let row = V1.post.firstRow; row <= V1.post.lastRow; row += V1.post.rowStride) {
        // Skip blank rows.
        const rows = range(row, row + V1.post.rowStride);
        if (areCellsBlank(workbook, V1.post.worksheet, V1.post.valueColumns, rows))
            continue;

        const postID = readCell(workbook, V1.post.id.row(row));
        const isTrue = readCell(workbook, V1.post.isTrue.row(row));
        const defaults = (isTrue ? trueDefaults : falseDefaults);

        // If the content is an image, we have to convert it to our format.
        const contentExcelValue = readCellWithDefault(workbook, V1.post.content.row(row), "");
        let contentPromise;
        if (typeof contentExcelValue !== "string") {
            contentPromise = StudyImage.fromExcelImage(contentExcelValue);
        } else {
            contentPromise = Promise.resolve(contentExcelValue);
        }

        const headline = readCellWithDefault(workbook, V1.post.headline.row(row), "");
        if (headline === "" && contentExcelValue === "") {
            throw new Error(
                "Post " + postID + " is missing both its headline and its content. " +
                "It must have either a headline, content, or both."
            );
        }

        posts.push(
            contentPromise.then((content) => {
                return new Post(
                    postID,
                    headline,
                    content,
                    isTrue,
                    readV1ReactionValues(
                        workbook, V1.post.changesToFollowers, row, defaults.changesToFollowers, enabledReactions),
                    readV1ReactionValues(
                        workbook, V1.post.changesToCredibility, row, defaults.changesToCredibility, enabledReactions),
                    readV1ReactionValues(
                        workbook, V1.post.numberOfReactions, row, defaults.numberOfReactions, enabledReactions),
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
    // First, read the basic settings of the spreadsheet.
    const requireComments = readCell(workbook, V1.general.basic.requireComments);
    const genCompletionCode = readCell(workbook, V1.general.advanced.genCompletionCode);
    const length = readCell(workbook, V1.general.basic.length);
    const study = new Study(
        "unknown", // id
        "unknown", // authorID
        "unknown", // authorName
        readCell(workbook, V1.general.basic.name),
        readCell(workbook, V1.general.basic.description),
        -1, // lastModifiedTime
        false, // enabled
        readCell(workbook, V1.general.basic.prompt),
        readCell(workbook, V1.general.advanced.promptDelaySeconds),
        length,
        readCell(workbook, V1.general.basic.requireReactions),
        readCell(workbook, V1.general.advanced.reactDelaySeconds),
        requireComments,
        (requireComments !== "disabled" ? readCell(workbook, V1.general.advanced.minimumCommentLength) : 0),
        readCell(workbook, V1.general.basic.requireIdentification),
        readCell(workbook, V1.general.userInterface.displayFollowers),
        readCell(workbook, V1.general.userInterface.displayCredibility),
        readCell(workbook, V1.general.userInterface.displayProgress),
        readCell(workbook, V1.general.userInterface.displayNumberOfReactions),
        { // postEnabledReactions
            "like": readCell(workbook, V1.general.userInterface.postEnabledReactions.like),
            "dislike": readCell(workbook, V1.general.userInterface.postEnabledReactions.dislike),
            "share": readCell(workbook, V1.general.userInterface.postEnabledReactions.share),
            "flag": readCell(workbook, V1.general.userInterface.postEnabledReactions.flag),
        },
        { // commentEnabledReactions
            "like": readCell(workbook, V1.general.userInterface.commentEnabledReactions.like),
            "dislike": readCell(workbook, V1.general.userInterface.commentEnabledReactions.dislike),
        },
        genCompletionCode,
        (genCompletionCode ? readCellWithDefault(workbook, V1.general.advanced.completionCodeDigits, 4) : 0),
        readCellWithDefault(workbook, V1.general.advanced.genRandDefaultAvatars, true),
        readCellWithDefault(workbook, V1.pages.preIntro, ""),
        readCellWithDefault(workbook, V1.pages.preIntroDelaySeconds, 0),
        readCellWithDefault(workbook, V1.pages.rules, ""),
        readCellWithDefault(workbook, V1.pages.rulesDelaySeconds, 0),
        readCellWithDefault(workbook, V1.pages.postIntro, ""),
        readCellWithDefault(workbook, V1.pages.postIntroDelaySeconds, 0),
        readCell(workbook, V1.pages.debrief),
        readV1SourcePostSelectionMethod(workbook, length),
        [], // Sources
        [], // Posts
    );

    // We must then read the sources and posts using Promises
    // due to the way that the image loading works.
    const sourcesPromise = readV1Sources(workbook, study);
    const postsPromise = readV1Posts(workbook, study);
    return Promise.all([sourcesPromise, postsPromise]).then((sourcesAndPosts) => {
        study.sources = sourcesAndPosts[0];
        study.posts = sourcesAndPosts[1];
        study.updateLastModifiedTime();
        return study;
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
