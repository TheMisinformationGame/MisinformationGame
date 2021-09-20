import "../App.css"
import React from 'react';
import {Component} from "react";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import BlockIcon from '@material-ui/icons/Block';
import LaunchIcon from '@material-ui/icons/Launch';
import FlagIcon from '@material-ui/icons/Flag';
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import {getDataManager} from "../model/manager";
import {ErrorLabel} from "../components/StatusLabel";


class Source extends Component {

    static pickCredibilityColourClass(credibility) {
        if (credibility < 30)
            return "text-red-500";
        if (credibility < 70)
            return "text-yellow-500";
        return "text-green-600";
    }

    render() {
        const small = !!this.props.small;
        const source = this.props.source;
        const text_xl = (small ? "text-lg" : "text-xl");
        return (
            <div className={this.props.className}>
                <div className="flex">
                    <p className={text_xl}>{source.source.name} (</p>
                    <p className={text_xl + " " + Source.pickCredibilityColourClass(source.credibility)}>
                        &nbsp;{Math.round(source.credibility)}&nbsp;
                    </p>
                    <p className={text_xl}>)</p>
                </div>

                {small || /* Hides the followers if smol is true. */
                <div className="flex">
                    <p className="text-sm">
                        {Math.round(source.followers)}&nbsp;followers
                    </p>
                </div>}
            </div>
        );
    }
}

class Comment extends Component {
    render() {
        return (
            <div className={"flex flex-col p-1 px-2 mb-1 bg-white shadow" +
                            (this.props.className || "")}>
                <Source source={this.props.source} small={true} />
                <p className="w-full">{this.props.message}</p>
            </div>
        );
    }
}

class ReactButton extends Component {
    render() {
        return (
            <div id={this.props.reaction}
                 className={
                     "fill-current cursor-pointer text-5xl px-2 sm:px-3 md:px-4 " +
                     "filter hover:drop-shadow transform transition duration-100 " +
                     (this.props.enabled ? "text-gray-700 hover:scale-125" : "text-gray-500")}
                 onClick={() => {
                    if (this.props.enabled) {
                        this.props.onReact(this.props.reaction);
                    }
                 }}>

                {React.cloneElement(this.props.children, {
                    className: "fill-current", fontSize: "inherit"
                })}
            </div>
        );
    }
}

class ReactionsRow extends Component {
    render() {
        const onReact = this.props.onReact;
        return (
            <div className="text-lg flex flex-row justify-center p-2 bg-white"
                 style={{boxShadow: "0 -0.1rem 0.3rem rgba(0, 0, 0, 0.2)"}}>

                <ReactButton reaction="like" onReact={onReact} enabled={this.props.enabled}>
                    <ThumbUpIcon/></ReactButton>
                <ReactButton reaction="dislike" onReact={onReact} enabled={this.props.enabled}>
                    <ThumbDownIcon/></ReactButton>
                <ReactButton reaction="skip" onReact={onReact} enabled={this.props.enabled}>
                    <BlockIcon/></ReactButton>
                <ReactButton reaction="share" onReact={onReact} enabled={this.props.enabled}>
                    <LaunchIcon/></ReactButton>
                <ReactButton reaction="flag" onReact={onReact} enabled={this.props.enabled}>
                    <FlagIcon/></ReactButton>
            </div>
        );
    }
}

class PostComponent extends Component {
    render() {
        const state = this.props.state;
        const post = state.currentPost.post;
        const commentComponents = [];
        for (let index = 0; index < post.comments.length; ++index) {
            const comment = post.comments[index];
            const source = state.findSource(comment.sourceID);
            commentComponents.push(
                <Comment source={source} message={comment.message} key={source.source.id} />
            );
        }

        return (
            <div className="flex flex-col">
                <div className="bg-white shadow">
                    <div className="flex p-2 bg-white">
                        <Source source={state.currentSource} />
                    </div>
                    <div className="flex flex-col flex-grow text-left text-3xl bg-white
                                    font-bold mb-1">

                        <p className="p-2">{post.headline}</p>
                        {/*<img src={placeholderPostImage} className="w-full" alt="logo" />*/}
                    </div>
                </div>
                {commentComponents.length > 0 &&
                <p className="font-bold text-gray-600 p-1">Comments:</p>}
                {commentComponents}
            </div>
        );
    }
}

class GameScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    updateGameState(game, error) {
        if (game && !error && game.isFinished()) {
            game = null;
            error = "Game is finished!";
        }

        const state = {
            state: (game ? game.getCurrentState() : null),
            participant: (game ? game.participant : null),
            sourceImage: null,
            postImage: null,
            error: error,
            reactionsAllowed: false
        };
        this.setState(state);
        setTimeout(() => {
            this.setState({...state, reactionsAllowed: true});
        }, 600);
    }

    componentDidMount() {
        getDataManager().getActiveGame().then(game => {
            this.updateGameState(game, null);
        }).catch((err) => {
            console.error(err);
            this.updateGameState(null, null, err.message);
        });
    };

    onUserReact(reaction) {
        getDataManager().getActiveGame().then(game => {
            game.advanceState(reaction);
            this.updateGameState(game, null);
        });
        console.log(reaction);
    }

    render() {
        // We have to use min-height: 100vh, as the Tailwind min-h-full doesn't work :(
        const fullHeightStyle = {minHeight: "100vh"};

        const state = this.state.state;
        const participant = this.state.participant;
        const error = this.state.error;
        return (
            <div className="w-full bg-gray-100" style={fullHeightStyle}>

                <div className="w-full md:max-w-xl ml-auto mr-auto bg-gray-200
                                md:border-l-2 md:border-r-2 md:border-gray-700 shadow-2xl"
                     style={fullHeightStyle}>

                    {/* Post and comments. */}
                    {state && !error && <PostComponent state={state} />}
                    {error && <ErrorLabel value={error} />}

                    {/* Used for reserving space below reactions and progress. */}
                    <div className="h-40" />
                </div>

                {/* Reactions and progress. */}
                {participant && !error &&
                <div className="fixed w-full md:max-w-xl bottom-0 left-1/2 transform -translate-x-1/2
                                shadow-2xl md:border-l-2 md:border-r-2 md:border-opacity-0">
                    <ReactionsRow onReact={r => this.onUserReact(r)} enabled={this.state.reactionsAllowed} />
                    <div className="p-2 px-4 pb-3 bg-gray-200">
                        <p className="text-xl font-bold mb-1">
                            Your Progress
                        </p>
                        <p className="text-xl">
                            <SupervisedUserCircleIcon className="align-bottom mr-1" />
                            Followers: {Math.round(participant.followers)}
                            <CheckCircleIcon className="align-bottom ml-6 mr-1" />
                            Credibility: {Math.round(participant.credibility)}
                        </p>
                    </div>
                </div>}
            </div>
        );
    }
}

export default GameScreen;
