import {readAllStudies, readStudyImage, readStudySettings} from "../utils/getFromDB";
import {Game} from "./game";
import {doTypeCheck, isOfType} from "../utils/types";
import {Study} from "./study";
import {StudyImage, StudyImageMetadata} from "./images";

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
    }

    /**
     * Returns the ID of the currently active study,
     * or else throws an error if no study is active.
     */
    getActiveStudyID() {
        // TODO: Dynamically get this from the URL.
        return "1632150824586";
    }

    /**
     * This reads all studies from the database.
     * This method should not be called directly, instead
     * call {@link DataManager#getAllStudies()} to get a promise to all the studies.
     */
    readAllStudies() {
        console.log("Reading all studies...");
        const studiesPromise = readAllStudies().then((studies) => {
            this.allStudiesPromiseGenerator = () => Promise.resolve(studies);
            for (let index = 0; index < studies.length; ++index) {
                const study = studies[index];
                this.studyPromiseGenerators[study.id] = () => Promise.resolve(study);
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
        if (!this.studyPromiseGenerators[studyID])
            return this.readStudy(studyID);

        return this.studyPromiseGenerators[studyID]();
    }

    /**
     * Returns a Promise to read or create the currently active game.
     */
    readActiveGame(studyID) {
        this.activeGameStudyID = studyID;

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
    readStudyImage(study, imageID, imageMetadata) {
        const path = StudyImage.getPath(study.id, imageID, imageMetadata);
        console.log("Reading image " + path + "...");
        const imagePromise = readStudyImage(path).then((image) => {
            this.imagePromiseGenerators[path] = () => Promise.resolve(image);
            return image;
        }).catch((err) => {
            this.imagePromiseGenerators[path] = () => Promise.reject(err);
            throw err;
        });
        this.imagePromiseGenerators[path] = () => imagePromise;
        return imagePromise;
    }

    /**
     * Returns a Promise to the study image with the given ID.
     */
    getStudyImage(study, imageID, imageMetadata) {
        doTypeCheck(study, Study);
        doTypeCheck(imageID, "string");

        // Already an image, just return it.
        if (isOfType(imageMetadata, StudyImage))
            return Promise.resolve(imageMetadata);

        doTypeCheck(imageMetadata, StudyImageMetadata);
        const path = StudyImage.getPath(study.id, imageID, imageMetadata);
        if (!this.imagePromiseGenerators[path])
            return this.readStudyImage(study, imageID, imageMetadata);

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
