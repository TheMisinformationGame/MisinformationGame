import {doTypeCheck} from "../utils/types";


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

    static convertIDtoNumber(postID) {
        const numberStr = postID.replace(/\D/g,'');
        if (numberStr.length === 0)
            return null;

        return parseInt(numberStr);
    }

    loop() {
        this.loopHandle = null;
        if (!this.running)
            return;

        const feedDiv = this.getFeedDivFn();
        if (feedDiv) {
            const postLocations = this.detectPostLocations(feedDiv),
                  dScrollY = window.scrollY - this.lastScrollY;

            const postIDsByNumber = {};
            let highestPostID = null,
                highestPostIDNumber = null,
                highestY = null;

            // Search for the post to anchor to.
            for (let postID in postLocations) {
                if (!postLocations.hasOwnProperty(postID))
                    continue;

                const current = postLocations[postID],
                      last = this.lastPostLocations[postID];

                if (last === undefined || current.y + current.height <= 0)
                    continue;

                const postIDNumber = ScrollAnchor.convertIDtoNumber(postID);
                if (postIDNumber === null)
                    continue

                if (!postIDsByNumber.hasOwnProperty(postIDNumber)) {
                    postIDsByNumber[postIDNumber] = [];
                }
                postIDsByNumber[postIDNumber].push(postID);

                if (highestY === null || current.y < highestY) {
                    highestPostID = postID;
                    highestPostIDNumber = postIDNumber;
                    highestY = current.y;
                }
            }

            // Detect any layout shifts above the anchor post.
            let scrollYChange = 0;
            if (highestPostIDNumber !== null) {
                let layoutYShift = 0;
                for (let postID in this.lastPostLocations) {
                    if (!this.lastPostLocations.hasOwnProperty(postID))
                        continue;

                    const previousLoc = this.lastPostLocations[postID],
                          newLoc = postLocations[postID];
                    if (newLoc !== undefined)
                        continue

                    const postIDNumber = ScrollAnchor.convertIDtoNumber(postID);
                    if (postIDNumber === null)
                        continue

                    if (postIDNumber < highestPostIDNumber) {
                        layoutYShift += previousLoc.height;
                    }
                }

                // Correct layout shifts that the browser hasn't anchored correctly.
                if (layoutYShift > 10) {
                    const shift = layoutYShift + dScrollY;
                    if (shift > 10) {
                        scrollYChange = -shift;
                        window.scrollBy(0, scrollYChange);
                        console.log(
                            "Correcting layout shift. Anchored to",
                            highestPostID, "and scrolling by", scrollYChange,
                            "(", dScrollY, " + ", layoutYShift, ")"
                        );
                    }
                }

                // If nothing has changed, exclude the top post from being used as a scroll anchor.
                if (layoutYShift < 0.1) {
                    const elementIDs = postIDsByNumber[highestPostIDNumber];
                    for (let index = 0; index < elementIDs.length; ++index) {
                        const elementID = elementIDs[index],
                              element = document.getElementById(elementID);

                        if (element != null) {
                            element.classList.add("no-overflow-anchor");
                        }
                    }
                }
            }

            this.lastPostLocations = postLocations;
            this.lastScrollY = window.scrollY + scrollYChange;
        }

        this.loopHandle = requestAnimationFrame(this.loop.bind(this));
    }

    scroll(event) {}

    detectPostLocations(feedDiv) {
        const postDivs = feedDiv.children;

        const locations = {};
        for (let index = 0; index < postDivs.length; ++index) {
            const postDiv = postDivs[index],
                  postID = postDiv.id;

            if (postID && ScrollAnchor.convertIDtoNumber(postID) !== null) {
                const rect = postDiv.getBoundingClientRect();
                locations[postID] = new RectBBox(rect.x, rect.y, rect.width, rect.height);
            }
        }
        return locations;
    }
}
