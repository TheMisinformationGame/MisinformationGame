import {Component} from "react";
import {getDataManager} from "../model/manager";

/**
 * Automatically sets the active study for the data manager.
 */
export class ActiveStudyScreen extends Component {
    componentDidMount() {
        const studyID = this.props.match.params.studyID;
        getDataManager().setActiveStudy(studyID);
    }
}
