import {
    ExcelNumber, readCell, WorkbookLoc
} from "../utils/excel";
import {readV1Study} from "./studyExcelReaderV1";


const versionCell = new WorkbookLoc("Version", "About", "M2", ExcelNumber);

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
