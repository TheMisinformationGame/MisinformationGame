import React from "react";
import logo from "../logo.svg";
import { NavLink } from 'react-router-dom';

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
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
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/screens/Home.js</code> and save to reload.
                </p>
                <div className="flex p-2 my-4 rounded bg-gray-700">
                    <Link to="/" name="Home" className="bg-gray-800" />
                    <Link to="/admin" name="Admin" />
                    <Link to="/admin_study" name="Study" />
                    <Link to="/study_upload" name="Upload" />
                    <Link to="/game" name="Game" />
                    <Link to="/game_id" name="Game ID" />
                    <Link to="/game_intro" name="Game Intro" />
                    <Link to="/game_prompt" name="Game Prompt" />
                </div>
            </header>
        </div>
    );
}

export default Home;
