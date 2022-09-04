import {compressJson, decompressJson} from "./compressJson";
import {odiff} from "../utils/odiff";

test("values can be compressed and decompressed without change", () => {
    const jsonObjects = [
        {},
        {"displayFollowers": "b", "displayfollowers": "c"},
        {"likes": 1},
        {
            "numberOfReactions": {
                "like": 7,
                "dislike": 12,
                "share": 3,
                "flag": 0
            }
        },
        {
            "these": {
                "keys": 245,
                "are": 23.7,
                "unlikely": "to",
                "be": {
                    "aliased": "in"
                },
                "the": ["key", "value", "map"],
                "correct?": true
            }
        },
        {
            ".keys": "starting",
            ".with": "the",
            ".special": {
                ".character": "."
            }
        },
        {
            "..keys": "starting",
            "..with": "the",
            "..special": {
                "..characters": ".."
            }
        },
        {
            ":KEYS": "starting",
            ":with": "THE",
            ":special": {
                ":CHARACTER": ":"
            }
        },
        {
            "check": null,
            "authorID": "abc123"
        },
        {
            "like": [
                {
                    "share": 7,
                    "flag": 3
                },
                {
                    "dislikes": 21354.5
                }
            ]
        }
    ];

    for (let index = 0; index < jsonObjects.length; ++index) {
        const json = jsonObjects[index];
        const compressedJson = compressJson(json);
        const decompressedJson = decompressJson(compressedJson);
        const changes = odiff(json, decompressedJson);
        if (changes.length !== 0) {
            console.error("Unexpected changes after compression: " + JSON.stringify(changes));
            console.error("Original JSON: " + JSON.stringify(json));
            console.error("Compressed JSON: " + JSON.stringify(compressedJson));
            console.error("Decompressed JSON: " + JSON.stringify(decompressedJson));
            throw new Error("There were " + changes.length + " unexpected changes after compression");
        }
    }
})
