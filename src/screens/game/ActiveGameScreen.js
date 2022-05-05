import {ActiveStudyScreen} from "../ActiveStudyScreen";
import {getDataManager} from "../../model/manager";
import {ErrorLabel, ProgressLabel} from "../../components/StatusLabel";

/**
 * Automatically sets the active study, and retrieves
 * the active game, for the data manager. The page will
 * only render once the study and game is loaded.
 */
export class ActiveGameScreen extends ActiveStudyScreen {
    constructor(props) {
        super(props);

        const manager = getDataManager();

        // Get the session ID from the URL.
        const sessionID = new URLSearchParams(window.location.search).get("s");
        if (sessionID) {
            manager.setSessionID(sessionID);
        }

        // If the study and game are already loaded,
        // then skip the delayed Promise step.
        const knownStudy = manager.activeStudy;
        const knownGame = manager.activeGame;
        this.defaultState = {
            study: knownStudy,
            studyLoading: (knownStudy === null),
            studyLoadError: null,

            game: knownGame,
            gameLoading: (knownGame === null),
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

        if (knownGame !== null) {
            this.afterGameLoaded(knownGame);
        }
    }

    updateQueryParams(game) {
        const sessionID = getDataManager().getSessionID();
        const queryParams = new URLSearchParams(window.location.search);

        let changed = false;
        if (queryParams.get("s") !== sessionID) {
            queryParams.set("s", sessionID);
            changed = true;
        }
        if (queryParams.has("id") && queryParams.get("id") !== game.participant.participantID) {
            game.participant.participantID = queryParams.get("id");
            queryParams.delete("id");
            changed = true;
        }

        if (changed) {
            this.props.history.replace(window.location.pathname + "?" + queryParams);
        }
    }

    /**
     * Overwrite this to run code once the game loads.
     */
    afterGameLoaded(game) {
        document.title = game.study.name;
        this.updateQueryParams(game);
    }

    reloadActiveGame() {
        getDataManager().getActiveGame().then((game) => {
            this.setStateIfMounted({...this.state, game: game, gameLoading: false});
            this.afterGameLoaded(game);
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