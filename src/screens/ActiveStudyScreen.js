import {getDataManager} from "../model/manager";
import {MountAwareComponent} from "../components/MountAwareComponent";

/**
 * Automatically sets the active study for the data manager.
 */
class ActiveStudyScreen extends MountAwareComponent {
    constructor(props) {
        super(props);
        getDataManager().setActiveStudy(
            props.params.studyID
        );
    }
}

export default ActiveStudyScreen;
