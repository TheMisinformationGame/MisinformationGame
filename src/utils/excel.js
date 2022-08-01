import {doNonNullCheck, doTypeCheck, isOfType} from "./types";
import {convertPlainTextToHTML, convertRichTextToHTML} from "./richText";

const Excel = require("exceljs");

export class ExcelType {
    exceljsType; // Excel.ValueType
    name; // String

    constructor(exceljsType, name) {
        doNonNullCheck(exceljsType, "Excel Type's corresponding Excel.js ValueType");
        doTypeCheck(name, "string", "Excel Type Name");

        this.exceljsType = exceljsType;
        this.name = name;
    }

    /**
     * Raises a type error that the value in the given location was expected
     * to be of this type, but it wasn't able to be coerced to this type.
     */
    raiseTypeError(loc, cell) {
        throw new CellTypeError(
            "Expected " + loc.address + " (" + loc.name + ") to contain " + loc.type.name +
            ", but instead it contained " + ExcelType.getExcelJSTypeName(cell.type) +
            ": " + JSON.stringify(cell.value)
        );
    }

    /**
     * Attempts to coerce value with the given type to this
     * type, returning undefined if it is not possible.
     */
    coerceType(value, type) {
        return undefined;
    }

    /**
     * Returns the value of the given cell, or undefined if
     * the cell does not contain a value that is compatible
     * with this type.
     */
    readCellValue(cell) {
        if (cell.type === this.exceljsType)
            return cell.value;

        return this.coerceType(cell.value, cell.type);
    }

    static getExcelJSTypeName(exceljsType) {
        doNonNullCheck(exceljsType, "Excel.js ValueType");

        switch (exceljsType) {
            case Excel.ValueType.Null:
                return "nothing";
            case Excel.ValueType.Merge:
                return "a merged cell";
            case Excel.ValueType.Number:
                return "a number";
            case Excel.ValueType.String:
                return "text";
            case Excel.ValueType.Date:
                return "a date";
            case Excel.ValueType.Hyperlink:
                return "a hyperlink"
            case Excel.ValueType.Formula:
                return "a formula";
            case Excel.ValueType.SharedString:
                return "shared text";
            case Excel.ValueType.RichText:
                return "formatted text"
            case Excel.ValueType.Boolean:
                return "a boolean";
            case Excel.ValueType.Error:
                return "an error";
            default:
                return "an unknown type (" + exceljsType + ")";
        }
    }
}

class ExcelStringType extends ExcelType {
    constructor() {
        super(Excel.ValueType.String, "text");
    }

    raiseTypeError(loc, cell) {
        if (cell.type === Excel.ValueType.Hyperlink) {
            throw new CellTypeError(
                "The text within " + loc.address + " (" + loc.name + ") must not contain " +
                "any active hyperlinks. Please unlink the hyperlinks within the text. " +
                "If you wish to include links, there is a guide for this in the " +
                "Study Configuration > Pages documentation."
            );
        }
        super.raiseTypeError(loc, cell);
    }

    coerceType(value, type) {
        if (type === Excel.ValueType.RichText)
            return convertRichTextToHTML(value);
        if (type === Excel.ValueType.Boolean || type === Excel.ValueType.Number || type === Excel.ValueType.Date)
            return String(value);
        return undefined;
    }
}

class ExcelHTMLType extends ExcelStringType {
    readCellValue(cell) {
        if (cell.type === this.exceljsType)
            return convertPlainTextToHTML(cell.value);

        return this.coerceType(cell.value, cell.type);
    }
}

class ExcelBooleanType extends ExcelType {
    constructor() {
        super(Excel.ValueType.Boolean, "a boolean");
    }

    coerceType(value, type) {
        if (type === Excel.ValueType.String) {
            value = value.toUpperCase();
            if ("YES" === value || "TRUE" === value || "Y" === value || "T" === value)
                return true;
            if ("NO" === value || "FALSE" === value || "N" === value || "F" === value)
                return false;
        }
        return super.coerceType(value, type);
    }
}

