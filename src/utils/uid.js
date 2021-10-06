/**
 * A UID generation function adapted from https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid.
 *
 * Note: This function does NOT generate valid UUIDs. It generates 16-character
 * unique IDs for use in our URLs, as full UUIDS would be too cumbersome. The
 * output is also not hex, it is base-36 (10 digits + 26 letters).
 */
export function generateUID() {
    //Timestamp
    let d = new Date().getTime();
    // Time in microseconds since page-load or 0 if unsupported
    let d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;

    let uid = "";
    while (uid.length < 16) {
        let r = Math.random() * 36;//random number between 0 and 36
        if(d > 0) { // Use timestamp until depleted
            r = (d + r)%36 | 0;
            d = Math.floor(d/36);
        } else { // Use microseconds since page-load if supported
            r = (d2 + r)%36 | 0;
            d2 = Math.floor(d2/36);
        }
        uid += r.toString(36);
    }
    return uid;
}
