import "../index.css"
import {Component} from "react";
import {readStudyWorkbook} from "../model/studyExcelReader";
import StatusLabel, {Status} from "./StatusLabel";
import {checkStudyToJSONCompliance, getStudyChangesToAndFromJSON, Study} from "../model/study";
import xlsxHelp from "./help-export-to-xlsx.png"
import {Game, getGameChangesToAndFromJSON} from "../model/game";
import {doTypeCheck, isOfType} from "../utils/types";
import {uploadImagesToStorage, uploadStudyConfiguration} from "../database/postToDB";
import {generateUID} from "../utils/uid";
import {StudyImage} from "../model/images";
import {MountAwareComponent} from "./MountAwareComponent";
import {Dialog} from "./Dialog";
import {removeByValue} from "../utils/arrays";
import {deletePathsFromStorage} from "../database/deleteFromDB";
import {auth} from "../database/firebase";

const Excel = require('exceljs');


class UploadIcon extends Component {
    render() {
        return (
            <svg viewBox="0 0 20 20" className="w-8 h-8" fill="currentColor"
                 xmlns="http://www.w3.org/2000/svg">
                <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59
                         A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z"/>
            </svg>
        );
    }
}

/**
 * This uses an excessive number of callbacks to handle the uploading
 * of studies. It is hard to avoid because there are so many async tasks
 * to chain together, but it could probably be cleaned up using async/yield.
 */
export class StudyUploadForm extends MountAwareComponent {
    constructor(props) {
        super(props);
        this.state = {
            fileStatus: null
        };
    }

    /**
     * Uploads the study configuration of {@param study}.
     *
     * @param updateStatusFn the function used to update the UI with progress information.
     */
    uploadStudyConfig(study, updateStatusFn) {
        // Upload the study itself.
        updateStatusFn(Status.progress("Uploading study configuration..."));
        setTimeout(() => {
            uploadStudyConfiguration(study).then(() => {
                // Successfully uploaded the study!
                updateStatusFn(Status.success("Success"));
                if (this.props.onStudyLoad) {
                    this.props.onStudyLoad(study);
                }
            }).catch((error) => {
                console.error(error);
                updateStatusFn(Status.error([
                    <b>Study could not be uploaded:</b>,
                    error.message
                ]));
            });
        }, 50);
    }

    /**
     * Uploads {@param study}, including its configuration and all its images, to the database.
     *
     * @param updateStatusFn the function used to update the UI with progress information.
     */
    uploadStudy(study, updateStatusFn) {
        doTypeCheck(study, Study, "Study");

        updateStatusFn(Status.progress("Uploading images..."));

        // We do this in a setTimeout so that React has a chance to
        // update the UI with our new status. Its dodgy but it works...
        setTimeout(() => {
            // We want to delete images that we aren't going to overwrite.
            const previousStudy = this.props.previousStudy;
            const imagePathsToDelete = (previousStudy ? previousStudy.getAllStoragePaths() : []);

            // Collect all images to upload.
            const images = {};
            for (let index = 0; index < study.posts.length; ++index) {
                const post = study.posts[index];
                if (!isOfType(post.content, "string")) {
                    const path = StudyImage.getPath(
                        study, post.id, post.content.toMetadata()
                    );
                    images[path] = post.content;
                    removeByValue(imagePathsToDelete, path);
                }
            }
            for (let index = 0; index < study.sources.length; ++index) {
                const source = study.sources[index];
                if (!source.avatar)
                    continue;

                const path = StudyImage.getPath(
                    study, source.id, source.avatar.toMetadata()
                );
                images[path] = source.avatar;
                removeByValue(imagePathsToDelete, path);
            }

            // Upload all the images.
            uploadImagesToStorage(images, (uploaded, total) => {
                updateStatusFn(Status.progress("Uploading images... (" + uploaded + " / " + total + ")"));
            }).then(() => {
                if (imagePathsToDelete.length === 0) {
                    this.uploadStudyConfig(study, updateStatusFn);
                    return;
                }

                // Delete old, now unused, images.
                updateStatusFn(Status.progress("Deleting old images..."));
                setTimeout(() => {
                    deletePathsFromStorage(imagePathsToDelete).then(() => {
                        this.uploadStudyConfig(study, updateStatusFn);
                    }).catch((error) => {
                        // Just print the error and continue...
                        // This might leave hanging images in
                        // the database, but oh well.
                        console.error(error);
                        this.uploadStudyConfig(study, updateStatusFn);
                    });
                }, 50);
            }).catch((error) => {
                console.error(error);
                updateStatusFn(Status.error([
                    <b>Study images could not be uploaded:</b>,
                    error.message
                ]));
            });
        }, 50);
    }