class ExcelImageType extends ExcelType {
    constructor() {
        super(Excel.ValueType.Null, "an image");
    }

    readCellValue(cell) {
        // We have to search the images in the worksheet to find
        // the image in the given cell.
        const worksheetImages = cell.worksheet.getImages();
        for (let key in worksheetImages) {
            if (!worksheetImages.hasOwnProperty(key))
                continue;

            const imageRef = worksheetImages[key];
            if (imageRef.type !== "image" || !imageRef.range || imageRef.range.editAs !== "oneCell")
                continue;

            const tl = imageRef.range.tl;
            if (!tl || tl.nativeRow + 1 !== cell.row || tl.nativeCol + 1 !== cell.col)
                continue;

            return cell.workbook.getImage(imageRef.imageId);
        }
        return this.coerceType(cell.value, cell.type);
    }
}

class ExcelHTMLOrImageType extends ExcelType {
    imageType = new ExcelImageType();
    textType = new ExcelHTMLType();

    constructor() {
        super(Excel.ValueType.Null, "text or an image");
    }

    readCellValue(cell) {
        const image = this.imageType.readCellValue(cell);
        if (image !== undefined)
            return image;

        return this.textType.readCellValue(cell);
    }
}

/**
 * An limit that can be one of:
 * - An integer that is greater than or equal to zero.
 * - The string "Unlimited" to represent no limit.
 *
 * Evaluates to an integer with the special value -1
 * representing unlimited limits.
 */
class ExcelLimitType extends ExcelType {
    numberType = new ExcelType(Excel.ValueType.Number, "a number");
    textType = new ExcelStringType();

    constructor() {
        super(Excel.ValueType.Number, "a non-negative integer limit, or 'Unlimited'");
    }

    readCellValue(cell) {
        const number = this.numberType.readCellValue(cell);
        if (number !== undefined && Number.isInteger(number) && number >= 0)
            return number;

        const text = this.textType.readCellValue(cell);
        if (text !== undefined && text.toUpperCase() === "UNLIMITED")
            return -1;

        return undefined;
    }
}

export const ExcelString = new ExcelStringType();
export const ExcelHTML = new ExcelHTMLType();
export const ExcelNumber = new ExcelType(Excel.ValueType.Number, "a number");
export const ExcelLimit = new ExcelLimitType();
export const ExcelPercentage = new ExcelType(Excel.ValueType.Number, "a percentage");
export const ExcelBoolean = new ExcelBooleanType();
export const ExcelImage = new ExcelImageType();
export const ExcelHTMLOrImage = new ExcelHTMLOrImageType();


export class WorkbookLoc {
    name; // String
    worksheet; // String
    cell; // String
    type; // ExcelType

    constructor(name, worksheet, cell, type) {
        doTypeCheck(name, "string", "Workbook Location Name");
        doTypeCheck(worksheet, "string", "Workbook Location's Worksheet");
        doTypeCheck(cell, "string", "Workbook Location's Address");
        doTypeCheck(type, ExcelType, "Workbook Location's Type");

        this.name = name;
        this.worksheet = worksheet;
        this.cell = cell;
        this.type = type;
    }

    get address() {
        return this.worksheet + "!" + this.cell;
    }
}

export class WorkbookColumn {
    name; // String
    worksheet; // String
    column; // String
    type; // ExcelType

    constructor(name, worksheet, column, type) {
        doTypeCheck(name, "string", "Workbook Column Name");
        doTypeCheck(worksheet, "string", "Workbook Column's Worksheet");
        doTypeCheck(column, "string", "Workbook Column's Address");
        doTypeCheck(type, ExcelType, "Workbook Column's Type");

        this.name = name;
        this.worksheet = worksheet;
        this.column = column;
        this.type = type;
    }

    row(row) {
        doTypeCheck(row, "number", "Row in Column");
        return new WorkbookLoc(this.name, this.worksheet, this.column + row, this.type);
    }
}


