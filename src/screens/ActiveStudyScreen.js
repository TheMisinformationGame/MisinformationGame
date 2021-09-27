import {Component} from "react";
import {getDataManager} from "../model/manager";
import {ErrorLabel, ProgressLabel} from '../components/StatusLabel';

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
    }

    componentDidMount() {
        getDataManager().getActiveStudy().then(study => {
            this.setState({...this.state, study: study, studyLoading: false});
        }).catch(err => {
            console.error(err);
            this.setState({...this.state, studyLoadError: err.message, studyLoading: false});
        });

        // Preload the game.
        if (this.preloadGame) {
            getDataManager().getActiveGame().then((game) => {
                game.preloadCurrentState();
            }).catch(err => {
                console.error(err);
                this.setState({...this.state, studyLoadError: err.message, studyLoading: false});
            });
        }
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
        if (this.state.studyLoading) {
            return (
                <ProgressLabel className="text-2xl m-2"
                               value="The study is loading..." />
            );
        }
        if (this.state.studyLoadError) {
            return (
                <ErrorLabel className="text-2xl m-2"
                            value={this.state.studyLoadError} />
            );
        }
        return this.renderWithStudy(this.state.study);
    }
}
