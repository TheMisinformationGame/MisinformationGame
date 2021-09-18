/*=====================================================================================================================
04-09-2021 
File contains functions which are used to get data from the firestore db
The db can be gotten from the initFirestore function
Need to figure out a way to get data from firebase storage
=====================================================================================================================*/
import { db, storage } from "./initFirestore";
import {Study} from "../model/study";
import { ChromeReaderMode } from "@material-ui/icons";



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
    const tempDoc = [];
    const studiesCol = db.collection('Studies');
    studiesCol.get().then((snapshot) => {
        snapshot.forEach((doc) => {
            tempDoc.push({id: doc.id, data: doc.data()});
        })
    });
    return(tempDoc);
};

// get images from the storage
export function getImagesAndPopulate(path, tagID){
    var pathref = storage.ref(path);
    //return the url of the imag
    pathref.getDownloadURL().then((url) => {
        var response = new XMLHttpRequest();
        response.responseType = 'blob';
        response.onload = (event) => {
            var imageURL = response.response;
        }
    response.open('GET', url);
    response.send();
    //populate the DOM
    var img = document.getElementById(tagID);
    img.setAttribute('src', url)
    });
};