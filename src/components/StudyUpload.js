import "../index.css"
import {Component} from "react";
import {readStudyWorkbook} from "../model/studyWorkbookReader";

const Excel = require('exceljs');


class StudyUploadField extends Component {
    onChange(event) {
        let input = event.target;
        let file = input.files[0];

        if(file) {
            let reader = new FileReader();
            reader.onload = (event) => {
                new Excel.Workbook().xlsx
                    .load(event.target.result)
                    .then((workbook) => {
                        window.lastStudy = readStudyWorkbook(workbook);
                        console.log(window.lastStudy);
                    });
            };
            reader.readAsArrayBuffer(file);
        }
    }

    render() {
        return (
            <input type="file" onChange={evt => this.onChange(evt)} />
        );
    }
}

function StudyUpload() {
    return (
        <div className="flex">
            <form>
                <StudyUploadField />
            </form>
        </div>
    );
}

export default StudyUpload;
