import React from "react";
import {Link} from "react-router-dom";
import Logo from "../logo.png";
import {GithubCorner} from "../components/GithubCorner";
import {setDefaultPageTitle} from "../index";

function Home() {
    setDefaultPageTitle();

    const exampleGameURLs = [];
    if (window.location.hostname === "misinformation-game.web.app") {
        exampleGameURLs.push([
            "Example Game",
            "/study/m1v891krnanahrdi",
            "Try this out!"
        ]);
    } else if (window.location.hostname === "localhost") {
        exampleGameURLs.push([
            "Example Study (Feed Mode)",
            "/study/ixruvsitwcd213x2",
            "A development study."
        ]);
        exampleGameURLs.push([
            "Example Study (Single Post Mode)",
            "/study/tf1ogucx5eleihvp",
            "A development study."
        ]);
    }

    const exampleGameElements = [];
    for (let index = 0; index < exampleGameURLs.length; ++index) {
        const exampleGame = exampleGameURLs[index],
              exampleGameName = exampleGame[0],
              exampleGameURL = exampleGame[1],
              exampleGameDesc = exampleGame[2];

        exampleGameElements.push(
            <p key={"example-game-" + index} className="text-lg mb-2">
                <Link to={exampleGameURL} name="Game"
                      className="text-xl underline text-purple-600 hover:text-purple-900">

                    {exampleGameName}
                </Link>:
                <span className="ml-1">
                    {exampleGameDesc}
                </span>
            </p>
        );
    }

    return (
        <div className="text-center min-h-screen bg-gray-100">
            <GithubCorner />
            <div className="flex flex-col items-center min-h-screen py-24 px-8">

                <a href="https://themisinformationgame.github.io/">
                    <img src={Logo} alt="Misinformation Game Logo"
                         className="absolute left-2 top-2 h-16" />
                </a>

                <div className="max-w-2xl text-left">
                    <h1 className="text-5xl mb-4">The Misinformation Game</h1>
                    <p className="text-lg mb-6">
                        The Misinformation Game is a social media simulator built to study people’s
                        behaviour when they interact with social media. To achieve this, The Misinformation
                        Game simulates a social media feed for research participants. You may read more
                        about The Misinformation Game in&nbsp;
                        <a href="https://themisinformationgame.github.io/">its documentation</a>.
                    </p>
                    <p className="text-lg mb-2">
                        Press the button below to access the admin interface to manage your studies,
                    </p>
                    <div className="flex justify-center">
                        <div className="flex my-4">
                            <Link to="/admin" name="Admin"
                                  className="text-xl text-white px-6 py-3 rounded bg-gray-700 shadow
                                             hover:bg-gray-800">

                                Access the Admin Dashboard
                            </Link>
                        </div>
                    </div>

                    <h2 className="text-4xl mb-4 mt-8">Resources</h2>

                    {/* The example games only exists on the example website. */}
                    {exampleGameElements}

                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://themisinformationgame.github.io/">

                            Documentation
                        </a>:
                        How to use this website.
                    </p>
                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://github.com/TheMisinformationGame/MisinformationGame">

                            GitHub
                        </a>:
                        The source code for this website.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Home;
