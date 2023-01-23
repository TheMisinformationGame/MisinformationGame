import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import React from "react";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ReplyIcon from "@mui/icons-material/Reply";
import MuiFlagIcon from "@mui/icons-material/Flag";

export function LikeIcon(props) {
    return (
        <span {...props} className={"inline-block text-gray-700 mr-2 " + (props.className || "")}>
            <ThumbUpIcon />
        </span>
    );
}

export function DislikeIcon(props) {
    return (
        <span {...props} className={"inline-block text-gray-700 mr-2 " + (props.className || "")}>
            <ThumbDownIcon />
        </span>
    );
}

export function ShareIcon(props) {
    return (
        <span {...props} className={"inline-block text-gray-700 mr-2 transform scale-125 " + (props.className || "")}>
            <ReplyIcon className="transform flip-x -translate-y-0.5 -scale-x-1"
                       style={{fontSize: "1.7em"}}/>
        </span>
    );
}

export function FlagIcon(props) {
    return (
        <span {...props} className={"inline-block text-gray-700 mr-2" + (props.className || "")}>
            <MuiFlagIcon style={{fontSize: "1.6em", marginLeft: "-0.05em", marginTop: "-0.1em"}} />
        </span>
    );
}
