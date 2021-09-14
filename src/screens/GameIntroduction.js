import logo from "../logo.svg";

import {useState} from "react"

import gameImage from "./game-mockup.png"

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GameIntroduction() {

    const filler = 'omori '.repeat(100);

    return (
        <div>
            {/* <div className="fixed w-full h-full left-0 top-0 bg-gray-200 border-2 border-black rounded-md p-4 overflow-y-scroll">
                <h2 className=" text-4xl">{'omori '.repeat(1000)}</h2>
            </div> */}
            <div className="bg-white opacity-90 border-2 border-black rounded-md fixed top-0 left-0 w-full h-5/6 p-10 leading-10
                            
                            overflow-y-scroll">
                <h2 className="align-middle text-4xl mb-4">Study Name</h2>
                <p className="leading-5 mb-4">{filler}</p>
                <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                <p className="leading-5 mb-4">{filler}</p>
                <img className="max-h-64" src={gameImage} alt="Example of what the game will look like" />
            </div>
            <div className="bg-white opacity-100 border-2 border-black rounded-md py-1 fixed bottom-0 left-0 w-full h-1/6
                            flex justify-center items-center">
                <button className="bg-blue-500 px-4 py-2 text-2xl text-white border-black border-2 rounded-md">Continue</button>
            </div>
        </div>
    );

    // TODO
    /**
     * Button function?
     * Better picture
     */
}

export default GameIntroduction;
