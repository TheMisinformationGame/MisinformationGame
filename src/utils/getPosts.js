//function wil get the posts from firestore and make them ready for DOM manipulations 
import firebase from './firebase'
import db from './initFirestore'


db.settings({ timestampsInSnapshots: true }); 

//function gets the contents of the db and makes a console log of the data 
function getPosts(){ 
    db.collection('Posts').get().then( snapshot => {
        console.log(snapshot);
    }
};