/* Copyright (c) 2013 Billy Tetrud - Free to use for any purpose: MIT License */


export function odiff(a, b) {
    const results = [];
    diffInternal(a, b, results, []);
    return results;
}


/**
 * adds a 'set' type to the changeList
 */
function set(changeList, property, value) {
    changeList.push({
        type:'set',
        path: property,
        val: value
    });
}


/**
 * adds an 'unset' type to the changeList
 */
function unset(changeList, property) {
    changeList.push({
        type:'unset',
        path: property
    });
}


/**
 * Adds an 'rm' type to the changeList.
 * index: The index to remove at.
 * count: The number of items to remove from that index. The indexes to remove count up from the index.
 */
function rm(changeList, property, index, count, a) {
    changeList.push({
        type:'rm',
        path: property,
        index: index,
        num: count,
        vals: a.slice(index, index + count)
    });
}


/**
 * adds an 'add' type to the changeList
 */
function add(changeList, property, index, values) {
    changeList.push({
        type:'add',
        path: property,
        index: index,
        vals: values
    })
}


function diffInternal(a, b, acc, base) {
    if (a === b || (Number.isNaN(a) && Number.isNaN(b)))
        return;

    if (a instanceof Array && b instanceof Array) {
        diffInternalArray(a, b, acc, base);
    } else if (a instanceof Date && b instanceof Date) {
        diffInternalDate(a, b, acc, base);
    } else if (a instanceof Object && b instanceof Object) {
        diffInternalObject(a, b, acc, base);
    } else {
        set(acc, base, b)
    }
}


function diffInternalArray(a, b, acc, base) {
    let an = a.length - 1;
    let bn = b.length - 1;

    // Loop backwards (so that making changes in order will work correctly).
    while(an >= 0 && bn >= 0) {
        if (equal(a[an], b[bn])) {
            an--;
            bn--;
        } else {
            const indexes = findMatchIndexes(equal, a,b, an,bn, 0, 0)

            // Loop backwards from the point at which the lists are not equal and find which elements can be matched
            // as similar or can be expressed as additions, changes, or removals.
            let anInner=an;
            let bnInner=bn;
            while(anInner > indexes.a && bnInner > indexes.b) {
                if (similar(a[anInner], b[bnInner])) {
                    // get change for that element
                    diffInternal(a[anInner],b[bnInner],acc, base.concat([anInner]));
                    anInner--;
                    bnInner--;
                } else {
                    const indexesInner = findMatchIndexes(similar, a, b, anInner, bnInner, indexes.a+1, indexes.b+1);
                    const numberPulled = anInner - indexesInner.a;
                    const numberPushed = bnInner - indexesInner.b;

                    if (numberPulled === 1 && numberPushed === 1) {
                        // set the one
                        set(acc, base.concat(indexesInner.a + 1), b[indexesInner.b + 1]);
                    } else if (numberPulled === 1 && numberPushed === 2) {
                        // set one, push the other
                        add(acc, base,indexesInner.a + 2, b.slice(indexesInner.b + 2, bnInner + 1));
                        set(acc, base.concat(indexesInner.a + 1), b[indexesInner.b + 1]);
                    } else if (numberPulled === 2 && numberPushed === 1) {
                        // set one, pull the other
                        rm(acc, base, indexesInner.a + 2, 1, a);
                        set(acc, base.concat(indexesInner.a + 1), b[indexesInner.b+1]);
                    } else if (numberPulled === 2 && numberPushed === 2) {
                        set(acc, base.concat(indexesInner.a + 2), b[indexesInner.b+2]);
                        set(acc, base.concat(indexesInner.a + 1), b[indexesInner.b+1]);
                    } else {
                        if (numberPulled > 0) { // if there were some elements pulled
                            rm(acc, base, indexesInner.a+1, numberPulled, a);
                        }
                        if (numberPushed > 0) { // if there were some elements pushed
                            add(acc, base,indexesInner.a+1, b.slice(indexesInner.b + 1, bnInner + 1));
                        }
                    }

                    anInner = indexesInner.a
                    bnInner = indexesInner.b
                }
            }
            if (anInner > indexes.a) {
                // more to pull
                rm(acc, base, indexes.a+1, anInner-indexes.a, a);
            } else if (bnInner > indexes.b) {
                // more to push
                add(acc, base, anInner+1, b.slice(indexes.b+1, bnInner+1));
            }

            an = indexes.a;
            bn = indexes.b;
        }
    }

    if (an >= 0) {
        // more to pull
        rm(acc, base, 0, an+1, a);
    } else if (bn >= 0) {
        // more to push
        add(acc, base,0, b.slice(0, bn+1));
    }
}


function diffInternalDate(a, b, acc, base) {
    if (a.getTime() !== b.getTime()) {
        set(acc, base, b);
    }
}


