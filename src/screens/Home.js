import React from "react";
import { NavLink } from 'react-router-dom';
import "../App.css"

class Link extends React.Component {
    render() {
        return (
            <NavLink className={`px-4 py-2 m-0.5 hover:bg-blue-400 rounded font-sans text-white text-lg ${this.props.className}`}
                     to={this.props.to}>
                {this.props.name}
            </NavLink>
        );
    }
}

function Home() {
    return (
        <div className="App">
            <header className="App-header">
                <div className="max-w-2xl">
                    <h1 className="text-5xl mb-2">The Misinformation Game</h1>
                    <p className="text-lg">
                        Use the buttons below to access an example game,
                        or the admin interface to manage your studies.
                    </p>
                    <div className="flex justify-center">
                        <div className="flex p-2 my-4 rounded bg-gray-700 shadow">
                            <Link to="/" name="Home" className="bg-gray-800" />
                            <Link to="/game/1632891323584/id" name="Game" className="mx-3 bg-gray-600" />
                            <Link to="/admin" name="Admin" className="bg-gray-600" />
                        </div>
                    </div>
                    <h2 className="text-4xl text-left mb-2 mt-8">Other Resources</h2>
                    <p className="text-lg text-left mb-2">
                        <a className="text-xl underline text-purple-500 hover:text-purple-600"
                           href="https://docs.google.com/spreadsheets/d/1JP_3kHtcJC6m4PzwyTixMb8R0gu76tRIbdGcffGsTu0/edit#gid=5219285">

                            Study Template
                        </a>:
                        The template to be copied to create new studies.
                    </p>
                    <p className="text-lg text-left mb-2">
                        <a className="text-xl underline text-purple-500 hover:text-purple-600"
                           href="https://github.com/deanlawyw/CITS3200-Project/wiki">

                            Documentation
                        </a>:
                        How to use this website.
                    </p>
                    <p className="text-lg text-left mb-2">
                        <a className="text-xl underline text-purple-500 hover:text-purple-600"
                           href="https://github.com/deanlawyw/CITS3200-Project">

                            GitHub
                        </a>:
                        The source code for this website.
                    </p>
                </div>
            </header>
        </div>
    );
}

export default Home;
