import {doTypeCheck} from "../../utils/types";
import {getPerformanceTime} from "../../utils/time";
import {roundInDir} from "../../utils/numbers";

/**
 * Controls the dynamic feedback that is given to participants.
 */
export class DynamicFeedback {
    startTime; // performance time
    endTime; // performance time
    startValue; // float
    endValue; // float
    change; // float

    constructor(startTime, endTime, startValue, endValue) {
        doTypeCheck(startTime, "number", "Start Time of Dynamic Feedback");
        doTypeCheck(endTime, "number", "End Time of Dynamic Feedback");
        doTypeCheck(startValue, "number", "Starting Value of Dynamic Feedback");
        doTypeCheck(endValue, "number", "End Value of Dynamic Feedback");

        if (!Number.isInteger(endValue))
            throw new Error("The end value should be an integer, not " + endValue);

        this.startTime = startTime;
        this.endTime = endTime;
        this.startValue = startValue;
        this.endValue = endValue;
        this.change = endValue - startValue;
    }

    /**
     * Retrieves the current value to display, as a
     * floating point value.
     */
    get() {
        const time = getPerformanceTime();
        if (time >= this.endTime)
            return this.endValue;
        if (time <= this.startTime)
            return this.startValue;

        const ratio = (time - this.startTime) / (this.endTime - this.startTime);
        return ratio * (this.endValue - this.startValue) + this.startValue;
    }

    isFinished() {
        return getPerformanceTime() >= this.endTime;
    }

    /**
     * Combines the given dynamic feedback, so that they
     * can both be shown to participants at once. The
     * second dynamic feedback must have a starting value
     * that is the same as the end value of the first
     * dynamic feedback.
     */
    static combine(first, second) {
        doTypeCheck(first, DynamicFeedback, "First Dynamic Feedback to Combine");
        doTypeCheck(second, DynamicFeedback, "Second Dynamic Feedback to Combine");

        if (first.endValue !== second.startValue)
            throw new Error("The dynamic feedback are not consecutive: " + first.endValue + " != " + second.startValue);

        const firstProgress = first.get() - first.startValue;
        const secondProgress = second.get() - second.startValue;

        const startValue = first.startValue + firstProgress + secondProgress;
        const endValue = second.endValue;
        const startTime = getPerformanceTime();
        const endTime = Math.max(first.endTime, second.endTime);
        return new DynamicFeedback(startTime, endTime, startValue, endValue)
    }
}


/**
 * A controller for updating and applying dynamic feedback.
 * The dynamic feedback value is rounded before being passed
 * to the update function.
 */
export class DynamicFeedbackController {
    animateTimeMS; // number
    updateFn; // (value, completed) => {}

    feedback; // DynamicFeedback or null
    timer; // function
    timerID; // requestAnimationFrame ID or null

    constructor(animateTimeMS, updateFn) {
        doTypeCheck(animateTimeMS, "number", "Animation Time for Dynamic Feedback");
        doTypeCheck(updateFn, "function", "Update Function for Dynamic Feedback");

        this.animateTimeMS = animateTimeMS;
        this.updateFn = updateFn;

        this.feedback = null;
        this.lastValue = null;
        this.timer = this.update.bind(this);
        this.timerID = null;
    }

    addFeedback(startValue, endValue) {
        const now = getPerformanceTime();
        const newFeedback = new DynamicFeedback(
            now, now + this.animateTimeMS,
            startValue, endValue
        );

        if (this.feedback) {
            this.feedback = DynamicFeedback.combine(this.feedback, newFeedback);
        } else {
            this.feedback = newFeedback;
            this.update();
        }
    }

    round(value) {
        return roundInDir(value, this.feedback.change);
    }

    update() {
        this.timerID = null;

        if (this.feedback.isFinished()) {
            this.updateFn(this.feedback.endValue, true);
            this.cancel();
            return;
        }

        const value = this.round(this.feedback.get());
        if (this.lastValue === null || value !== this.lastValue) {
            this.updateFn(value, false);
            this.lastValue = value;
        }

        this.timerID = requestAnimationFrame(this.timer);
    }

    cancel() {
        this.feedback = null;
        this.lastValue = null;
        if (this.timerID) {
            cancelAnimationFrame(this.timerID);
            this.timerID = null;
        }
    }
}

