import {readAllStudies, readStudyImage, readStudySettings} from "../database/getFromDB";
import {Game} from "./game";
import {doTypeCheck, isOfType} from "../utils/types";
import {BrokenStudy, Study} from "./study";
import {StudyImage, StudyImageMetadata} from "./images";
import {removeByValue} from "../utils/arrays";

/**
 * This class manages the data required for the games.
 */
class DataManager {
    constructor() {
        this.allStudiesPromiseGenerator = null;
        this.studyPromiseGenerators = {};
        this.activeGameStudyID = null;
        this.activeGamePromiseGenerator = null;
        this.imagePromiseGenerators = {};
        this.updateListeners = [];
    }

    /**
     * Adds the listener function {@param listener} to listen for
     * updates to any cached studies.
     */
    addUpdateListener(listener) {
        this.updateListeners.push(listener);
    }

    /**
     * Stops the listener {@param listener} from listening
     * to updates to cached studies.
     */
    removeUpdateListener(listener) {
        removeByValue(this.updateListeners, listener);
    }

    /**
     * Notifies all listeners that the study
     * {@param study} has been updated.
     */
    postStudyUpdateEvent(study) {
        let firstError = null;
        for (let index = 0; index < this.updateListeners.length; ++index) {
            try {
                this.updateListeners[index](study);
            } catch (err) {
                if (firstError) {
                    console.error(err);
                } else {
                    firstError = err;
                }
            }
        }
        if (firstError)
            throw firstError;
    }

    /**
     * Sets the ID of the currently active study to display.
     */
    setActiveStudy(studyID) {
        this.activeGameStudyID = studyID;
    }

    /**
     * Returns the ID of the currently active study,
     * or else throws an error if no study is active.
     */
    getActiveStudyID() {
        return this.activeGameStudyID;
    }

    /**
     * Clears all the cached studies so that they must be downloaded again.
     */
    clearCachedStudies() {
        this.allStudiesPromiseGenerator = null;
        this.studyPromiseGenerators = {};
        this.activeGamePromiseGenerator = null;
    }

    /**
     * Caches the study {@param study} so that it
     * doesn't have to be read from the database.
     */
    cacheStudy(study) {
        this.studyPromiseGenerators[study.id] = () => Promise.resolve(study);
        this.postStudyUpdateEvent(study);
    }

    /**
     * This reads all studies from the database.
     * This method should not be called directly, instead
     * call {@link DataManager#getAllStudies()} to get a promise to all the studies.
     */
    readAllStudies() {
        const studiesPromise = readAllStudies().then((studies) => {
            studies.sort((a, b) => {
                // First, sort by whether the studies are errored.
                const aErrored = isOfType(a, BrokenStudy);
                const bErrored = isOfType(b, BrokenStudy);
                if (!aErrored && bErrored)
                    return -1;
                if (aErrored && !bErrored)
                    return 1;

                // Second, sort by whether the studies are enabled.
                if (a.enabled && !b.enabled)
                    return -1;
                if (!a.enabled && b.enabled)
                    return 1;

                // Third, sort by most recently modified.
                return b.lastModifiedTime - a.lastModifiedTime;
            });

            this.allStudiesPromiseGenerator = () => Promise.resolve(studies);
            for (let index = 0; index < studies.length; ++index) {
                const study = studies[index];
                this.studyPromiseGenerators[study.id] = () => Promise.resolve(study);
                this.postStudyUpdateEvent(study);
            }
            return studies;
        }).catch((err) => {
            this.allStudiesPromiseGenerator = () => Promise.reject(err);
            throw err;
        });
        this.allStudiesPromiseGenerator = () => studiesPromise;
        return studiesPromise;
    }

    /**
     * Returns a promise to a list of all studies.
     */
    getAllStudies() {
        if (this.allStudiesPromiseGenerator === null)
            return this.readAllStudies();

        return this.allStudiesPromiseGenerator();
    }

