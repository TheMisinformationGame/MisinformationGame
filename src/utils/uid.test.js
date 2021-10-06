import {generateUID} from "./uid";

test("that the UIDs generated are unique", (done) => {
    const uids = [];
    for (let index = 0; index < 10000; ++index) {
        const uid = generateUID();
        if (uids.includes(uid))
            throw new Error("Collision! '" + uid + "' was generated twice.");

        uids.push(uid);
    }
    done();
});
