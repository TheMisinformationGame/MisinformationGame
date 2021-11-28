
/**
 * Removes the first element equal to {@param element} from {@param array}.
 * This does not error if {@param element} does not exist in {@param array}.
 */
export function removeByValue(array, element) {
    const index = array.indexOf(element);
    if (index === -1)
        return;
    array.splice(index, 1);
}

/**
 * Randomize array in-place using Durstenfeld shuffle algorithm.
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
