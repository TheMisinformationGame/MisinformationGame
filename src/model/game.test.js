import {loadTestStudy} from "./studyExcelReader.test";
import {Game} from "./game";

test("create a game", (done) => {
    loadTestStudy("StudyTemplate.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }

        try {
            Game.createNew(study);
            done();
        } catch (error) {
            done(error);
        }
    });
});
