import "../index.css"
import {Component} from "react";
import {readStudyWorkbook} from "../model/studyWorkbookReader";
import StatusLabel, {Status} from "./StatusLabel";
import {getChangesToAndFromJSON, Post, Source, Study} from "../model/study";
import {odiff} from "../utils/odiff";

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

    readXLSX(buffer, updateStatusFn) {
        new Excel.Workbook().xlsx
            .load(buffer)
            .then((workbook) => {
                updateStatusFn(Status.progress("Reading spreadsheet..."));
                readStudyWorkbook(workbook)
                    .then((study) => {
                        // If we're on localhost, then do more checks.
                        const host = window.location.hostname;
                        if (host === "localhost" || host === "127.0.0.1") {
                            const changes = getChangesToAndFromJSON(study);
                            if (changes.length !== 0) {
                                updateStatusFn(Status.error(
                                    "Original study and study reconstructed " +
                                    "from JSON are different!"
                                ));
                                console.error(changes);
                            }
                        }

                        // Success!
                        updateStatusFn(Status.success("Success"));
                        if (this.props.onStudyLoad) {
                            this.props.onStudyLoad(study);
                        }
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
        reader.onerror = (event) => {
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
        request.onreadystatechange = (event) => {
            if (request.readyState < 4)
                return;

            if (request.status === 200) {
                this.updateState({ urlStatus: Status.progress("Parsing spreadsheet...")});
                this.readXLSX(request.response, (status) => this.updateState({ urlStatus: status }));
            } else {
                this.updateState({
                    urlStatus: Status.error([
                        <strong>Unable to download spreadsheet{request.statusText && ": "}</strong>,
                        request.statusText + " (Status " + request.status + ")"
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
            <form className="flex flex-col items-start" onSubmit={evt => this.handleURLSubmit(evt)}>
                <span className="flex my-2">
                    Enter your Google Sheets spreadsheet URL or ID:
                </span>

                <div className="flex flex-1 w-full">
                    <input type="text" className="max-w-lg outline-none
                            flex-1 p-2 bg-gray-100 border border-blue-500
                            border-r-0 rounded-l-lg rounded-r-none"
                        onChange={evt => this.onURLChange(evt)} />
                    <input type="submit" className="
                            mr-2 px-4 py-2 text-blue-500 rounded bg-white
                            cursor-pointer border border-blue-500
                            rounded-r-lg rounded-l-none flex-grow-0
                            hover:bg-blue-500 hover:text-white"
                        value="Fetch" />
                </div>
                <StatusLabel status={this.state.urlStatus} className="my-2" />

                <span className="flex mb-2 mt-6">
                    Or, upload your study configuration spreadsheet as an XLSX file:
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
            </form>
        );
    }
}

export default class StudyUpload extends Component {
    render() {
        return (
            <div>
                {/* Gray-out content beneath study upload UI. */}
                <div className="fixed left-0 top-0 w-full h-full z-40 bg-black opacity-20" />

                {/* Place study upload form above grayed-out background. */}
                <div className="fixed left-0 top-0 w-full h-full z-50
                        flex flex-col content-center">
                    <div className="flex-initial flex flex-col
                            m-8 p-8 shadow rounded-md bg-white divide-y">
                        <h2 className="py-2 text-4xl">Upload Study</h2>
                        <div className="pt-6">
                            <StudyUploadForm onStudyLoad={(study) => {
                                console.log(study);
                                window.lastStudy = study;
                            }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
