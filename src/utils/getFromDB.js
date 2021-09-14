/*=====================================================================================================================
04-09-2021 
File contains functions which are used to get data from the firestore db
The db can be gotten from the initFirestore function
=====================================================================================================================*/
import firebase from './firebase'
import { db } from './initFirestore'
import { Post } from '../model/study'
db.settings({ timestampsInSnapshots: true }); 


//function gets the study data from the db
export function getStudySettings(db, studyID){
    db.collection('Studies').doc(studyID).get().then( snapshot => {
        console.log(snapshot); //temp code
    })
};

//function gets a list of all the studyIDs so that the user can pick one is active
export function getStudiesIDs(db){
    let studiesCol = db.collection('Studies');
    let snapshot = await studiesCol.get();
    let studiesList = []

    snapshot.forEach(doc => {
        studiesList.push(doc.id)
    })

    console.log(studiesList) //temporary code
}