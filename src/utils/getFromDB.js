/*=====================================================================================================================
04-09-2021 
File contains functions which are used to get data from the firestore db
The db can be gotten from the initFirestore function
Need to figure out a way to get data from firebase storage
=====================================================================================================================*/
import { db } from "./initFirestore"
import {Study} from "../model/study";


/**
 * Returns a Promise for the study metadata for the study {@param studyID}
 * to be read from the database.
 */
export function readStudySettings(studyID) {
    return db.collection('Studies').doc(studyID).get().then((snapshot) => {
        if (!snapshot.exists)
            throw new Error("Could not find the study with ID " + studyID);

        return Study.fromJSON(snapshot.data());
    });
}

//function gets a list of all the studyIDs so that the user can pick one is active
export function getStudiesIDs(db){
    let studiesCol = db.collection('Studies');
    let snapshot = studiesCol.get();
    let studiesList = []

    //to do get each document id into a list
    snapshot.forEach(doc => {
        studiesList.push(doc.id)
    })

    return(studiesList)//temporary code
};

// function will get alll th eposts from a particular study
/*export function getPosts()

}*/