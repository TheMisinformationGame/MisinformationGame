import {Component} from "react";


export class CredibilityLabel extends Component {
    /**
     * Intermediate colours generated using
     * https://colordesigner.io/gradient-generator.
     */
    static getCredibilityColour(credibility) {
        if (credibility < 10) return "#961818";
        if (credibility < 20) return "#b24418";
        if (credibility < 30) return "#c96b1a";
        if (credibility < 40) return "#dc9221";
        if (credibility < 50) return "#eaba32";
        if (credibility < 60) return "#19d0cc";
        if (credibility < 70) return "#00b3d9";
        if (credibility < 80) return "#0092e6";
        if (credibility < 90) return "#006be2";
        return "#0038c3";
    }

    render() {
        const cred = Math.round(this.props.credibility);
        const colour = CredibilityLabel.getCredibilityColour(cred);
        return (
            <span className={"inline-table font-bold text-white text-center rounded-full mx-1 " +
            (this.props.className || "")}
                  style={{backgroundColor: colour, width: "1.6em", height: "1.57em"}}>

                <span className="table-cell align-middle transform -translate-y-px"
                      style={{fontSize: "0.9em"}}>
                    &nbsp;{cred}&nbsp;
                </span>
            </span>
        );
    }
}
