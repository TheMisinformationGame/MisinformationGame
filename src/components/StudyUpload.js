import "../index.css"
import {Component} from "react";
import {readStudyWorkbook} from "../model/studyWorkbookReader";
import ErrorLabel from "./ErrorLabel";
import WarningLabel from "./WarningLabel";
import ProgressLabel from "./ProgressLabel";
import SuccessLabel from "./SuccessLabel";

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

class StudyUploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            url: '',
            urlError: "Error",
            urlWarning: "Warning",
            fileError: "Error 2",
            fileWarning: "Warning 2"
        };
    }

    readXLSX(buffer) {
        new Excel.Workbook().xlsx
            .load(buffer)
            .then((workbook) => {
                window.lastWorkbook = workbook;
                window.lastStudy = readStudyWorkbook(workbook);
                console.log(window.lastStudy);
            });
    }

    doFileUpload(input) {
        let file = input.files[0];
        if(file) {
            let reader = new FileReader();
            reader.onload = (event) => {
                this.readXLSX(event.target.result);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    reportFileUploadError(error) {

    }

    doURLUpload(url) {
        let id;
        if (url.includes("/")) {
            const matches = [...url.matchAll("/d/([a-zA-Z0-9-_]+)")];
            if (matches.length > 0) {
                id = matches[0][1];
            } else {
                throw new Error("Could not find document ID in URL");
            }
        } else {
            id = url;
        }

        const xlsxURL = "https://docs.google.com/spreadsheets/export?id=" + id + "&exportFormat=xlsx";
        console.log("Downloading " + xlsxURL + "...");

        const request = new XMLHttpRequest();
        request.open("GET", xlsxURL, true);
        request.responseType = "arraybuffer";
        request.onload = (event) => {
            if (request.status === 200) {
                this.readXLSX(request.response);
            } else {
                console.log("Error reading " + xlsxURL + ": " + request.status)
            }
        };
        request.send();
    }

    handleSubmit(event) {
        event.preventDefault();
        if (this.state.file) {
            this.doURLUpload(this.state.url);
        } else {
            console.log("No inputs");
        }
        return false;
    }

    onURLChange(event) {
        this.setState({
            url: event.target.value,
            urlError: null,
            fileError: null
        })
    }

    render() {
        return (
            <form className="flex flex-col items-start" onSubmit={evt => this.handleSubmit(evt)}>
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
                <ProgressLabel className="mt-2" />
                { this.state.urlError && <ErrorLabel value={this.state.urlError} className="mt-2" /> }
                { this.state.urlWarning && <WarningLabel value={this.state.urlWarning} className="mt-2" /> }
                <SuccessLabel className="mt-2" />

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
                { this.state.fileError && <ErrorLabel value={this.state.fileError} className="mt-2" /> }
                { this.state.fileWarning && <WarningLabel value={this.state.fileWarning} className="mt-2" /> }
            </form>
        );
    }
}

export default class StudyUpload extends Component {
    render() {
        return (
            <div>
                {/* Gray-out content beneath study upload UI. */}
                <div className="absolute left-0 top-0 w-full h-full z-40 bg-black opacity-20" />

                {/* Place study upload form above grayed-out background. */}
                <div className="absolute left-0 top-0 w-full h-full z-50
                        flex flex-col content-center">
                    <div className="flex-initial flex flex-col
                            m-8 p-8 shadow rounded-md bg-white divide-y">
                        <h2 className="py-2 text-4xl">Upload Study</h2>
                        <div className="pt-6">
                            <StudyUploadForm />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
