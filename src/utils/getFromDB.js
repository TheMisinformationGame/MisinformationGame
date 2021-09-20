/*=====================================================================================================================
04-09-2021 
File contains functions which are used to get data from the firestore db
The db can be gotten from the initFirestore function
Need to figure out a way to get data from firebase storage
=====================================================================================================================*/
import { db, storage } from "./initFirestore";
import {Study} from "../model/study";
import {StudyImage} from "../model/images";



/**
 * Returns a Promise for the study metadata for the study {@param studyID}
 * to be read from the database.
 */
export async function readStudySettings(studyID) {
    const snapshot = await db.collection('Studies').doc(studyID).get();
    if (!snapshot.exists)
        throw new Error("Could not find the study with ID " + studyID);

    return Study.fromJSON(studyID, snapshot.data());
}

/**
 * Returns a Promise with a list of all the studies in the database.
 * TODO : In the future, it may be good to use pages, as if the number of studies
 *        becomes really large, this will become very costly.
 */
export async function readAllStudies() {
    const snapshot = await db.collection('Studies').get();
    return snapshot.docs.map((doc) => Study.fromJSON(doc.id, doc.data()));
}

function getStudyImagePathType(path) {
    const pieces = path.split(".");
    if (pieces.length === 1)
        throw new Error("Path is missing its extension");

    return pieces[pieces.length - 1];
}

/**
 * Returns a StudyImage loaded from Firebase storage.
 */
export async function readStudyImage(path) {
    const type = getStudyImagePathType(path);
    const url = await storage.ref(path).getDownloadURL();
    return await new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = () => {
            const response = request.response;
            if (response) {
                resolve(new StudyImage(new Uint8Array(response), type));
            } else {
                reject(new Error("Missing response when loading StudyImage from " + path));
            }
        };
        request.onerror = () => {
            reject(new Error(
                "Could not load StudyImage from " + path +
                (request.status ? " (" + request.status + ")" : "") +
                (request.statusText ? ": " + request.statusText : "")
            ));
        };
        request.send(null);
    });
}
