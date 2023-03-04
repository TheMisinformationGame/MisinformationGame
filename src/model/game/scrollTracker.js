import {doNonNullCheck, doTypeCheck} from "../../utils/types";


function detectViewHeight() {
    const height = Math.max(
        window.innerHeight || 0,
        document.clientHeight || 0,
        (document.documentElement && document.documentElement.clientHeight) || 0
    );
    if (height !== 0)
        return height;

    return document.getElementsByTagName("body")[0].clientHeight;
}


/**
 * A mutable rectangle bounding box from the DOM.
 * We use this instead of the default result of
 * getBoundingClientRect() due to this mutability.
 */
class PostBBox {
    postIndex; // string
    postDiv; // DOM Element
    viewHeight; // number
    x;  // number
    y;  // number
    width;  // number
    height;  // number
    onScreen; // boolean
    onScreenPercent; // number
    aboveScreen; // boolean
    belowScreen; // boolean

    constructor(postIndex, postDiv, viewHeight, x, y, width, height) {
        doTypeCheck(postIndex, "number", "postIndex");
        doNonNullCheck(postDiv, "postDiv");
        doTypeCheck(viewHeight, "number", "viewHeight");
        doTypeCheck(x, "number", "x");
        doTypeCheck(y, "number", "y");
        doTypeCheck(width, "number", "width");
        doTypeCheck(height, "number", "height");
        this.postIndex = postIndex;
        this.postDiv = postDiv;
        this.viewHeight = viewHeight;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        const top = Math.max(0, Math.min(viewHeight, this.y));
        const bottom = Math.max(0, Math.min(viewHeight, this.y + this.height));
        const heightInView = bottom - top;
        this.onScreenPercent = heightInView / Math.min(this.height, viewHeight);
        this.onScreen = this.onScreenPercent > 0;
        this.aboveScreen = (bottom === 0);
        this.belowScreen = (top === viewHeight);
    }
}


/**
 * Tracks the positions of elements within a div as it is scrolled.
 */
export class ScrollTracker {
    constructor(getFeedDivFn, monitorFn) {
        doTypeCheck(getFeedDivFn, "function", "getFeedDivFn");
        doTypeCheck(monitorFn, "function", "monitorFn");
        this.getFeedDivFn = getFeedDivFn;
        this.monitorFn = monitorFn;

        this.running = false;
        this.loopIntervalID = null;
        this.lastPostBBoxes = {};
    }

    start() {
        if (this.running)
            throw new Error("Already running");

        this.running = true;
        this.loopIntervalID = setInterval(this.loop.bind(this), 50);
    }

    stop() {
        this.running = false;
        if (this.loopIntervalID !== null) {
            clearInterval(this.loopIntervalID);
            this.loopIntervalID = null;
        }
    }

    get(postIndex) {
        if (!this.lastPostBBoxes.hasOwnProperty(postIndex))
            return null;

        return this.lastPostBBoxes[postIndex];
    }

    loop() {
        const feedDiv = this.getFeedDivFn();
        if (feedDiv) {
            const postBBoxes = this.detectPostBBoxes(feedDiv);

            for (let postIndex in postBBoxes) {
                if (!postBBoxes.hasOwnProperty(postIndex))
                    continue;

                const loc = postBBoxes[postIndex];

                // Check if the post was newly introduced.
                if (!this.lastPostBBoxes.hasOwnProperty(postIndex)) {
                    this.monitorFn(null, loc);
                    continue;
                }

                const lastLoc = this.lastPostBBoxes[postIndex];
                if (loc.onScreenPercent === lastLoc.onScreenPercent)
                    continue;

                this.monitorFn(lastLoc, loc);
            }

            this.lastPostBBoxes = postBBoxes;
        }
    }

    static convertIDtoIndex(postIndex) {
        const numberStr = postIndex.replace(/\D/g,'');
        if (numberStr.length === 0)
            return null;

        return parseInt(numberStr);
    }

    detectPostBBoxes(feedDiv) {
        const postDivs = feedDiv.children;
        const viewHeight = detectViewHeight();

        const locations = {};
        for (let index = 0; index < postDivs.length; ++index) {
            const postDiv = postDivs[index],
                  postIndex = ScrollTracker.convertIDtoIndex(postDiv.id);

            if (postIndex !== null) {
                const rect = postDiv.getBoundingClientRect();
                locations[postIndex] = new PostBBox(
                    postIndex, postDiv, viewHeight,
                    rect.x, rect.y, rect.width, rect.height
                );
            }
        }
        return locations;
    }
}
