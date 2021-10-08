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
const excel = require("exceljs");

export function constructWorkbook(studyID, object){
    const RESULTS_WORKBOOK = new excel.Workbook();

    /**
     * Write the home page content
     * [DL] will like to add more information in the future
     */ 
    const COVER_WS = RESULTS_WORKBOOK.addWorksheet("Cover Page");
    
    COVER_WS.columns = [
        {header : "Study", key : "studyCol"},
        {header : "Description", key : "desc"},
        {header : "Date Outputted", key : "date"}
    ];

    COVER_WS.addRow([
        object.study.study.id,
        object.study.study.description,
        Date.Now().toString()
    ]);

    
    /**
     * Write the Results page
     */
    const RESULTS_WS = RESULTS_WORKBOOK.addWorksheet("Results");
    const ALL_ROWS = [];      //array where all construct rows will get pushed
    const TOTAL_DOCS = object.length;
    
    RESULTS_WORKBOOK.columns = [
        {header = "participantID", key: "participantID"},
        {header = "sessionID", key: "sessionID"},
        {header = "studyID", key: "studyID"},
        {header = "postOrder", key: "postOrder"},
        {header = "postID", key: "postID"},
        {header = "postLikes", key: "postLikes"},
        {header = "sourceID", key: "sourceID"},
        {header = "sourceFollowers", key: "sourceFollowers"},
        {header = "sourceCredibility", key: "sourceCredibility"},
        {header = "reaction", key: "reaction"},
        {header = "credibilityChange", key: "credibilityChange"},
        {header = "followerChange", key: "followerChange"},
        {header = "beforeCredibility", key: "beforeCredibility"},
        {header = "afterCredibility", key: "afterCredibility"},
        {header = "beforeFollowers", key: "beforeFollowers"},
        {header = "afterFollowers", key: "afterFollowers"},
        {header = "responseTime", key: "responseTime"}
    ];


    //iterate through each document in the collection and then iterate through each response
    //each response is a row in the sheet
    for(let docNum = 0; docNum < TOTAL_DOCS; i++ ){
        let doc = Object[docNum];                   //this is the game object
        //loop through each response
        let NUM_RESPONSES = doc.state.length;
        for(let i = 0; i < NUM_RESPONSES; i++){
            //get the information to be populated
            let participantID = doc.participant.participantID;                 
            let sessionID = doc.sessionID;
            let studyID = studyID;
            let postOrder = i;
            let postID = doc.states[i].currentPost.postID;
            let postLikes = 9999999999;            //TEMP CODE. NOT STORED
            let sourceID = doc.states[i].currentSource.source.id;
            let sourceFollowers = doc.states[i].currentSource.followers;
            let sourceCredibility = doc.states[i].currentSource.credibility;
            let reaction = doc.participant.reactions[i];
            let credibilityChange = doc.states[i].currentPost.post.changesToCredibility;
            let followerChange = doc.states[i].currentPost.post.changesToFollowers;
            let beforeCredibility = doc.participant.credibilityHistory[i-1];
            let afterCredibility = doc.participant.credibilityHistory[i];
            let beforeFollowers = doc.participant.followerHistory[i-1];
            let afterFollowers = doc.participant.followerHistory[i-1];
            let responseTime = 99999999999;         //Temp code not yet stored
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
    RESULTS_WS.addRows(ALL_ROWS);
    /**
     * Export the work book
     */
    RESULTS_WORKBOOK
        .xlsx
        .writeFile(studyID.toString() + "_" + Date.Now().toString()+".xlsx")
        .then(()=> {
            console.log("Worksheet Downloaed")
        }).catch((err)=>{
            console.log(err)
        });
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
