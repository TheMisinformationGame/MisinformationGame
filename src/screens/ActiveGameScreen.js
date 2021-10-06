import {ActiveStudyScreen} from "./ActiveStudyScreen";
import {getDataManager} from "../model/manager";
import {ErrorLabel, ProgressLabel} from "../components/StatusLabel";

/**
 * Automatically sets the active study, and retrieves
 * the active game, for the data manager. The page will
 * only render once the study and game is loaded.
 */
export class ActiveGameScreen extends ActiveStudyScreen {
    constructor(props) {
        super(props);

        // Get the session ID from the URL.
        getDataManager().setSessionID(new URLSearchParams(window.location.search).get("s"));

        this.defaultState = {
            study: null,
            studyLoading: true,
            studyLoadError: null,

            game: null,
            gameLoading: true,
            gameLoadError: null
        };
        this.state = this.defaultState;
        this.studyUpdateListener = (study) => {
            const currentStudy = this.state.study;
            if (!currentStudy || study.id !== currentStudy.id)
                return;

            // Set the new active study, and reload the active game.
            this.setStateIfMounted({...this.defaultState, study: study, studyLoading: false,});
            this.reloadActiveGame();
        };
    }

    reloadActiveGame() {
        const manager = getDataManager();
        manager.getActiveGame().then((game) => {
            this.setStateIfMounted({...this.state, game: game, gameLoading: false});

            const sessionID = manager.getSessionID();
            const queryParams = new URLSearchParams(window.location.search);
            if (queryParams.get("s") !== sessionID) {
                queryParams.set("s", sessionID);
                this.props.history.replace(window.location.pathname + "?" + queryParams);
            }
        }).catch(err => {
            console.error(err);
            this.setStateIfMounted({...this.state, gameLoadError: err.message, gameLoading: false});
        });
    }

    componentDidMount() {
        super.componentDidMount();

        const manager = getDataManager();
        manager.addUpdateListener(this.studyUpdateListener);

        // Load the active study.
        manager.getActiveStudy().then(study => {
            this.setStateIfMounted({...this.state, study: study, studyLoading: false});
        }).catch(err => {
            console.error(err);
            this.setStateIfMounted({...this.state, studyLoadError: err.message, studyLoading: false});
        });

        // Load the current game.
        this.reloadActiveGame();
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        getDataManager().removeUpdateListener(this.studyUpdateListener);
    }

    /**
     * This method or the render method must be overridden in sub-classes.
     */
    renderWithStudyAndGame(study, game) {
        throw new Error("Implement the renderWithStudyAndGame(study, game) method");
    }

    /**
     * This method or the renderWithStudyAndGame method must be overridden in sub-classes.
     */
    render() {
        const error = this.state.studyLoadError || this.state.gameLoadError;
        if (error)
            return <ErrorLabel className="text-2xl m-2" value={error} />;

        if (this.state.studyLoading)
            return <ProgressLabel className="text-2xl m-2" value="The study is loading..." />;
        if (this.state.gameLoading)
            return <ProgressLabel className="text-2xl m-2" value="The game is loading..." />;

        const study = this.state.study;
        const game = this.state.game;
        if (!study)
            return <ErrorLabel className="text-2xl m-2" value="The study did not load correctly." />;
        if (!game)
            return <ErrorLabel className="text-2xl m-2" value="The game did not load correctly." />;

        return this.renderWithStudyAndGame(study, game);
    }
}