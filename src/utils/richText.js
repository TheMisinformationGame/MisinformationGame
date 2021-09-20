/**
 * An error that is thrown when the value in a cell does
 * not match the type of value that is expected.
 */
import {isOfType} from "./types";

export class RichTextParseError extends Error {
    constructor(message) {
        super("Unable to convert formatted text to HTML: " + message);
    }
}


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

const BASELINE_FONT_SIZE = 11;

/**
 * Converts Google Sheets rich text to HTML for displaying
 * in the browser.
 */
export function convertRichTextToHTML(richText, themeColours) {
    const pieces = richText["richText"];
    if (!pieces)
        throw new RichTextParseError("Missing 'richText' attribute.");
    if (!isOfType(pieces, Array))
        throw new RichTextParseError("'richText' attribute is not an array.");

    let html = "";
    for (let index = 0; index < pieces.length; ++index) {
        const piece = pieces[index];
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

        const font = piece["font"];
        if (!font) {
            html += text;
            continue;
        }

        const cssParams = {};
        if (font["size"]) {
            cssParams["font-size"] = (font["size"] / BASELINE_FONT_SIZE) + "em";
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
                cssParams["color"] = "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
            }
        }
        const css = constructCSS(cssParams);

        const lines = text.split("\n");
        for (let lineIndex = 0; lineIndex < lines.length; ++lineIndex) {
            if (lineIndex > 0) {
                html += "<br/>";
            }
            if (lines[lineIndex].length > 0) {
                html += "<span style=\"" + css + "\">"
                html += lines[lineIndex];
                html += "</span>";
            }
        }
    }
    return html;
}