    /**
     * This actually reads the study from the database.
     * This method should not be called directly, instead
     * call {@link DataManager#getStudy()} to get a study promise.
     */
    readStudy(studyID) {
        console.log("Reading study " + studyID + "...");
        const studyPromise = readStudySettings(studyID).then((study) => {
            this.studyPromiseGenerators[studyID] = () => Promise.resolve(study);
            this.postStudyUpdateEvent(study);
            return study;
        }).catch((err) => {
            this.studyPromiseGenerators[studyID] = () => Promise.reject(err);
            throw err;
        });
        this.studyPromiseGenerators[studyID] = () => studyPromise;
        return studyPromise;
    }

    /**
     * Returns a Promise to the study with the given ID.
     */
    getStudy(studyID) {
        if (!studyID)
            return Promise.reject("Please specify a study ID");
        if (!this.studyPromiseGenerators[studyID])
            return this.readStudy(studyID);

        return this.studyPromiseGenerators[studyID]();
    }

    /**
     * Returns a Promise to read or create the currently active game.
     */
    readActiveGame(studyID) {
        this.activeGameStudyID = studyID;

        // If there is no active study.
        if (!studyID) {
            this.activeGamePromiseGenerator = () => Promise.reject("There is no active study");
            return this.activeGamePromiseGenerator();
        }

        // TODO : Save this in the browser local storage.
        const gamePromise = this.getStudy(studyID).then((study) => {
            // The active game changed while we were loading this game.
            if (studyID !== this.activeGameStudyID)
                return;

            const game = Game.createNew(study);
            this.activeGamePromiseGenerator = () => Promise.resolve(game);
            return game;
        }).catch((err) => {
            this.activeGamePromiseGenerator = () => Promise.reject(err);
            throw err;
        });
        this.activeGamePromiseGenerator = () => gamePromise;
        return gamePromise;
    }

    /**
     * Returns a Promise to the study that should be currently displayed.
     * If a study ID is supplied, will return a Promise to that study.
     */
    getActiveStudy() {
        const studyID = this.getActiveStudyID();
        if (!studyID)
            return Promise.reject("There is no currently active study");

        return this.getStudy(this.getActiveStudyID());
    }

    /**
     * Returns a Promise to the currently active game.
     */
    getActiveGame() {
        const studyID = this.getActiveStudyID();
        if (this.activeGameStudyID !== studyID || this.activeGamePromiseGenerator === null)
            return this.readActiveGame(studyID);

        return this.activeGamePromiseGenerator();
    }

    /**
     * Reads an image from storage and returns a Promise to a StudyImage for it.
     * This should not be called directly, instead use {@link DataManager#getStudyImage()}.
     */
    readStudyImage(path) {
        const imagePromise = readStudyImage(path).then((image) => {
            this.imagePromiseGenerators[path] = () => image;
            return image;
        }).catch((err) => {
            this.imagePromiseGenerators[path] = () => Promise.reject(err);
            throw err;
        });
        this.imagePromiseGenerators[path] = () => imagePromise;
        return imagePromise;
    }

    /**
     * Returns a Promise to the study image with the given ID,
     * or if the image is already loaded, just that image.
     */
    getStudyImage(study, imageID, imageMetadata) {
        doTypeCheck(study, Study, "Image's Study");
        doTypeCheck(imageID, "string", "Image ID");

        // Already an image, just return it.
        if (isOfType(imageMetadata, StudyImage))
            return imageMetadata;

        doTypeCheck(imageMetadata, StudyImageMetadata, "Image Metadata");
        const path = StudyImage.getPath(study.id, imageID, imageMetadata);
        if (!this.imagePromiseGenerators[path])
            return this.readStudyImage(path);

        return this.imagePromiseGenerators[path]();
    }
}

/**
 * We store the data manager in the window object so that
 * it can be accessed between pages on the site.
 */
export function getDataManager() {
    const dest = window || null;
    if (!dest)
        throw new Error("window does not exist to store the data manager in");

    if (dest.manager instanceof DataManager)
        return dest.manager;
    const manager = new DataManager();
    dest.manager = manager;
    return manager;
}
