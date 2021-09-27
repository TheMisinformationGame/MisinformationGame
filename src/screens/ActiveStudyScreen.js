import {Component} from "react";
import {getDataManager} from "../model/manager";

/**
 * Automatically sets the active study for the data manager.
 */
export class ActiveStudyScreen extends Component {
    constructor(props) {
        super(props);
        getDataManager().setActiveStudy(
            props.match.params.studyID
        );
    }
}
