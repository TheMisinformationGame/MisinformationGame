import React, {Component} from "react";


/**
 * A button for a participant to react to a post or comment.
 */
export class ReactButton extends Component {
    getPositioningClassName(wide) {
        return "h-12 pt-1.5 px-4 " + (wide ? "w-32" : "w-16");
    }

    getReactionCountClassName() {
        return "absolute top-10 left-1/2 transform -translate-x-1/2 p-1 text-lg font-bold";
    }

    render() {
        const enabled = this.props.enabled;
        const reaction = this.props.reaction;
        const grayOut = this.props.grayOut;
        const selected = this.props.selected;
        const wide = this.props.wide;

        let reactionCount = this.props.reactionCount;
        if (typeof(reactionCount) === "number" && selected) {
            reactionCount += 1;
        }
        return (
            <div id={reaction}
                 title={this.props.title}
                 className={
                     " relative group rounded text-center " +
                     " fill-current transition duration-100 " +
                     " " + this.getPositioningClassName(wide) + " " +
                     (selected ? " bg-gray-100 font-semibold " : (enabled ? " hover:bg-gray-100 " : "")) +
                     (enabled ? " cursor-pointer " : "") +
                     (enabled && (selected || !grayOut) ?
                         (selected ? " text-blue-700 " : " text-gray-700 ")
                         : " text-gray-500 ") +
                     (this.props.className  || "")}
                 style={{fontSize: (this.props.fontSize || "2.5rem")}}
                 onClick={() => {
                     if (enabled) {
                         this.props.onReact(reaction);
                     }
                 }}>

                {/* This extra div avoids the scale transforms from overriding one another for shares. */}
                <div className={(enabled ? "transform group-hover:scale-110 " : "")}>
                    {React.cloneElement(this.props.children, {
                        className: "fill-current " +
                            (this.props.childClassName || ""),
                        fontSize: "inherit"
                    })}
                </div>

                {reactionCount !== undefined &&
                    <p className={this.getReactionCountClassName()} >
                        {Math.round(reactionCount)}
                    </p>}
            </div>
        );
    }
}


/**
 * A reaction button for a comment.
 */
export class CommentReactButton extends ReactButton {
    getPositioningClassName() {
        return "h-9 w-11 pt-1.5 pb-0.5 px-3 mr-1";
    }

    getReactionCountClassName() {
        return "absolute top-8 left-1/2 transform -translate-x-1/2 p-0.5 text-base font-bold";
    }
}
