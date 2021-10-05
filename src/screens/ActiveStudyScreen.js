import {getDataManager} from "../model/manager";
import {ErrorLabel, ProgressLabel} from '../components/StatusLabel';
import {MountAwareComponent} from "../components/MountAwareComponent";

/**
 * Automatically sets the active study for the data manager.
 */
export class ActiveStudyScreen extends MountAwareComponent {
    constructor(props) {
        super(props);
        getDataManager().setActiveStudy(
            props.match.params.studyID
        );
    }
}

/**
 * Automatically sets the active study for the data manager,
 * and only renders the screen once the study is loaded.
 */
export class SimpleActiveStudyScreen extends ActiveStudyScreen {
    constructor(props, preloadGame) {
        super(props);
        this.preloadGame = !!preloadGame;
        this.state = {
            study: null,
            studyLoading: true,
            studyLoadError: null
        };
        this.studyUpdateListener = (study) => {
            const currentStudy = this.state.study;
            if (currentStudy && study.id === currentStudy.id) {
                this.setStateIfMounted({...this.state, study: study, studyLoading: false});
            }
        };
    }

    componentDidMount() {
        super.componentDidMount();

        const manager = getDataManager();
        manager.addUpdateListener(this.studyUpdateListener);

        manager.getActiveStudy().then(study => {
            this.setStateIfMounted({...this.state, study: study, studyLoading: false});
        }).catch(err => {
            console.error(err);
            this.setStateIfMounted({...this.state, studyLoadError: err.message, studyLoading: false});
        });

        // Preload the game.
        if (this.preloadGame) {
            manager.getActiveGame().then((game) => {
                game.preloadCurrentState();
            }).catch(err => {
                console.error(err);
                this.setStateIfMounted({...this.state, studyLoadError: err.message, studyLoading: false});
            });
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        getDataManager().removeUpdateListener(this.studyUpdateListener);
    }

    /**
     * This method or the render method must be overridden in sub-classes.
     */
    renderWithStudy(study) {
        throw new Error("Implement the renderWithStudy(study) method");
    }

    /**
     * This method or the renderWithStudy method must be overridden in sub-classes.
     */
    render() {
        if (this.state.studyLoadError) {
            return (
                <ErrorLabel className="text-2xl m-2"
                            value={this.state.studyLoadError} />
            );
        }
        if (this.state.studyLoading) {
            return (
                <ProgressLabel className="text-2xl m-2"
                               value="The study is loading..." />
            );
        }

        const study = this.state.study;
        if (!study) {
            return (
                <ErrorLabel className="text-2xl m-2"
                            value="The study did not load correctly." />
            );
        }
        return this.renderWithStudy(study);
    }
}
