import {getDataManager} from "../../model/manager";
import {ErrorLabel, ProgressLabel} from "../../components/StatusLabel";
import ActiveStudyScreen from "../ActiveStudyScreen";

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

        // If the game is already loaded, then skip the delayed Promise step.
        const knownGame = manager.activeGame;
        this.state = {
            game: knownGame,
            gameLoading: (knownGame === null),
            gameLoadError: null
        };
        this.studyUpdateListener = (study) => {
            const game = this.state.game;
            if (!game)
                return;

            const currentStudy = game.study;
            if (currentStudy && study && currentStudy.id === study.id)
                return;

            // Set the new active study, and reload the active game.
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
            this.props.navigate(
                window.location.pathname + "?" + queryParams,
                {replace: true}
            );
        }
    }

    /**
     * Overwrite this to run code once the game loads.
     */
    afterGameLoaded(game) {
        document.title = game.study.basicSettings.name;
        this.updateQueryParams(game);
    }

    reloadActiveGame() {
        this.setStateIfMounted(() => {
            return {
                game: null,
                gameLoading: true,
                gameLoadError: null
            };
        });
        setTimeout(() => {
            getDataManager().getActiveGame().then((game) => {
                this.setStateIfMounted(() => {
                    return {
                        game: game,
                        gameLoading: false,
                        gameLoadError: null
                    };
                });
                this.afterGameLoaded(game);
            }).catch(err => {
                console.error(err);
                this.setStateIfMounted(() => {
                    return {
                        game: null,
                        gameLoading: false,
                        gameLoadError: err.message
                    };
                });
            });
        });
    }

    componentDidMount() {
        super.componentDidMount();

        // This shouldn't ever happen, but just in case.
        const manager = getDataManager();
        manager.addUpdateListener(this.studyUpdateListener);

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
        const error = this.state.gameLoadError;
        if (error)
            return <ErrorLabel className="text-2xl m-2" value={error} />;

        if (this.state.gameLoading)
            return <ProgressLabel className="text-2xl m-2" value="The study is loading..." />;

        const game = this.state.game;
        if (!game)
            return <ErrorLabel className="text-2xl m-2" value="The game did not load correctly." />;

        return this.renderWithStudyAndGame(game.study, game);
    }
}