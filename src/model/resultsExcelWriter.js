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
import {Game} from "../model/game";
const XLSX = require("exceljs");

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

    results_workbook.SheetNames.push("Results");
    //iterate through each document in the collection
    for(let docNum = 0; docNum < totalDocLen; i++ ){
        //loop through each response
        for(let i = 0; i < object.state.length; i++){
            //get the information to be populated


        }
    };


    /**
     * Export the work book
     */


};

//send the workbook to the client
async function sendWorkbook(workbook, response, fileName){
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

     await workbook.XLSX.write(response);

    response.end();
}

//get the results object from firestore
export function getResultsObject(studyID){
    db.collection("studies").doc(studyID).collection("Results").get().then((querySnapshot) => {
        const FULL_DATA = [];
        querySnapshot.forEach(doc => {
            let docJSON = Game.fromJSON(doc);
            FULL_DATA.push(docJSON);
        });
        constructWorkbook(studyID, FULL_DATA);
    }).catch((error) =>{
        console.log("Error getting results data for study: " + studyID);
        console.log(error);
    });
};

//Class for all of the results in the studies
export class AllResults{

}