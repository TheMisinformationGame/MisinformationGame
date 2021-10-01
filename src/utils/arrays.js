
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
