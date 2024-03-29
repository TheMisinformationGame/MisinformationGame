import {loadTestStudy} from "../studyExcelReader.test";
import {Game, getGameChangesToAndFromJSON} from "./game";

test("create a game", (done) => {
    loadTestStudy("../docs/StudyTemplate-V1.xlsx", (err, study) => {
        if (err) {
            done(err);
            return;
        }

        try {
            const game = Game.createNew(study);
            expect(getGameChangesToAndFromJSON(game)).toEqual([]);
            done();
        } catch (error) {
            done(error);
        }
    });
});