function diffInternalObject(a, b, acc, base) {
    if (a.constructor !== b.constructor) {
        set(acc, base, b);
    } else {
        const keyMap = merge(arrayToMap(Object.keys(a)), arrayToMap(Object.keys(b)));
        for (let key in keyMap) {
            const path = base.concat([key]);
            if (key in a && !(key in b)) {
                unset(acc, path);
            } else {
                diffInternal(a[key], b[key], acc, path);
            }
        }
    }
}


/**
 * Finds and returns the closest indexes in a and b that match starting with divergenceIndex
 * Note: loops backwards like the rest of this stuff
 * compareFn: determines what matches (returns true if the arguments match)
 * a,b: two arrays to compare
 * divergenceIndexA,divergenceIndexB: the two positions of a and b to start comparing from
 * aSubMin,bSubMin: the two positions to compare until
 * Returns the index beyond the first element (aSubMin-1 or bSubMin-1) for each if there is no match
 */
function findMatchIndexes(compareFn, a,b, divergenceIndexA,divergenceIndexB, aSubMin, bSubMin) {
    const maxNForA = divergenceIndexA - aSubMin;
    const maxNForB = divergenceIndexB - bSubMin;
    const maxN = Math.max(maxNForA, maxNForB);
    for (let n = 1; n <= maxN; n++) {
        // the current item farthest from the divergence index being compared
        const newestA = a[divergenceIndexA-n];
        const newestB = b[divergenceIndexB-n];

        if (n<=maxNForB && n<=maxNForA && compareFn(newestA, newestB))
            return {a: divergenceIndexA - n, b: divergenceIndexB - n};

        for (let j = 0; j < n; j++) {
            // an element between the divergence index and the newest items
            const elemA = a[divergenceIndexA-j];
            const elemB = b[divergenceIndexB-j];

            if (n<=maxNForB && compareFn(elemA, newestB)) {
                return {a: divergenceIndexA - j, b: divergenceIndexB - n};
            } else if (n<=maxNForA && compareFn(newestA, elemB)) {
                return {a: divergenceIndexA - n, b: divergenceIndexB - j};
            }
        }
    }
    // else
    return {a: aSubMin - 1, b: bSubMin - 1};
}


/**
 * compares arrays and objects and returns true if they're similar meaning:
 * less than 2 changes, or
 * less than 10% different members
 */
function similar(a,b) {
    if (a instanceof Array) {
        if (!(b instanceof Array))
            return false;

        return similarArrays(a, b);

    } else if (a instanceof Object) {
        if (!(b instanceof Object))
            return false;

        return similarObjects(a, b);

    } else {
        return a===b || (Number.isNaN(a) && Number.isNaN(b));
    }
}

function similarArrays(a, b) {
    const tenPercent = a.length / 10;
    let notEqual = Math.abs(a.length - b.length);
    for (let n=0; n<a.length; n++) {
        if (!equal(a[n], b[n])) {
            if ((notEqual >= 2 && notEqual > tenPercent) || notEqual === a.length)
                return false

            notEqual++;
        }
    }
    // else
    return true;
}

function similarObjects(a, b) {
    const keyMap = merge(arrayToMap(Object.keys(a)), arrayToMap(Object.keys(b)));
    const keyLength = Object.keys(keyMap).length;
    const tenPercent = keyLength / 10;
    let notEqual = 0;
    for (let key in keyMap) {
        const aVal = a[key];
        const bVal = b[key];

        if (!equal(aVal, bVal)) {
            if ((notEqual >= 2 && notEqual > tenPercent) || notEqual + 1 === keyLength)
                return false

            notEqual++;
        }
    }
    // else
    return true;
}

/**
 * compares arrays and objects for value equality (all elements and members must match)
 */
function equal(a, b) {
    if (a instanceof Array) {
        if (!(b instanceof Array))
            return false;

        if (a.length !== b.length)
            return false;

        for (let n = 0; n < a.length; n++) {
            if (!equal(a[n], b[n]))
                return false;
        }
        // else
        return true;
    } else if (a instanceof Object) {
        if (!(b instanceof Object))
            return false;

        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length)
            return false;

        for (let n = 0; n < aKeys.length; n++) {
            const key = aKeys[n];
            const aVal = a[key];
            const bVal = b[key];
            if (!equal(aVal, bVal))
                return false;
        }
        // else
        return true;
    } else {
        return a===b || (Number.isNaN(a) && Number.isNaN(b));
    }
}


/**
 * turns an array of values into an object where those values are all keys that point to 'true'
 */
function arrayToMap(array) {
    const result = {};
    array.forEach((v) => {
        result[v] = true;
    })
    return result;
}

/**
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1
 * returns obj1 (now mutated)
 */
function merge(obj1, obj2){
    for (let key in obj2){
        if (obj2.hasOwnProperty(key)) {
            obj1[key] = obj2[key];
        }
    }
    return obj1;
}
