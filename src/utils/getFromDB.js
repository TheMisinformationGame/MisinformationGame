/*=====================================================================================================================
04-09-2021 
File contains functions which are used to get data from the firestore db
The db can be gotten from the initFirestore function
Need to figure out a way to get data from firebase storage
=====================================================================================================================*/
import firebase from './firebase'
import { db } from './initFirestore'
import { Post } from '../model/study'


//function gets the study data from the db
export function getStudySettings(studyID){
    let snap = db.collection('Studies').doc(studyID).get();
    return(snap)
};

//function gets a list of all the studyIDs so that the user can pick one is active
/*export function getStudiesIDs(db){
    let studiesCol = db.collection('Studies');
    let snapshot = studiesCol.get();
    let studiesList = []

    snapshot.forEach(doc => {
        studiesList.push(doc.id)
    })

    console.log(studiesList) //temporary code
};

// function will get alll th eposts from a particular study
export function getPosts(){

}*/