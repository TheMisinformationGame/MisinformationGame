//file wil get the posts objects from firestore and make them ready for DOM manipulations 
//======= BOILERPLATE CODE ===========================================================
import firebase from './firebase'
import db from './initFirestore'
db.settings({ timestampsInSnapshots: true }); 
//====================================================================================


//testing function to make sure that the correct data from the firestore is getting retrieved
function logDocs(doc){
    let Headline = doc.data().Headline;
    console.log(Headline)
    //Headline.textContent = doc.data().Headline;
    //console.log(Headline)
};


//function gets the contents of the db and makes a console log of the data 
export default function getPosts(dbname){ 
    dbname.collection('Posts').get().then( snapshot => {
        snapshot.docs.forEach(doc =>{
            logDocs(doc)
        })
    })
}
