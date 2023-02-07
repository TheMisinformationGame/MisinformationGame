/*
 * This file contains functions to retrieve data from
 * the Firestore Database, and from Firebase Storage.
 */

import {auth, db, storage} from "./firebase";
import {BrokenStudy, Study} from "../model/study";
import {StudyImage} from "../model/images";
import {Game} from "../model/game";
import {decompressJson} from "./compressJson";
import {retryPromiseOperation} from "../utils/promises";
import {doc} from "firebase/firestore";
import {collection, getDoc, getDocs, query, where} from "@firebase/firestore";
import {ref, getDownloadURL} from "firebase/storage";


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
        getDoc(doc(collection(db, "Studies"), studyID))
            .then(snapshot => {
                if (!snapshot.exists()) {
                    const err = new Error("Could not find the study with ID " + studyID);
                    reject(err);
                    throw err;
                }

                const json = decompressJson(snapshot.data()),
                      study = studyOrBrokenFromJson(studyID, json);

                resolve(study);
                return study;
            })
            .catch(reason => {
                if (reason.code === "permission-denied") {
                    console.error(reason);
                    const err = new Error("This study has been disabled.");
                    reject(err);
                    throw err;
                }
                reject(reason);
                throw reason;
            })
    });
}

/**
 * Returns a Promise with a list of all the studies in the database.
 * TODO : In the future, it may be good to use pages, as if the number of studies
 *        becomes really large, this will become very costly.
 */
export async function readAllStudies(user) {
    if (!user)
        throw new Error("No user provided");

    const getStudiesQuery = query(collection(db, "Studies"), where("authorID", "==", user.uid));
    const snapshot = await getDocs(getStudiesQuery);
    return snapshot.docs.map((doc) => studyOrBrokenFromJson(doc.id, decompressJson(doc.data())));
}

/**
 * Returns a Promise with whether the current user is an admin.
 */
export async function readIsAdmin(user) {
    if (!user)
        throw new Error("No user provided");

    const snapshot = await getDoc(doc(collection(db, "Admins"), user.uid));
    return snapshot.exists();
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
export function readStudyImage(path) {
    return retryPromiseOperation(readStudyImageInternal.bind(null, path), 1000, 2);
}

async function readStudyImageInternal(path) {
    const type = getStudyImagePathType(path);
    return new Promise((resolve, reject) => {
        getDownloadURL(ref(storage, path))
            .then((url) => {
                const request = new XMLHttpRequest();
                // Long timeout as we really don't want to hammer the backend.
                request.timeout = 8000;
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

                const makeErrorListener = (errorDesc) => {
                    return () => {
                        reject(new Error(
                            errorDesc + " StudyImage from " + path +
                            (request.status ? " (" + request.status + ")" : "") +
                            (request.statusText ? ": " + request.statusText : "")
                        ));
                    };
                };
                request.onerror = makeErrorListener("Could not load");
                request.onabort = makeErrorListener("Aborted while loading");
                request.ontimeout = makeErrorListener("Timed out while loading");
                request.send(null);
            })
            .catch((reason) => {
                if (reason.code === "storage/object-not-found") {
                    console.error(reason);
                    const err = new Error("Image not found.");
                    reject(err);
                    throw err;
                }
                console.log("REASON REASON REASON")
                console.log(reason.code);
                reject(reason);
                throw reason;
            });
    });
}

/**
 * Reads all results of the study {@param study} into an Array of Game objects.
 *
 * If any errors are encountered, the session IDs of the errored
 * results will be added to the map {@param problems}.
 */
export async function readAllCompletedStudyResults(study, problems) {
    if (!auth.currentUser)
        throw new Error("User is not authenticated");

    const games = [];
    const snapshot = await getDocs(collection(doc(collection(db, "Studies"), study.id), "Results"));

    for(let index = 0; index < snapshot.docs.length; ++index) {
        const doc = snapshot.docs[index];
        const json = decompressJson(doc.data());
        try {
            games.push(Game.fromJSON(json, study));
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
