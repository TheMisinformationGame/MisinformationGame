import {Post, PostComment, ReactionValues, Source, Study, StudyImage} from "./study"
import {
    areCellsBlank,
    ExcelBoolean,
    ExcelImage,
    ExcelNumber, ExcelPercentage,
    ExcelString, ExcelTextOrImage,
    readCell,
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


const versionCell = new WorkbookLoc("Version", "About", "M2", ExcelNumber);
const Version1 = {
    name: new WorkbookLoc("Name", "General", "D4", ExcelString),
    description: new WorkbookLoc("Description", "General", "D5", ExcelString),
    introduction: new WorkbookLoc("Introduction", "General", "D6", ExcelString),
    prompt: new WorkbookLoc("Prompt", "General", "D7", ExcelString),
    length: new WorkbookLoc("Length", "General", "D8", ExcelNumber),
    debrief: new WorkbookLoc("Debrief", "General", "D9", ExcelString),
    genCompletionCode: new WorkbookLoc("Generate Completion Code", "General", "D10", ExcelBoolean),
    maxCompletionCode: new WorkbookLoc("Maximum Completion Code", "General", "D11", ExcelNumber),

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
        firstRow: 16,
        lastRow: 999,
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
        truePostPercentage: new WorkbookColumn("True Post Percentage", "Sources", "K", ExcelPercentage)
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
        }
    }
}

function readV1SourcePostSelectionMethod(workbook) {
    const method = readCell(workbook, Version1.sourcePostSelection.method);
    if (method === "Overall-Ratio") {
        return new OverallRatioSelectionMethod(
            readCell(workbook, Version1.sourcePostSelection.overallRatio.truePostPercentage)
        );
    } else if (method === "Source-Ratios") {
        return new SourceRatioSelectionMethod();
    } else if (method === "Credibility") {
        return new CredibilitySelectionMethod(
            new LinearFunction(
                readCell(workbook, Version1.sourcePostSelection.credibility.slope),
                readCell(workbook, Version1.sourcePostSelection.credibility.intercept)
            )
        );
    } else if (method === "Pre-Defined") {
        // TODO : Read the pre-defined source & post order.
        return new PredefinedSelectionMethod();
    } else {
        throw new Error("Unknown Source & Post Selection Method " + method);
    }
}

function readV1Sources(workbook) {
    const sources = [];
    for (let row = Version1.source.firstRow; row <= Version1.source.lastRow; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, Version1.source.worksheet, Version1.source.valueColumns, [row]))
            continue;

        const followersMean = readCell(workbook, Version1.source.followersMean.row(row));
        const followersStdDev = readCell(workbook, Version1.source.followersStdDev.row(row));

        // Followers can fall anywhere within 1 standard deviation of the mean.
        const followers = new TruncatedNormalDistribution(
            followersMean, followersStdDev,
            Math.max(0, followersMean - followersStdDev),
            followersMean + followersStdDev
        );
        // Credibility can fall anywhere between 0 and 100.
        const credibility = new TruncatedNormalDistribution(
            readCell(workbook, Version1.source.credibilityMean.row(row)),
            readCell(workbook, Version1.source.credibilityStdDev.row(row)),
            0, 100
        );

        sources.push(new Source(
            readCell(workbook, Version1.source.id.row(row)) ,
            readCell(workbook, Version1.source.name.row(row)),
            StudyImage.fromExcelImage(readCell(workbook, Version1.source.avatar.row(row))),
            readCell(workbook, Version1.source.maxPosts.row(row)),
            followers, credibility,
            readCell(workbook, Version1.source.truePostPercentage.row(row))
        ));
    }
    return sources;
}

function readV1ReactionValues(workbook, locations, row) {
    return new ReactionValues(
        readCell(workbook, locations.like.row(row)),
        readCell(workbook, locations.dislike.row(row)),
        readCell(workbook, locations.share.row(row)),
        readCell(workbook, locations.flag.row(row))
    );
}

function readV1Comments(workbook, firstRow) {
    const comments = [];
    for (let row = firstRow; row < firstRow + Version1.post.rowStride; ++row) {
        // Skip blank rows.
        if (areCellsBlank(workbook, Version1.post.worksheet, Version1.post.comment.valueColumns, [row]))
            continue;

        comments.push(new PostComment(
            readCell(workbook, Version1.post.comment.sourceID.row(row)),
            readCell(workbook, Version1.post.comment.message.row(row)),
            readCell(workbook, Version1.post.comment.likes.row(row))
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

function readV1Posts(workbook) {
    const posts = [];
    for (let row = Version1.post.firstRow; row <= Version1.post.lastRow; row += Version1.post.rowStride) {
        // Skip blank rows.
        const rows = range(row, row + Version1.post.rowStride);
        if (areCellsBlank(workbook, Version1.post.worksheet, Version1.post.valueColumns, rows))
            continue;

        // If the content is an image, we have to convert it to our format.
        let content = readCell(workbook, Version1.post.content.row(row));
        if (typeof content !== "string") {
            content = StudyImage.fromExcelImage(content);
        }

        posts.push(new Post(
            readCell(workbook, Version1.post.id.row(row)),
            readCell(workbook, Version1.post.headline.row(row)),
            content,
            readCell(workbook, Version1.post.isTrue.row(row)),
            readV1ReactionValues(workbook, Version1.post.changesToFollowers, row),
            readV1ReactionValues(workbook, Version1.post.changesToCredibility, row),
            readV1Comments(workbook, row)
        ));
    }
    return posts;
}

function readV1Study(workbook) {
    return new Study(
        readCell(workbook, Version1.name),
        readCell(workbook, Version1.description),
        readCell(workbook, Version1.introduction),
        readCell(workbook, Version1.prompt),
        readCell(workbook, Version1.length),
        readCell(workbook, Version1.debrief),
        readCell(workbook, Version1.genCompletionCode),
        readCell(workbook, Version1.maxCompletionCode),
        readV1SourcePostSelectionMethod(workbook),
        readV1Sources(workbook),
        readV1Posts(workbook)
    );
}

export function readStudyWorkbook(workbook) {
    const version = readCell(workbook, versionCell);

    if (version === 1) {
        return readV1Study(workbook);
    } else {
        throw new Error("Unknown study version " + version);
    }
}
