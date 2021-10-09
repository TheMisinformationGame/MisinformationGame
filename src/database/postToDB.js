/*
 * This file contains functions to post data to the
 * FireStore Database, and to Firebase Storage.
 */

import {db, storageRef} from './firebase';

/**
 * Uploads the configuration for the study {@param study}.
 * @return Promise<void> a Promise for the completion of the upload.
 */
export function uploadStudyConfiguration(study) {
    let studyCol = db.collection("Studies");
    let studyDoc = studyCol.doc(study.id);
    return studyDoc.set(study.toJSON());
}

/**
 * Uploads the image {@param image} to storage at the path {@param path}.
 * @return {firebase.storage.UploadTask} a task object for tracking the upload.
 */
export function uploadImageToStorage(path, image) {
    return storageRef.child(path).put(image.buffer);
}

/**
 * Uploads all images in the dictionary {@param imageDict} to storage,
 * with the keys used as paths, and the images as the values.
 * @param progressFn will be periodically called with the number of images uploaded and
 *                   the total number of images being uploaded. This will only be called
 *                   as intermediate images are uploaded, not for the final image.
 * @return Promise<void> a Promise that will complete when all images have been uploaded.
 */
export function uploadImagesToStorage(imageDict, progressFn) {
    return new Promise((resolve, reject) => {
        const progress = {
            uploaded: 0,
            started: 0,
            errored: false,
            allStarted: false
        };
        const tasks = [];
        for (let path in imageDict) {
            if (!imageDict.hasOwnProperty(path))
                continue;

            const image = imageDict[path];
            const task = uploadImageToStorage(path, image);
            task.then(() => {
                progress.uploaded += 1;
                if (progress.allStarted && !progress.errored) {
                    if (progress.uploaded === progress.started) {
                        resolve();
                    } else {
                        progressFn(progress.uploaded, progress.started);
                    }
                }
            }).catch((error) => {
                try {
                    console.error(error);
                    progress.errored = true;
                    // If any upload errors, cancel all other uploads.
                    for (let index = 0; index < tasks.length; ++index) {
                        tasks[index].cancel();
                    }
                } finally {
                    reject(error);
                }
            });
            tasks.push(task);
            progress.started += 1;
        }
        if (progress.uploaded === progress.started) {
            resolve();
        } else {
            progress.allStarted = true;
        }
    });
}

//send the object which contains all of the reactions to the post

/**
 * Save the game results {@param game} to the results of study {@param study}.
 */
export function postResults(study, game) {
    let studyCol = db.collection("Studies");
    let studyDoc = studyCol.doc(study.id);
    let resultsCol = studyDoc.collection("Results");
    resultsCol.doc(game.sessionID).set(game.toJSON()).then(() => {
        console.log("Results uploaded!");
    }).catch((error) => {
        console.log(error)
    });
}
