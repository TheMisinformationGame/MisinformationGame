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

export function constructWorkbook(studyID, object){
    var results_workbook = XLSX.utils.book_new();

    results_workbook.Props = {
        Title: object.study.study.id + " Results Workbook",
        Subject: object.study.study.description,
        OutputDate: new Date.now()
    };

    /**
     * Write the home page content
     */ 
    results_workbook.SheetNames.push("Cover Page");
    var home_row1 = ["Study", object.study.study.id];
    var home_row2 = ['Description', object.study.study.description];
    var home_row3 = ['Date Outputted', Date.Now().toString()]; 
    
    var home_content = XLSX.utils.aoa_to_sheet([
        home_row1, 
        home_row2, 
        home_row3
    ]);

    results_workbook.Sheets["Cover Page"] = home_content
    
    /**
     * Write the Results page
     */

    /**
     * Export the work book
     */

    
}