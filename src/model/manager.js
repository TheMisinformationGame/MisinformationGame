import {readStudySettings} from "../utils/getFromDB";

/**
 * This class manages the data required for the games.
 */
class DataManager {
    constructor() {
        this.studyID = null;
        this.studyPromiseGenerator = null;
    }

    getStudyID() {
        // TODO: Dynamically get this from the URL.
        return "8UsCG45359Hp57i5hmIi";
    }

    /**
     * This actually reads the study from the database.
     * This method should not be called directly, instead
     * call {@link DataManager#getStudy()} to get a study promise.
     */
    readStudy(studyID) {
        console.log("Reading study " + studyID);
        this.studyID = studyID;
        const studyPromise = readStudySettings(studyID).then((study) => {
            // setTimeout just in case the Promise resolves immediately.
            setTimeout(() => {
                // Active study has changed before this Promise resolved.
                if (this.studyID !== studyID)
                    return;

                // getStudy should resolve to the study!
                this.studyPromiseGenerator = () => Promise.resolve(study);
            });
            return study;
        }).catch((err) => {
            // setTimeout just in case the Promise resolves immediately.
            setTimeout(() => {
                // If we could not load the study, getStudy should resolve to an error.
                this.studyPromiseGenerator = () => Promise.reject(err);
            });
            throw err;
        });

        this.studyPromiseGenerator = () => studyPromise;
        return studyPromise;
    }

    /**
     * Returns a Promise to the study that should be currently displayed.
     */
    getStudy() {
        const studyID = this.getStudyID();
        if (this.studyID !== studyID || this.studyPromiseGenerator === null)
            return this.readStudy(studyID);

        return this.studyPromiseGenerator();
    }
}

/**
 * We store the data manager in the window object so that
 * it can be accessed between pages on the site.
 */
export function getDataManager() {
    if (window && window.manager instanceof DataManager)
        return window.manager;

    const manager = new DataManager();
    window.manager = manager;
    return manager;
}
