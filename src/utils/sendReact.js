//Function will save the reaction of the user and then save it in the db
import firebase from './firebase'
import db from './initFirestore'

//===========================================================================
//01/09/2021[DL] This code can be editted when we have more defined structure
//===========================================================================
export function postReact(participantID, postID, reactType){
    let userCol = db.collection("Participants");
    let reactCol = userCol.doc(participantID).collection("Reactions");

    //create a new document in the collection and store the set reactions
    reactCol.doc().set({
        postID: postID, 
        reactionType: reactType
    })
}