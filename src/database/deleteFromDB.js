import {db, storageRef} from "./firebase";
import {BrokenStudy} from "../model/study";

/**
 * Deletes the file at {@param path} from storage.
 * @return {Promise<any>} a Promise for the completion of the deletion.
 */
export function deletePathFromStorage(path) {
    return storageRef.child(path).delete();
}

/**
 * Deletes all paths in {@param paths} from Firebase Storage, printing deletion errors to console.
 * @return Promise<void> a Promise that will complete when all paths have been deleted.
 */
export function deletePathsFromStorage(paths) {
    if (paths.length === 0)
        return Promise.resolve();

    return new Promise((resolve, reject) => {
        const progress = {
            uploaded: 0,
            started: 0,
            errors: [],
            allStarted: false
        };
        const onAllComplete = () => {
            if (progress.errors.length === 0) {
                resolve();
            } else {
                // Would be nice to propagate all the errors.
                reject(progress.errors[0]);
            }
        };
        const onTaskComplete = () => {
            progress.uploaded += 1;
            if (progress.allStarted && (progress.uploaded === progress.started)) {
                onAllComplete();
            }
        };
        for (let index = 0; index < paths.length; ++index) {
            deletePathFromStorage(paths[index]).then(onTaskComplete).catch((error) => {
                progress.errors.push(error);
                onTaskComplete();
            });

            progress.started += 1;
        }
        if (progress.uploaded === progress.started) {
            onAllComplete();
        } else {
            progress.allStarted = true;
        }
    });
}

/**
 * Deletes just the study configuration of {@param study}.
 * This does not delete the assets stored alongside the study,
 * and therefore {@link deleteStudy} should be used instead
 * if possible.
 */
function deleteStudyConfiguration(study) {
    return db.collection("Studies").doc(study.id).delete();
}

/**
 * Deletes the results of the given study, {@param study}.
 */
function deleteStudyResults(study) {
    return new Promise((resolve, reject) => {
        db.collection("Studies").doc(study.id).collection("Results").get().then(snapshot => {
            const promises = [];
            snapshot.forEach(doc => {
                promises.push(doc.ref.delete());
            });
            Promise.all(promises).then(resolve).catch(reject);
        }).catch(error => {
                reject(error);
        });
    });
}

/**
 * Deletes a study and all the images stored for it
 * from Firebase Storage and Firestore.
 */
export function deleteStudy(study) {
    return new Promise((resolve, reject) => {
        let paths = (study instanceof BrokenStudy ? [] : study.getAllStoragePaths());

        // 3. Delete study configuration.
        function delStudyConfig() {
            deleteStudyConfiguration(study).then(resolve).catch(reject);
        }

        // 2. Delete study results.
        function delStudyResults() {
            deleteStudyResults(study).then(() => {
                delStudyConfig();
            }).catch(error => {
                // Just print the error and continue...
                // This might leave hanging results in
                // the database, but oh well.
                console.error(error);
                delStudyConfig();
            });
        }

        // 1. Delete study images.
        deletePathsFromStorage(paths).then(() => {
            delStudyResults();
        }).catch(error => {
            // Just print the error and continue...
            // This might leave hanging images in
            // the database, but oh well.
            console.error(error);
            delStudyResults();
        });
    });
}
