
//======== NOTES =====================================================================
//01/09/2021[DL] This code can be editted when we have more defined structure
//====================================================================================
//file wil get the posts objects from firestore and make them ready for DOM manipulations 







//testing function to make sure that the correct data from the firestore is getting retrieved
function logDocs(doc){
    //example as a proof of concept
    let Headline = doc.data().Headline;
    let ID = doc.data().ID;
    let isTrue = doc.data().isTrue;

    console.log(typeof(ID))
    
    //need to construct the class object with data
    //var docObject = new Post(ID, Headline, "ok", isTrue, 1, 1, []);
};


//function gets the contents of the db and makes a console log of the data 
export default function getPosts(dbname){ 
    dbname.collection('Posts').get().then( snapshot => {
        snapshot.docs.forEach(doc =>{
            logDocs(doc) //example function which console logs the document header
        })
    })
}
