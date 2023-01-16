import {doTypeCheck} from "../utils/types";
import {getUnixEpochTimeSeconds} from "../utils/time";


/**
 * A mutable rectangle bounding box from the DOM.
 * We use this instead of the default result of
 * getBoundingClientRect() due to its mutability.
 */
class RectBBox {
    x;  // number
    y;  // number
    width;  // number
    height;  // number

    constructor(x, y, width, height) {
        doTypeCheck(x, "number", "x");
        doTypeCheck(y, "number", "y");
        doTypeCheck(width, "number", "width");
        doTypeCheck(height, "number", "height");
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}


/**
 * Complements the browser's built-in scroll anchoring to correct
 * it when it doesn't anchor in the way that we want. The ultimate
 * goal of this class is to enable smooth scrolling through a feed
 * of posts, where posts may be added or removed at any time.
 */
export class ScrollAnchor {
    constructor(getFeedDivFn) {
        doTypeCheck(getFeedDivFn, "function", "getFeedDivFn");
        this.getFeedDivFn = getFeedDivFn;
        this.scrollListener = this.scroll.bind(this);
        this.running = false;
        this.loopHandle = null;
        this.lastPostLocations = {};
        this.lastScrollY = window.scrollY;
        this.frameNumber = 0;
    }

    start() {
        if (this.running)
            throw new Error("Already running");

        this.running = true;
        document.addEventListener("scroll", this.scrollListener);
        this.loop();
    }

    stop() {
        this.running = false;
        document.removeEventListener("scroll", this.scrollListener);
        if (this.loopHandle !== null) {
            cancelAnimationFrame(this.loopHandle);
            this.loopHandle = null;
        }
    }

    loop() {
        // 1 frame: scrollY changes by K
        // 2 frame: boundingClientRect changes by K
        // Is K equal to the offset of the element
        // after the element that is removed?

        this.loopHandle = null;
        if (!this.running)
            return;

        this.frameNumber += 1;

        const feedDiv = this.getFeedDivFn();
        if (feedDiv) {
            const postLocations = this.detectPostLocations(feedDiv),
                  dScrollY = window.scrollY - this.lastScrollY;

            let highestPostID = null,
                highestPostIDNumber = null,
                highestY = null;

            // Search for the post to anchor to.
            for (let postID in postLocations) {
                if (!postLocations.hasOwnProperty(postID))
                    continue;

                const current = postLocations[postID],
                      last = this.lastPostLocations[postID];

                if (last === undefined)
                    continue;

                const postIDNumberStr = postID.replace(/\D/g,'');
                if (postIDNumberStr.length === 0)
                    continue

                if (highestY === null || current.y < highestY) {
                    highestPostID = postID;
                    highestPostIDNumber = parseInt(postIDNumberStr);
                    highestY = current.y;
                }
            }

            // Detect any layout shifts above the anchor post.
            let layoutYShift = 0;
            for (let postID in this.lastPostLocations) {
                if (!this.lastPostLocations.hasOwnProperty(postID))
                    continue;

                const previousLoc = this.lastPostLocations[postID],
                      newLoc = postLocations[postID];
                if (newLoc !== undefined)
                    continue

                const postIDNumberStr = postID.replace(/\D/g,'');
                if (postIDNumberStr.length === 0)
                    continue;

                const postIDNumber = parseInt(postIDNumberStr);
                if (postIDNumber < highestPostIDNumber) {
                    layoutYShift += previousLoc.height;
                }
            }

            // Correct layout shifts that the browser hasn't anchored correctly.
            let scrollYChange = 0;
            if (layoutYShift > 10) {
                const shift = dScrollY + layoutYShift;
                if (shift > 10) {
                    scrollYChange = -shift;
                    window.scrollBy(0, scrollYChange);
                    console.log(
                        "Correcting layout shift. Anchored to",
                        highestPostID, " and scrolling by ", scrollYChange
                    );
                }
            }

            this.lastPostLocations = postLocations;
            this.lastScrollY = window.scrollY + scrollYChange;
        }

        this.loopHandle = requestAnimationFrame(this.loop.bind(this));
    }

    scroll(event) {
        // const dy = window.scrollY - this.lastScrollY;
        // console.log(dy, event);
    }

    detectPostLocations(feedDiv) {
        const postDivs = feedDiv.children;

        const locations = {};
        for (let index = 0; index < postDivs.length; ++index) {
            const postDiv = postDivs[index];
            if (postDiv.id) {
                const rect = postDiv.getBoundingClientRect();
                locations[postDiv.id] = new RectBBox(rect.x, rect.y, rect.width, rect.height);
            }
        }
        return locations;
    }
}
