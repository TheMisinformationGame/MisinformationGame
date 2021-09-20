/*=====================================================================================================================
04-09-2021 
File contains functions which are used to post data to the firestore db
=====================================================================================================================*/
import {db, storageRef} from './initFirestore';
import {StudyImage} from "../model/images";

//after reading the excel sheet this function should post the object to the database
export function postStudy(object, studyID){
    console.log(object);
    let studyCol = db.collection("Studies");
    let studyDoc = studyCol.doc(studyID);  //saves the study and auto populates the id
    studyDoc.set(object);
}

//upload images to firebase storage
export function uploadImageToStorage(studyID, imageID, image) {
    const path = StudyImage.getPath(studyID, imageID, image.toMetadata());
    storageRef.child(path).put(image.buffer).then(( snapshot => {
        console.log("Uploaded " + path);
    }));
    // TODO : Error handling
}


//send the object which contains all of the reactions to the post
export function postReacts(object, participantID){
    let userCol = db.collection("Participants");
    let participantDoc = userCol.doc(participantID);
    participantDoc.update({'Study results': object, 'Completion Status': true });
}

//mTurk ID to be inserted into the study from qualtrics
//This function makes a document for new participants
export function postParticipant(object, participantID){
    let userCol = db.collection("Participants");
    userCol.doc(participantID).set(object); //saves the participant and assigns them a new name
}