/**
 * An error that is thrown when the value in a cell does
 * not match the type of value that is expected.
 */
export class CellTypeError extends Error {}

/**
 * An error that is thrown when the workbook as a whole
 * contains an error, rather than just one specific cell.
 */
export class WorkbookError extends Error {}

/**
 * Returns the worksheet {@param worksheet} within {@param workbook},
 * throwing a WorkbookError if the worksheet does not exist.
 */
function getWorksheet(workbook, worksheet) {
    let worksheetValue = workbook.getWorksheet(worksheet);
    if (worksheetValue === undefined) {
        // The slash was getting removed from the sheet name,
        // but I'm not convinced that behaviour can be trusted.
        worksheetValue = workbook.getWorksheet(worksheet.replace("/", ""));
        if (worksheetValue === undefined)
            throw new WorkbookError("The spreadsheet is missing the " + worksheet + " worksheet");
    }
    return worksheetValue;
}

function isCellAtLocBlank(workbook, worksheet, cellName) {
    const cell = getWorksheet(workbook, worksheet).getCell(cellName);
    if (cell.type !== Excel.ValueType.Null && cell.type !== Excel.ValueType.Merge)
        return false;

    // Make sure it doesn't contain an image.
    const image = readCellValue(workbook, worksheet, cellName, ExcelImage);
    return image === undefined;
}

/**
 * Returns whether the cell at the given WorkbookLoc is blank.
 */
export function isCellBlank(workbook, loc) {
    return isCellAtLocBlank(workbook, loc.worksheet, loc.cell);
}

/**
 * Returns whether all the cells in the given range of cells is blank.
 * The range is specified as the intersection of the given rows and columns.
 */
export function areCellsBlank(workbook, worksheet, columns, rows) {
    for (let colIndex = 0; colIndex < columns.length; ++colIndex) {
        for (let rowIndex = 0; rowIndex < rows.length; ++rowIndex) {
            const cellName = columns[colIndex] + rows[rowIndex];
            if (!isCellAtLocBlank(workbook, worksheet, cellName))
                return false;
        }
    }
    return true;
}

/**
 * Reads the value in the given cell using the given type.
 */
function readCellValue(workbook, worksheetName, address, type) {
    const cell = getWorksheet(workbook, worksheetName).getCell(address);
    return type.readCellValue(cell);
}

/**
 * Reads the value of the cell at the given location.
 * If the value is missing or not of the expected type,
 * then an error will be thrown.
 */
export function readCell(workbook, loc) {
    doNonNullCheck(workbook, "Study Workbook for Cell");
    doTypeCheck(loc, WorkbookLoc, "Cell's Location in Workbook");

    const value = readCellValue(workbook, loc.worksheet, loc.cell, loc.type);
    if (value === undefined) {
        const cell = getWorksheet(workbook, loc.worksheet).getCell(loc.cell);
        loc.type.raiseTypeError(loc, cell);
    }
    return value;
}

/**
 * Reads the value of the cell at the given location {@param loc}
 * in {@param workbook}. If the cell is blank, this will return
 * {@param defaultValue} instead. If the value is not of the
 * expected type, then an error will be thrown.
 */
export function readCellWithDefault(workbook, loc, defaultValue) {
    if (isCellBlank(workbook, loc))
        return defaultValue;

    return readCell(workbook, loc);
}

/**
 * Converts various buffer types to Uint8Array.
 * This is required as when running from testing,
 * NodeJS will use Buffer objects instead of
 * ArrayBuffer objects.
 */
export function coerceBufferToUint8Array(buf) {
    if (isOfType(buf, Uint8Array))
        return buf;
    if (isOfType(buf, ArrayBuffer))
        return new Uint8Array(buf);
    if (buf.constructor.name === "Buffer") {
        const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
        return new Uint8Array(arrayBuffer);
    }
    throw new Error("Unknown type " + buf.constructor);
}
