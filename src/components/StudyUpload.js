import "../index.css"
import {Component} from "react";
import {readStudyWorkbook} from "../model/studyExcelReader";
import StatusLabel, {Status} from "./StatusLabel";
import {getStudyChangesToAndFromJSON} from "../model/study";
import xlsxHelp from "./help-export-to-xlsx.png"
import {Game, getGameChangesToAndFromJSON} from "../model/game";
import { postStudy } from "../utils/postToDB";
import { storageRef } from '../utils/initFirestore';

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

export class StudyUploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = StudyUploadForm.createStateWithDefaults({});
    }

    static createStateWithDefaults(incompleteState) {
        return {
            ...{ // Defaults
                url: null,
                urlStatus: null,
                fileStatus: null
            },
            ...incompleteState
        };
    }

    updateState(incompleteState) {
        this.setState(StudyUploadForm.createStateWithDefaults(incompleteState));
    }

    onURLChange(event) {
        this.updateState({ url: event.target.value });
    }

    verifyStudy(study, updateStatusFn) {
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

                // Try create a new Game using the study.
                const game = Game.createNew(study);

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
                reportInternalError(error.message);
                return;
            }

            // Success!
            updateStatusFn(Status.success("Success"));
            if (this.props.onStudyLoad) {
                this.props.onStudyLoad(study);
            }
        }, 50);
    }

    readXLSX(buffer, updateStatusFn) {
        new Excel.Workbook().xlsx
            .load(buffer)
            .then((workbook) => {
                updateStatusFn(Status.progress("Reading spreadsheet..."));
                readStudyWorkbook(workbook)
                    .then((study) => {
                        this.verifyStudy(study, updateStatusFn);
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

        this.updateState({ fileStatus: Status.progress("Reading file...") });
        const reader = new FileReader();
        reader.onload = (event) => {
            this.readXLSX(event.target.result, (status) => this.updateState({ fileStatus: status }));
        };
        reader.onerror = () => {
            this.updateState({
                fileStatus: Status.error([
                    <strong>Error reading file:</strong>,
                    reader.error
                ])
            });
        }
        reader.readAsArrayBuffer(file);
    }

    doURLUpload(url) {
        let id;
        if (url.includes("/")) {
            const matches = [...url.matchAll("/d/([a-zA-Z0-9-_]+)")];
            if (matches.length > 0) {
                id = matches[0][1];
            } else {
                this.updateState({ urlStatus: Status.error("Could not find document ID in URL")});
                return;
            }
        } else {
            id = url;
        }

        const xlsxURL = "https://docs.google.com/spreadsheets/export?id=" + id + "&exportFormat=xlsx";
        console.log("Downloading " + xlsxURL + "...");
        this.updateState({ urlStatus: Status.progress("Downloading spreadsheet...")});

        const request = new XMLHttpRequest();
        request.open("GET", xlsxURL, true);
        request.responseType = "arraybuffer";
        request.onreadystatechange = () => {
            if (request.readyState < 4)
                return;

            if (request.status === 200) {
                this.updateState({ urlStatus: Status.progress("Parsing spreadsheet...")});
                this.readXLSX(request.response, (status) => this.updateState({ urlStatus: status }));
            } else {
                this.updateState({
                    urlStatus: Status.error([
                        <strong>Unable to download spreadsheet{request.statusText && ": "}</strong>,
                        request.statusText + " (Status " + request.status + ")",
                        (request.statusText === "Unauthorized" && request.status === 401 ?
                            " If your Google Sheets spreadsheet is private, " +
                                "you will need to upload it as an XLSX file." :
                            null)
                    ])
                });
            }
        };
        request.send();
    }

    handleURLSubmit(event) {
        event.preventDefault();
        if (this.state.url) {
            this.doURLUpload(this.state.url);
        } else {
            this.updateState({ urlStatus: Status.error("Please enter your Google Sheets URL or ID")});
        }
        return false;
    }

    render() {
        return (
            <form className="flex flex-col items-start max-w-xl"
                  onSubmit={evt => this.handleURLSubmit(evt)}>

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
            <div>
                {/* Gray-out content beneath study upload UI. */}
                <div className="fixed left-0 top-0 w-full h-full z-40 bg-black opacity-60"
                     onClick={this.props.onHide} />

                {/* Place study upload form above grayed-out background. */}
                <div className="fixed left-0 top-0 w-full h-full overflow-y-scroll z-50
                        flex flex-row justify-center items-start"
                     onClick={this.props.onHide}>

                    <div className="flex flex-col m-8 p-8 shadow
                            rounded-md bg-white divide-y max-w-xl"
                         onClick={(event) => event.stopPropagation()}>

                        <h2 className="py-2 text-4xl">Upload Study</h2>
                        <StudyUploadForm onStudyLoad={this.props.onUpload} />
                    </div>
                </div>
            </div>
        );
    }
};

//upload images to firebase storage
export function uploadImageToStorage(imageRef, content, studyID){
    //locate the file path to be saved in
    const locRef = storageRef.child(studyID);                   //change "testStudy" to something useful
    //convert all files to jpg
    const fileName = imageRef + "." + "jpg"; //content.type.split("/")[1] ;
    let bytes = content.buffer;

    locRef.child(fileName).put(bytes).then(( snapshot => {
        console.log(fileName + " uploaded to " + locRef);
    }));
}
