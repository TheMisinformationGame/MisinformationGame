
/**
 * Capitalises the first letter of the provided text,
 * and converts the remaining letters to lower case.
 * @param text The text to be capitalised.
 */
export function capitalise(text) {
    if (!text)
        return text;

    return text[0].toUpperCase() + text.slice(1).toLowerCase();
}