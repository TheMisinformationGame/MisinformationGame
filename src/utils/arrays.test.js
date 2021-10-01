import {removeByValue} from "./arrays";

test("values are removed correctly", () => {
    const numArr = [1, 2, 3, 4, 5, 2];

    removeByValue(numArr, 0);
    expect(numArr).toStrictEqual([1, 2, 3, 4, 5, 2]);

    removeByValue(numArr, 2);
    expect(numArr).toStrictEqual([1, 3, 4, 5, 2]);

    removeByValue(numArr, 2);
    expect(numArr).toStrictEqual([1, 3, 4, 5]);

    removeByValue(numArr, 2);
    expect(numArr).toStrictEqual([1, 3, 4, 5]);

    removeByValue(numArr, 3);
    expect(numArr).toStrictEqual([1, 4, 5]);

    const strArr = ["a", "b", "c", "b"];

    removeByValue(strArr, "d");
    expect(strArr).toStrictEqual(["a", "b", "c", "b"]);

    removeByValue(strArr, "b");
    expect(strArr).toStrictEqual(["a", "c", "b"]);

    removeByValue(strArr, "d");
    expect(strArr).toStrictEqual(["a", "c", "b"]);

    removeByValue(strArr, "b");
    expect(strArr).toStrictEqual(["a", "c"]);
});
