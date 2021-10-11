import React from "react";
import {Link} from "react-router-dom";

function Home() {
    return (
        <div className="text-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <div className="max-w-2xl text-left">
                    <h1 className="text-5xl mb-2">The Misinformation Game</h1>
                    <p className="text-lg mb-4">
                        The Misinformation Game is a social media simulator built to run
                        studies on the behavior of people when interacting with social media.
                        The game is currently being built as the project of group 41 of the UWA CITS3200
                        unit in semester two 2021, in collaboration with Assoc/Prof Ullrich Ecker.
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

                    <h2 className="text-4xl mb-4 mt-8">Other Resources</h2>
                    <p className="text-lg mb-2 mt-4">
                        <Link to="/study/1632891323584" name="Game"
                              className="text-xl underline text-purple-600 hover:text-purple-900">
                            Example Game
                        </Link>:
                        An example game that can be played during development.
                    </p>
                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://docs.google.com/spreadsheets/d/1JP_3kHtcJC6m4PzwyTixMb8R0gu76tRIbdGcffGsTu0/edit#gid=5219285">

                            Study Template
                        </a>:
                        The template to be copied to create new studies.
                    </p>
                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://github.com/deanlawyw/CITS3200-Project/wiki">

                            Documentation
                        </a>:
                        How to use this website.
                    </p>
                    <p className="text-lg mb-2">
                        <a className="text-xl underline text-purple-600 hover:text-purple-900"
                           href="https://github.com/deanlawyw/CITS3200-Project">

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
