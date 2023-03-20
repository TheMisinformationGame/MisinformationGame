import React from "react";
import {Link} from "react-router-dom";
import Logo from "../logo.png";
import {setDefaultPageTitle} from "../index";

function Home() {
    setDefaultPageTitle();

    const exampleGameURLs = [];
    if (window.location.hostname === "try.misinfogame.com") {
        exampleGameURLs.push([
            "Example Feed Mode Study",
            "/study/zc7s3qqh0rrc30cx",
            "Try out a feed mode study."
        ]);
        exampleGameURLs.push([
            "Example Single-Post Mode Study",
            "/study/0m3eots70fhyo6ns",
            "Try out a single-post mode study."
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
        <div className="text-center min-h-screen bg-gray-50 text-gray-975 font-roboto">
            <div className="flex flex-col items-center p-4">
                <div className="max-w-home text-left">
                    <div id="logo-banner">
                        <div className="logo">
                            <img src={Logo} alt="The Misinformation Game Logo"/>
                        </div>
                        <div className="titles">
                            <h1>The Misinformation Game</h1>
                            <h2>A social-media simulator for research.</h2>
                        </div>
                    </div>
                    <hr className="strong-line" />

                    <p className="text-lg">
                        The Misinformation Game is a social media simulator built to study people’s
                        behaviour when they interact with social media. To achieve this, The Misinformation
                        Game simulates a social media feed for research participants. You may read more
                        about The Misinformation Game in&nbsp;
                        <a href="https://misinfogame.com">its documentation</a>.
                    </p>
                    <div className="flex justify-center">
                        <div className="flex my-8">
                            <Link to="/admin" name="Admin"
                                  className="text-xl text-white px-5 py-2 rounded-xl shadow
                                             bg-brand-500 hover:bg-brand-600">

                                Access the Admin Dashboard
                            </Link>
                        </div>
                    </div>

                    <h2 className="text-4xl mb-4">Resources</h2>

                    {/* The example games only exists on the example website. */}
                    {exampleGameElements}

                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://misinfogame.com">

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
