import {Component} from "react";
import {readStudyWorkbook} from "../model/studyWorkbookReader";

const Excel = require('exceljs');


class StudyUploadForm extends Component {
    constructor(props) {
        super(props);
        this.state = { file: null,  url: '' };
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
        console.log("Downloading " + xlsxURL);
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
            this.doFileUpload(this.state.file);
        } else if (this.state.url) {
            this.doURLUpload(this.state.url);
        } else {
            console.log("No inputs");
        }
        return false;
    }

    onFileChange(event) {
        this.setState({ file: event.target, url: '' })
    }

    onURLChange(event) {
        this.setState({ file: null, url: event.target.value })
    }

    render() {
        return (
            <form onSubmit={evt => this.handleSubmit(evt)}>
                <input type="file" onChange={evt => this.onFileChange(evt)} /><br/>
                <input type="text" onChange={evt => this.onURLChange(evt)} />
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

function StudyUpload() {
    return (
        <div className="flex">
            <StudyUploadForm />
        </div>
    );
}

export default StudyUpload;
