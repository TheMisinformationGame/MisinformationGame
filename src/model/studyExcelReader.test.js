import {Study} from "./study";
import Excel from "exceljs";
import {readStudyWorkbook} from "./studyExcelReader";

const fs = require("fs");
const path = require("path");

/**
 * @param name The filename of the study to load from the test directory. e.g. "StudyTemplate.xlsx".
 * @param callback A callback of the form (err, study) => { ... } to get the results of reading.
 */
export function loadTestStudy(name, callback) {
    fs.readFile(path.resolve(__dirname, "../../test/" + name), (err, data) => {
        if (err) {
            callback(err);
            return;
        }

        // Get the underlying ArrayBuffer.
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);

        // Read the study!
        new Excel.Workbook().xlsx
            .load(new Uint8Array(arrayBuffer))
            .then((workbook) => {
                readStudyWorkbook(workbook)
                    .then((study) => {
                        callback(null, study);
                    })
                    .catch(callback);
            })
            .catch(callback);
    });
}

test('load the version-2 template study', done => {
    loadTestStudy("../docs/StudyTemplate-V2.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});

test('load the version-2 single-post-mode example study', done => {
    loadTestStudy("../docs/ExampleStudy-V2-Single-Post.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});

test('load the version-2 feed-mode example study', done => {
    loadTestStudy("../docs/ExampleStudy-V2-Feed.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});

test('load the version-1 template study', done => {
    loadTestStudy("../docs/StudyTemplate-V1.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});

test('load the version-1 example study', done => {
    loadTestStudy("../docs/ExampleStudy-V1.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});

test('load the version-1 example study with missing avatar images', done => {
    loadTestStudy("ExampleStudy-MissingAvatars-V1.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }
        expect(study).toBeInstanceOf(Study);
        expect(study.sources.length).toBeGreaterThan(0);
        expect(study.posts.length).toBeGreaterThan(0);
        done();
    });
});
