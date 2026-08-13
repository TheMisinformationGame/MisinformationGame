import { Component } from "react";

/**
 * Opens a link in a popup window and tracks how long it's open.
 * Monitors when the popup is closed and reports timing data.
 */
export class LinkPopupModal extends Component {
    constructor(props) {
        super(props);
        this.openTime = Date.now();
        this.popupWindow = null;
        this.checkInterval = null;
        this.maxDurationTimeout = null;
        this.unknownStateTimeout = null;
        this.closeReported = false;
        this.pendingCloseDetected = false;
        this.hasLostFocus = false;
    }

    getPopupClosedState() {
        if (!this.popupWindow) {
            return true;
        }

        try {
            return this.popupWindow.closed;
        } catch (error) {
            // Some cross-origin pages can make "closed" reads unreliable.
            return null;
        }
    }

    clearDetectionTimers() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }

        if (this.maxDurationTimeout) {
            clearTimeout(this.maxDurationTimeout);
            this.maxDurationTimeout = null;
        }

        if (this.unknownStateTimeout) {
            clearTimeout(this.unknownStateTimeout);
            this.unknownStateTimeout = null;
        }
    }

    componentDidMount() {
        const { url } = this.props;
        this.onWindowBlur = () => {
            this.hasLostFocus = true;
        };
        this.onWindowFocus = () => {
            if (this.pendingCloseDetected) {
                this.handleClose();
                return;
            }

            // Fallback for cross-origin windows where "closed" cannot be read.
            if (this.hasLostFocus && this.getPopupClosedState() === null) {
                if (this.unknownStateTimeout) {
                    clearTimeout(this.unknownStateTimeout);
                }

                this.unknownStateTimeout = setTimeout(() => {
                    if (!this.closeReported && document.hasFocus()) {
                        this.handleClose();
                    }
                }, 1200);
            }
        };

        window.addEventListener("blur", this.onWindowBlur);
        window.addEventListener("focus", this.onWindowFocus);
        
        // Open popup window (80% of screen size, centered)
        const width = Math.floor(window.screen.width * 0.8);
        const height = Math.floor(window.screen.height * 0.8);
        const left = Math.floor((window.screen.width - width) / 2);
        const top = Math.floor((window.screen.height - height) / 2);
        
        this.popupWindow = window.open(
            url,
            '_blank',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=yes,location=yes`
        );
        
        // If popup was blocked or failed to open, close immediately
        if (this.getPopupClosedState() === true) {
            console.warn('Popup was blocked or failed to open');
            this.handleClose();
            return;
        }

        // Final guard: never leave the game blocked forever.
        this.maxDurationTimeout = setTimeout(() => {
            if (!this.closeReported) {
                console.warn('Popup close detection timeout reached; releasing block.');
                this.handleClose();
            }
        }, 30 * 60 * 1000);
        
        // Poll to detect when popup closes
        this.checkInterval = setInterval(() => {
            const popupClosedState = this.getPopupClosedState();
            if (popupClosedState === true) {
                // In some cross-origin cases, popup can appear closed early.
                // Defer close until focus returns if the game window lost focus.
                const elapsed = Date.now() - this.openTime;
                if (this.hasLostFocus && !document.hasFocus()) {
                    this.pendingCloseDetected = true;
                    return;
                }

                // If focus never moved, add a small guard delay to avoid false positives.
                if (!this.hasLostFocus && elapsed < 2000) {
                    this.pendingCloseDetected = true;
                    return;
                }

                this.handleClose();
            }
        }, 500);
    }

    componentWillUnmount() {
        window.removeEventListener("blur", this.onWindowBlur);
        window.removeEventListener("focus", this.onWindowFocus);
        this.clearDetectionTimers();
    }

    handleClose = () => {
        if (this.closeReported) {
            return;
        }
        this.closeReported = true;
        this.clearDetectionTimers();
        
        const closeTime = Date.now();
        const duration = closeTime - this.openTime;
        
        const popupData = {
            openTime: this.openTime,
            closeTime: closeTime,
            duration: duration
        };
        
        if (this.props.onClose) {
            this.props.onClose(popupData);
        }
    }

    render() {
        // This component doesn't render anything visible
        return null;
    }
}
