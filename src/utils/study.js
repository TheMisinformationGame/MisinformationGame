import {doTypeCheck} from "./types";
import {
    readCell,
    WorkbookLoc,
    ExcelString,
    ExcelNumber,
    ExcelBoolean,
    WorkbookColumn,
    ExcelImage,
    isCellBlank
} from "./excel";


/**
 * This file contains the specification for a
 * study in a JSON formatted object.
 */
class TruncatedNormalDistribution {
    mean; // Number
    stdDeviation; // Number
    min; // Number
    max; // Number

    constructor(mean, stdDeviation, min, max) {
        doTypeCheck(mean, "number");
        doTypeCheck(stdDeviation, "number");
        doTypeCheck(min, "number");
        doTypeCheck(max, "number");

        this.mean = mean;
        this.stdDeviation = stdDeviation;
        this.min = min;
        this.max = max;
    }

    toJSON() {
        return {
            mean: this.mean,
            stdDeviation: this.stdDeviation,
            min: this.min,
            max: this.max
        };
    }
}

class Avatar {
    buffer; // Uint8Array
    type; // String

    constructor(buffer, type) {
        doTypeCheck(buffer, Uint8Array);
        doTypeCheck(type, "string");

        this.buffer = buffer;
        this.type = type;
    }

    createImage() {
        const image = new Image();
        image.src = URL.createObjectURL(
            new Blob([this.buffer.buffer], { type: this.type })
        );
        return image;
    }

    toJSON() {
        // TODO : Should we store the image buffer as base 64 text?
        throw new Error("Cannot convert Avatar to JSON");
    }

    static fromExcelImage(excelImage) {
        return new Avatar(excelImage.buffer, "image/" + excelImage.extension);
    }
}

class Source {
    id; // String
    name; // String
    avatar; // Avatar
    maxPosts; // Number
    followers; // TruncatedNormalDistribution
    credibility; // TruncatedNormalDistribution

    constructor(id, name, avatar, maxPosts, followers, credibility) {
        doTypeCheck(id, "string");
        doTypeCheck(name, "string");
        doTypeCheck(avatar, Avatar);
        doTypeCheck(maxPosts, "number");
        doTypeCheck(followers, TruncatedNormalDistribution);
        doTypeCheck(credibility, TruncatedNormalDistribution);

        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.maxPosts = maxPosts;
        this.followers = followers;
        this.credibility = credibility;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            avatar: this.avatar.toJSON(),
            maxPosts: this.maxPosts,
            followers: this.followers.toJSON(),
            credibility: this.credibility.toJSON()
        };
    }
}

class Study {
    name; // String
    description; // String
    introduction; // String
    prompt; // String
    length; // Number
    debrief; // String
    genCompletionCode; // Boolean
    maxCompletionCode; // Number
    sources; // Source[]

    constructor(name, description, introduction, prompt, length, debrief,
                genCompletionCode, maxCompletionCode) {

        doTypeCheck(name, "string");
        doTypeCheck(description, "string");
        doTypeCheck(introduction, "string");
        doTypeCheck(prompt, "string");
        doTypeCheck(length, "number");
        doTypeCheck(debrief, "string");
        doTypeCheck(genCompletionCode, "boolean");
        doTypeCheck(maxCompletionCode, "number");

        this.name = name;
        this.description = description;
        this.introduction = introduction;
        this.prompt = prompt;
        this.length = length;
        this.debrief = debrief;
        this.genCompletionCode = genCompletionCode;
        this.maxCompletionCode = maxCompletionCode;
        this.sources = [];
    }

    addSource(source) {
        doTypeCheck(source, Source);
        this.sources.push(source);
    }
}


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

    source: {
        firstRow: 16,
        lastRow: 999,
        worksheet: "Sources",
        valueColumns: ["D", "E", "F", "G", "H", "I", "J"],
        id: new WorkbookColumn("ID", "Sources", "C", ExcelString),
        name: new WorkbookColumn("Name", "Sources", "D", ExcelString),
        avatar: new WorkbookColumn("Avatar", "Sources", "E", ExcelImage),
        maxPosts: new WorkbookColumn("Max Posts", "Sources", "F", ExcelNumber),
        followersMean: new WorkbookColumn("Followers Mean", "Sources", "G", ExcelNumber),
        followersStdDev: new WorkbookColumn("Followers Std. Deviation", "Sources", "H", ExcelNumber),
        credibilityMean: new WorkbookColumn("Credibility Mean", "Sources", "I", ExcelNumber),
        credibilityStdDev: new WorkbookColumn("Credibility Std. Deviation", "Sources", "J", ExcelNumber),
    }
}

function readStudyWorkbookV1(workbook) {
    const study = new Study(
        readCell(workbook, Version1.name),
        readCell(workbook, Version1.description),
        readCell(workbook, Version1.introduction),
        readCell(workbook, Version1.prompt),
        readCell(workbook, Version1.length),
        readCell(workbook, Version1.debrief),
        readCell(workbook, Version1.genCompletionCode),
        readCell(workbook, Version1.maxCompletionCode)
    );

    for (let row = Version1.source.firstRow; row <= Version1.source.lastRow; ++row) {
        // Skip blank rows.
        let allBlank = true;
        for (let colIndex = 0; colIndex < Version1.source.valueColumns.length; ++colIndex) {
            const address = Version1.source.valueColumns[colIndex] + row;
            const loc = new WorkbookLoc(address, Version1.source.worksheet, address, ExcelString);
            if (!isCellBlank(workbook, loc)) {
                allBlank = false;
            }
        }
        if (allBlank)
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

        study.addSource(new Source(
            readCell(workbook, Version1.source.id.row(row)) ,
            readCell(workbook, Version1.source.name.row(row)),
            Avatar.fromExcelImage(readCell(workbook, Version1.source.avatar.row(row))),
            readCell(workbook, Version1.source.maxPosts.row(row)),
            followers, credibility
        ));
    }
    return study;
}

export function readStudyWorkbook(workbook) {
    const version = readCell(workbook, versionCell);

    if (version === 1) {
        return readStudyWorkbookV1(workbook);
    } else {
        throw new Error("Unknown version ")
    }
}
