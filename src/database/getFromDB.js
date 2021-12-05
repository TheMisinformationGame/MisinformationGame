/*
 * This file contains functions to retrieve data from
 * the Firestore Database, and from Firebase Storage.
 */

import {auth, db, storage} from "./firebase";
import {BrokenStudy, Study} from "../model/study";
import {StudyImage} from "../model/images";
import {Game} from "../model/game";


/**
 * Tries to load a study from the given JSON.
 * However, if it fails a stub study will be returned.
 */
function studyOrBrokenFromJson(studyID, json) {
    try {
        return Study.fromJSON(studyID, json);
    } catch (e) {
        console.error(e);
        return BrokenStudy.fromJSON(studyID, json, e.message);
    }
}


/**
 * Returns a Promise for the study metadata for the study {@param studyID}
 * to be read from the database.
 */
export async function readStudySettings(studyID) {
    return new Promise((resolve, reject) => {
        db.collection('Studies').doc(studyID).get().then(snapshot => {
            if (!snapshot.exists) {
                reject(new Error("Could not find the study with ID " + studyID));
                return;
            }
            resolve(studyOrBrokenFromJson(studyID, snapshot.data()));
        }).catch(error => {
            if (error.code === "permission-denied") {
                reject(new Error("This study has been disabled."));
                return;
            }
            reject(error);
        })
    });
}

/**
 * Returns a Promise with a list of all the studies in the database.
 * TODO : In the future, it may be good to use pages, as if the number of studies
 *        becomes really large, this will become very costly.
 */
export async function readAllStudies() {
    if (!auth.currentUser)
        throw new Error("User is not authenticated");

    const snapshot = await db.collection('Studies')
                             .where("authorID", "==", auth.currentUser.uid).get();
    return snapshot.docs.map((doc) => studyOrBrokenFromJson(doc.id, doc.data()));
}

/**
 * Returns a Promise with whether the current user is an admin.
 */
export async function readIsAdmin() {
    if (!auth.currentUser)
        throw new Error("User is not authenticated");

    const snapshot = await db.collection("Admins").doc(auth.currentUser.uid).get();
    return snapshot.exists;
}

function getStudyImagePathType(path) {
    const pieces = path.split(".");
    if (pieces.length === 1)
        throw new Error("Path is missing its extension");

    return pieces[pieces.length - 1];
}

/**
 * Returns a promise to a StudyImage loaded from Firebase Storage at the path {@param path}.
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

/**
 * Reads all of the results of the study with ID {@param studyID}
 * into an Array of Game objects.
 *
 * If any errors are encountered, the session IDs of the errored
 * results will be added to the map {@param problems}.
 */
export async function readAllCompletedStudyResults(studyID, problems) {
    if (!auth.currentUser)
        throw new Error("User is not authenticated");

    const games = [];
    const snapshot = await db.collection("Studies").doc(studyID)
                             .collection("Results").get();
    for(let index = 0; index < snapshot.docs.length; ++index) {
        const doc = snapshot.docs[index];
        const json = doc.data();
        try {
            games.push(Game.fromJSON(json));
        } catch (err) {
            // Try fetch the participant ID to include.
            let participantID;
            try {
                participantID = json["participant"]["participantID"];
            } catch (err) {
                participantID = null;
            }

            problems[doc.id] = {
                participantID: participantID,
                error: err.message
            };
            console.error(err);
        }
    }
    return games;
}
