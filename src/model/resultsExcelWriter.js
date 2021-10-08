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
import { db } from "../database/firebase"
import { SaveAltSharp } from "@material-ui/icons";
import FileSaver from 'file-saver';

const excel = require("exceljs");



export function constructWorkbook(studyID, object){
    console.log("Constructing Workbook");
    const RESULTS_WORKBOOK = new excel.Workbook();
    const object2 = object[0];

    /**
     * Write the home page content
     * [DL] will like to add more information in the future
     */ 
    console.log("constructing cover page");
    const COVER_WS = RESULTS_WORKBOOK.addWorksheet("Cover Page");
    
    COVER_WS.columns = [
        {header : "Study", key : "studyCol"},
        {header : "Description", key : "desc"},
        {header : "Date Outputted", key : "date"}
    ];

    COVER_WS.addRow([
        object2.study.id,
        object2.study.description,
        Date.now().toString()
    ]);

    
    /**
     * Write the Results page
     */
    console.log('constructing results');
    const RESULTS_WS = RESULTS_WORKBOOK.addWorksheet("Results");
    const ALL_ROWS = [];      //array where all construct rows will get pushed
    const TOTAL_DOCS = object.length;
    
    RESULTS_WS.columns = [
        {header : "participantID", key: "participantID"},
        {header : "sessionID", key: "sessionID"},
        {header : "studyID", key: "studyID"},
        {header : "postOrder", key: "postOrder"},
        {header : "postID", key: "postID"},
        {header : "postLikes", key: "postLikes"},
        {header : "sourceID", key: "sourceID"},
        {header : "sourceFollowers", key: "sourceFollowers"},
        {header : "sourceCredibility", key: "sourceCredibility"},
        {header : "reaction", key: "reaction"},
        {header : "credibilityChange", key: "credibilityChange"},
        {header : "followerChange", key: "followerChange"},
        {header : "beforeCredibility", key: "beforeCredibility"},
        {header : "afterCredibility", key: "afterCredibility"},
        {header : "beforeFollowers", key: "beforeFollowers"},
        {header : "afterFollowers", key: "afterFollowers"},
        {header : "responseTime", key: "responseTime"}
    ];

    console.log("constructing results rows");
    //iterate through each document in the collection and then iterate through each response
    //each response is a row in the sheet
    for(let docNum = 0; docNum < TOTAL_DOCS; docNum++ ){
        let doc = object[docNum];                   //this is the game object
        //loop through each response
        let NUM_RESPONSES = doc.states.length;
        for(let i = 0; i < NUM_RESPONSES; i++){
            //get the information to be populated
            let participantID = doc.participant.participantID;                 
            let sessionID = doc.sessionID;
            let studyID = doc.study.id;
            let postOrder = i;
            let postID = doc.states[i].currentPost.post.id;
            let postLikes = "N/A";            //TEMP CODE. NOT STORED
            let sourceID = doc.states[i].currentSource.source.id;
            let sourceFollowers = Math.floor(doc.states[i].currentSource.followers);
            let sourceCredibility = Math.floor(doc.states[i].currentSource.credibility);
            let reaction = doc.participant.reactions[i];
            let beforeCredibility = Math.floor(doc.participant.credibilityHistory[i-1]);
            let afterCredibility = Math.floor(doc.participant.credibilityHistory[i]);
            let beforeFollowers = Math.floor(doc.participant.followerHistory[i-1]);
            let afterFollowers = Math.floor(doc.participant.followerHistory[i]);
            let credibilityChange = Math.floor(afterCredibility - beforeCredibility);
            let followerChange = Math.floor(afterFollowers - beforeFollowers);
            let responseTime = "N/A";         //Temp code not yet stored
            //construct the row
            let row = [
                participantID, sessionID, studyID, postOrder, postID, postLikes, sourceID, 
                sourceFollowers, sourceCredibility, reaction, credibilityChange, followerChange,
                beforeCredibility, afterCredibility, beforeFollowers, afterFollowers, responseTime
            ];
            //push the constructed row to the ALL_ROWS 
            ALL_ROWS.push(row);
        }
    };
    console.log("Add rows to worksheet");
    ALL_ROWS.forEach((row) =>{
        RESULTS_WS.addRow(row)
    });


    /**
     * Export the work book
     */
    console.log("workbook ready");

    const download = async () => {
        try{
            const buffer = await RESULTS_WORKBOOK.xlsx.writeBuffer();
            const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
            const blob= new Blob([buffer]);
            FileSaver(blob, "results.xlsx");
            console.log("Worksheet Downloaed")
        } catch(err) {
        console.log(err)
        }
    };
    

    download();
};

//send the workbook to the client
async function sendWorkbook(workbook, response, fileName){
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader("Content-Disposition", "attachment; filename=" + fileName);

     await workbook.XLSX.write(response);

    response.end();
}

//get the results object from firestore
//need to refactor in the getFromDB file
export async function getResultsObject(studyID){
    try{
        
        const FULL_DATA = async ()  => {
            var array_data = []
            const DATA = await db.collection("Studies").doc(studyID).collection("Results").get();
            for(let doc of DATA.docs){
                let docJSON = Game.fromJSON(doc.data());
                array_data.push(docJSON);
            };
            return(array_data)
        }
        constructWorkbook(studyID, await FULL_DATA());
    } catch(err){
        console.log("Error getting results data for study: " + studyID);
        console.log(err);
    }
};

