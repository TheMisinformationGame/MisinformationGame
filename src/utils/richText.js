/**
 * An error that is thrown when the value in a cell does
 * not match the type of value that is expected.
 */
import {doTypeCheck, isOfType} from "./types";

export class RichTextParseError extends Error {
    constructor(message) {
        super("Unable to convert formatted text to HTML: " + message);
    }
}

const BASELINE_FONT_SIZE = 11;


/**
 * Represents a single uniformly formatted piece of text within a rich text component.
 */
class RichTextPiece {
    text; // String
    cssParams; // Dict[String, String]

    constructor(text, cssParams) {
        doTypeCheck(text, "string", "Rich Text Content");
        doTypeCheck(cssParams, "object", "Rich Text Styling");

        this.text = text;
        this.cssParams = cssParams;
    }

    /**
     * Takes a list of RichTextPieces and combines adjacent items in the
     * list that have the same styling.
     */
    static combineAdjacent(pieces) {
        const newPieces = [];
        let currentPiece = null;
        for (let index = 0; index < pieces.length; ++index) {
            const piece = pieces[index];
            if (currentPiece === null) {
                currentPiece = piece;
                continue;
            }

            if (currentPiece.hasSameStyling(piece)) {
                currentPiece = RichTextPiece.combine(currentPiece, piece);
            } else {
                newPieces.push(currentPiece);
                currentPiece = piece;
            }
        }
        if (currentPiece !== null) {
            newPieces.push(currentPiece);
        }
        return newPieces;
    }

    /**
     * Combines the two given RichTextPieces into a single RichTextPiece
     * with the concatenated contents of {@param one} and {@param two},
     * and the styling of {@param one}.
     */
    static combine(one, two) {
        return new RichTextPiece(
            one.text + two.text,
            one.cssParams
        );
    }

    /**
     * Returns true if the styling of this RichTextPiece and the
     * RichTextPiece other are the same.
     */
    hasSameStyling(other) {
        doTypeCheck(other, RichTextPiece, "Other Rich Text Piece");
        if (this.cssParams === other.cssParams)
            return true

        let keyCount = 0;
        for (let key in this.cssParams) {
            if (!this.cssParams.hasOwnProperty(key))
                continue;
            if (!other.cssParams.hasOwnProperty(key))
                return false;

            keyCount += 1;
            if (this.cssParams[key] !== other.cssParams[key])
                return false
        }

        let otherKeyCount = 0;
        for (let key in other.cssParams) {
            if (other.cssParams.hasOwnProperty(key)) {
                otherKeyCount += 1;
            }
        }
        return keyCount === otherKeyCount;
    }
}


/**
 * Converts an ExcelJS font object to a CSS key-value dictionary.
 */
function convertFontToCSSParams(font) {
    const cssParams = {};
    if (!font)
        return cssParams;

    if (font["size"]) {
        const relative = font["size"] / BASELINE_FONT_SIZE;
        if (relative !== 1) {
            cssParams["font-size"] = relative + "em";
        }
    }
    if (font["italic"]) {
        cssParams["font-style"] = "italic";
    }
    if (font["bold"]) {
        cssParams["font-weight"] = "bold";
    }
    if (font["strike"]) {
        cssParams["text-decoration"] = "line-through";
    }
    if (font["underline"]) {
        cssParams["text-decoration"] = "underline";
    }
    if (font["color"] && typeof font["color"] === "object") {
        const argb = font["color"]["argb"];
        if (argb && typeof argb === "string" && argb.length === 8) {
            const a = parseInt(argb.substring(0, 2), 16) / 255.0;
            const r = parseInt(argb.substring(2, 4), 16);
            const g = parseInt(argb.substring(4, 6), 16);
            const b = parseInt(argb.substring(6, 8), 16);
            if (r !== 0 || g !== 0 || b !== 0 || a !== 1) {
                cssParams["color"] = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            }
        }
    }
    return cssParams;
}


/**
 * Converts an ExcelJS piece to a RichTextPiece.
 */