    /**
     * Verifies the contents of {@param study} to check for
     * errors in the study before it is uploaded to the database.
     *
     * @param updateStatusFn the function used to update the UI with progress information.
     * @param onComplete the function to be called with the study once it has been successfully verified.
     */
    verifyStudy(study, updateStatusFn, onComplete) {
        updateStatusFn(Status.progress("Verifying study..."));

        const reportInternalError = (errorMessage) => {
            return updateStatusFn(Status.error([
                <b>Internal Error:</b>,
                "An error was found in the study:",
                errorMessage
            ]));
        };

        // We do this in a setTimeout so that React has a chance to
        // update the UI with our new status. Its dodgy but it works...
        setTimeout(() => {
            try {
                doTypeCheck(study, Study, "The study");
            } catch (error) {
                console.error(error);
                reportInternalError("The study was not loaded correctly.");
                return;
            }

            // Do more checks to make sure this study plays
            // nicely with our other systems.
            try {
                // Try convert the study to and from JSON.
                const studyChanges = getStudyChangesToAndFromJSON(study);
                if (studyChanges.length !== 0) {
                    console.error(studyChanges);
                    reportInternalError("The study changed after saving and loading.");
                    return;
                }

                // Verify that none of our custom objects were left after toJSON().
                const error = checkStudyToJSONCompliance(study);
                if (error !== null) {
                    console.error(error);
                    reportInternalError("The study contained invalid values.");
                    return;
                }
            } catch (error) {
                console.error(error);
                reportInternalError("An error occurred while saving this study: " + error.message);
                return;
            }

            let game;
            try {
                // Try create a new Game using the study.
                game = Game.createNew(study);
            } catch (error) {
                console.error(error);
                reportInternalError(
                    "An error occurred while simulating a game using this study: " +
                    error.message
                );
                return;
            }

            try {
                // Try convert the game to and from JSON.
                const gameChanges = getGameChangesToAndFromJSON(game);
                if (gameChanges.length !== 0) {
                    console.error(gameChanges);
                    reportInternalError(
                        "A test game created using this study " +
                        "changed after saving and loading."
                    );
                    return;
                }
            } catch (error) {
                console.error(error);
                reportInternalError(
                    "An error occurred saving a sample game simulated using this study: " +
                    error.message
                );
                return;
            }

            // Study was verified as correct!
            onComplete(study);
        }, 50);
    }

    /**
     * Reads the study contained in the Excel workbook whose contents are in {@param buffer}.
     *
     * @param updateStatusFn the function used to update the UI with progress information.
     * @param onComplete the function to be called with the study once it has been successfully read.
     */
    readXLSX(buffer, updateStatusFn, onComplete) {
        if (!auth.currentUser)
            throw new Error("User is not authenticated");

        const authorID = auth.currentUser.uid;
        const authorName = auth.currentUser.displayName;
        new Excel.Workbook().xlsx
            .load(buffer)
            .then((workbook) => {
                updateStatusFn(Status.progress("Reading spreadsheet..."));
                readStudyWorkbook(workbook)
                    .then((study) => {
                        const previousStudy = this.props.previousStudy;

                        // If updating a study, use its ID, or else generate a new one.
                        if (previousStudy) {
                            study.id = previousStudy.id;
                            study.authorID = previousStudy.authorID;
                            study.authorName = previousStudy.authorName;
                        } else {
                            study.id = generateUID();
                            study.authorID = authorID;
                            study.authorName = authorName;
                        }
                        study.updateLastModifiedTime();

                        // Mark that we've done reading the study.
                        onComplete(study);
                    })
                    .catch((error) => {
                        console.error(error);
                        updateStatusFn(Status.error([
                            <strong>Error reading spreadsheet:</strong>,
                            error.message
                        ]));
                    });
            })
            .catch((error) => {
                console.error(error);
                updateStatusFn(Status.error([
                    <strong>Error parsing spreadsheet:</strong>,
                    error
                ]));
            });
    }

    doFileUpload(input) {
        const file = input.files[0];
        if (!file)
            return;

        this.setStateIfMounted({ fileStatus: Status.progress("Reading file...") });
        const reader = new FileReader();

        // Callbacks on callbacks on callbacks on callbacks.
        reader.onload = (event) => {
            const updateStatusFn = (status) => this.setStateIfMounted({ fileStatus: status });
            this.readXLSX(
                event.target.result,
                updateStatusFn,
                (study) => {
                    this.verifyStudy(
                        study, updateStatusFn,
                        (study) => this.uploadStudy(study, updateStatusFn)
                    );
                }
            );
        };
        reader.onerror = () => {
            this.setStateIfMounted({
                fileStatus: Status.error([
                    <strong>Error reading file:</strong>,
                    reader.error
                ])
            });
        }
        reader.readAsArrayBuffer(file);
    }

    render() {
        return (
            <form className="flex flex-col items-start max-w-xl" onSubmit={() => {}}>

                <span className="flex mt-4 mb-3">
                    Upload your study configuration spreadsheet as an XLSX file:
                </span>
                <div className="flex flex-1 w-full">
                    <label className="flex flex-row justify-items-center py-2 px-3 bg-white
                                      text-blue-500 rounded-lg
                                      border border-blue-500 cursor-pointer
                                      hover:bg-blue-500 hover:text-white">
                        <UploadIcon />
                        <span className="ml-3 text-lg">Upload Spreadsheet</span>
                        <input type='file' className="hidden fileSelector"
                               onChange={evt => this.doFileUpload(evt.target)} />
                    </label>
                </div>
                <StatusLabel status={this.state.fileStatus} className="my-2" />
                <span className="pt-4">
                    You can download your Google Sheets spreadsheet as an XLSX
                    file by selecting <strong>File</strong>
                    &#10147; <strong>Download</strong>
                    &#10147; <strong>Microsoft Excel (.xlsx) </strong>
                    within your configuration spreadsheet.
                </span>
                <img src={xlsxHelp} className="max-h-64 mt-2"
                     alt="Steps to download spreadsheet as XLSX file" />
            </form>
        );
    }
}

export default class StudyUpload extends Component {
    render() {
        return (
            <Dialog title={this.props.title} visible={this.props.visible}
                    onHide={this.props.onHide} className={this.props.className}>

                <StudyUploadForm previousStudy={this.props.previousStudy} onStudyLoad={this.props.onUpload} />
            </Dialog>
        );
    }
};
