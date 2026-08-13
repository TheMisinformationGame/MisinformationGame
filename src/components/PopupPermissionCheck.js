import React, { Component } from "react";

/**
 * Tests whether popups are allowed in this browser/context, and
 * blocks progression with a clear overlay if they are not.
 *
 * Only renders when study.advancedSettings.openLinksInModal is true.
 */
export class PopupPermissionCheck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checked: false,
            allowed: false
        };
    }

    componentDidMount() {
        if (this.props.study.advancedSettings.openLinksInModal) {
            this.testPopup();
        } else {
            // Feature is off — skip check entirely
            this.setState({ checked: true, allowed: true });
        }
    }

    testPopup() {
        const test = window.open("about:blank", "_blank",
            "width=1,height=1,left=-9999,top=-9999");

        if (!test || test.closed || typeof test.closed === "undefined") {
            // Popup was blocked
            this.setState({ checked: true, allowed: false });
        } else {
            test.close();
            this.setState({ checked: true, allowed: true });
        }
    }

    render() {
        const { checked, allowed } = this.state;

        // While checking or allowed, render nothing (transparent pass-through)
        if (!checked || allowed) {
            return null;
        }

        // Popup is blocked — show full-screen blocking overlay
        return (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 mx-4 max-w-lg w-full p-8 text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                        Please Allow Popups to Continue
                    </h2>
                    <p className="text-gray-700 mb-4">
                        This task opens links in popup windows. Your browser has blocked popups for this site.
                    </p>
                    <p className="text-gray-700 mb-6">
                        To continue, please allow popups for this page:
                    </p>
                    <ol className="text-left text-gray-700 mb-6 space-y-2 text-sm bg-gray-50 rounded-lg p-4">
                        <li><b>Chrome:</b> Click the popup blocked icon <span className="font-mono bg-gray-200 px-1 rounded">⊡</span> in the address bar → "Always allow popups from this site"</li>
                        <li><b>Firefox:</b> Click "Options" in the blocked popup notification bar → "Allow popups for this site"</li>
                        <li><b>Safari:</b> Go to Safari → Settings → Websites → Pop-up Windows → set to Allow for this site</li>
                        <li><b>Edge:</b> Click the popup blocked icon in the address bar → "Always allow"</li>
                    </ol>
                    <button
                        onClick={() => this.testPopup()}
                        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-colors">
                        I've Allowed Popups — Try Again
                    </button>
                </div>
            </div>
        );
    }
}
