import React, {Component} from "react"
import gameImage from "./game-mockup.png"
import "../App.css"
import {ContinueButton} from "./GameIdentification";
import {getDataManager} from "../model/manager";

export class GameIntroduction extends Component {
    constructor(props) {
        super(props);
        this.state = {study: null};
    }

    componentDidMount() {
        getDataManager().getActiveStudy().then((study) => {
            this.setState({study: study});
        });
        // Preload the game.
        getDataManager().getActiveGame().then((game) => {
            game.preloadCurrentState();
        });
    }

    render() {
        const study = this.state.study;
        return (
            <div className="m-px">
                {this.state.study && <div className="m-px bg-white opacity-90 p-10">
                    <h2 className="align-middle text-4xl mb-4">{study.name}</h2>
                    <p className="leading-5 mb-4" dangerouslySetInnerHTML={{__html: study.introduction}} />
                    <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                    <p className="leading-5 mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Facilisis leo vel fringilla est ullamcorper eget nulla.
                        Tellus orci ac auctor augue mauris augue. Ut porttitor leo a diam sollicitudin tempor.
                        Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit amet. Egestas maecenas
                        pharetra convallis posuere morbi leo urna molestie. Penatibus et magnis dis parturient
                        montes nascetur ridiculus mus. Malesuada fames ac turpis egestas. At imperdiet dui accumsan
                        sit amet. Dictum fusce ut placerat orci. Tellus rutrum tellus pellentesque eu tincidunt
                        tortor aliquam nulla. Massa ultricies mi quis hendrerit dolor magna. Amet massa vitae tortor
                        condimentum lacinia quis. Ipsum nunc aliquet bibendum enim facilisis gravida neque.
                    </p>
                    <img className="max-h-64" src={gameImage} alt="Example of what the game will look like" />
                </div>}

                {/* Used for reserving space below the continue button. */}
                <div className="h-16" />

                <div className="bg-gray-100 py-1 border-t-2 border-gray-400 shadow-2xl
                                fixed bottom-0 left-0 w-full h-16
                                flex justify-center items-center">
                    <ContinueButton to="game" className="text-xl px-4 py-2" condition={true} />
                </div>
            </div>
        );
    }
}