function convertExcelJSPieceToRichTextPiece(piece, index) {
    if (!piece)
        throw new RichTextParseError("Null or undefined piece at index " + index + ".");
    if (!isOfType(piece, "object")) {
        throw new RichTextParseError(
            "Piece at index " + index + " is not an object, " + JSON.stringify(piece));
    }

    const text = piece["text"];
    if (!text)
        throw new RichTextParseError("Piece at index " + index + " is missing its text.");
    if (!isOfType(text, "string")) {
        throw new RichTextParseError(
            "The text of the piece at index " + index + " is not a string, " + JSON.stringify(text));
    }

    const cssParams = convertFontToCSSParams(piece["font"]);
    return new RichTextPiece(text, cssParams);
}


/**
 * Constructs a CSS inline-styles string from a CSS params dictionary.
 */
function constructCSS(params) {
    let css = "";
    for (let key in params) {
        if (!params.hasOwnProperty(key))
            continue;

        if (css.length > 0) {
            css += ";";
        }
        css += key + ": " + params[key];
    }
    return css;
}


/**
 * Returns a list containing the contents of each line
 * in the given text. This attempts to be smart about
 * not inserting newlines around HTML elements.
 */
function breakLines(text) {
    const excelLines = text.split("\n");
    const lines = [];
    let currentLine = null;
    for (let index = 0; index < excelLines.length; ++index) {
        const line = excelLines[index];
        if (currentLine === null) {
            currentLine = line;
            continue;
        }

        // Imperfect HTML open/close tag detection.
        const prevIsOpenAtEnd = /<[^/\n][^\n<>]*>\s*$/.test(currentLine);
        const prevIsCloseAtEnd = /<\/[^\n<>]*>\s*$/.test(currentLine);
        const isOpenAtStart = /^\s*<[^/\n][^\n<>]*>/.test(line);
        const isCloseAtStart = /^\s*<\/[^\n<>]*>/.test(line);

        if (!prevIsOpenAtEnd && !prevIsCloseAtEnd && !isOpenAtStart && !isCloseAtStart) {
            lines.push(currentLine);
            currentLine = line;
        } else {
            // Concatenate lines around HTML.
            if (isOpenAtStart || prevIsCloseAtEnd) {
                currentLine += " ";
            }
            currentLine += line;
        }
    }
    if (currentLine !== null) {
        lines.push(currentLine);
    }
    return lines;
}


export function convertRichTextPieceToHTML(richTextPiece) {
    const css = constructCSS(richTextPiece.cssParams);
    let html = "";

    // Only surround text in a <span> when required.
    // This is helpful when including HTML in the text.
    if (css.length > 0) {
        html += "<span style=\"" + css + "\">"
    }

    const lines = breakLines(richTextPiece.text);
    for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
        if (lineIndex > 0) {
            html += "<br/>";
        }
        html += lines[lineIndex];
    }

    if (css.length > 0) {
        html += "</span>";
    }
    return html;
}


/**
 * Converts Google Sheets rich text to HTML for displaying
 * in the browser.
 */
export function convertRichTextToHTML(richText, themeColours) {
    const excelPieces = richText["richText"];
    if (!excelPieces)
        throw new RichTextParseError("Missing 'richText' attribute.");
    if (!isOfType(excelPieces, Array))
        throw new RichTextParseError("'richText' attribute is not an array.");

    let pieces = [];
    for (let index = 0; index < excelPieces.length; ++index) {
        pieces.push(convertExcelJSPieceToRichTextPiece(excelPieces[index], index));
    }
    pieces = RichTextPiece.combineAdjacent(pieces);

    let html = "";
    for (let index = 0; index < pieces.length; ++index) {
        const piece = pieces[index];
        html += convertRichTextPieceToHTML(piece);
    }
    return html;
}


/**
 * Converts the plain text to HTML.
 * This just involves adding line breaks.
 */
export function convertPlainTextToHTML(text) {
    const plainRichTextPiece = new RichTextPiece(text, {});
    return convertRichTextPieceToHTML(plainRichTextPiece);
}
