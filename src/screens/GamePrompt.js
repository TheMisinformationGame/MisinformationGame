import logo from "../logo.svg";

import {useState} from "react"

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GamePrompt({onButton}) {

    const promptMessage = '95% of users on this platform agree that sharing fake news is innapropriate, harmful, and the wrong thing to do!';

    return (
        <div>
            {/* <div className="fixed w-full h-full left-0 top-0 bg-gray-200 border-2 border-black rounded-md p-4 overflow-y-scroll">
                <h2 className=" text-4xl">{'omori '.repeat(1000)}</h2>
            </div> */}
            <div className="mx-4 bg-white opacity-90 border-2 border-black rounded-md fixed top-0 left-0 w-full h-5/6
                            flex justify-center items-center">
                <h2 className="absolute align-middle text-4xl mx-80 leading-10">{promptMessage}</h2>
            </div>
            <div className="bg-white opacity-100 border-2 border-black rounded-md py-1 fixed bottom-0 left-0 w-full h-1/6
                            flex justify-center items-center">
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-2xl text-white border-black border-2 rounded-md" onClick={onButton}>Continue</button>
            </div>
        </div>
    );

    // TODO
    /**
     * Media query to make text look neater on mobile
     * Should the button simply hide the component?
     */
}

export default GamePrompt;
