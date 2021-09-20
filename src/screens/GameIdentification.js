import logo from "../logo.svg";

import {Component, useState} from "react"

import { ErrorLabel } from '../components/StatusLabel'

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GameIdentification() {
    const [input, setInput] = useState('');
    const [clicked, setClicked] = useState(false);

    return (
        <div className="border-2 border-black rounded-md p-4 grid space-y-2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p className="font-bold text-center -mt-5 p-4">Enter your access ID</p>
            <input className="p-2 border border-black rounded-md justify-self-center mx-4 bg-purple-200" 
                   placeholder="Identification Number" 
                   value={input} 
                   onChange={e => setInput(e.target.value)}>
            </input>
            <button className="py-1 mx-4 border border-black rounded-md text-white bg-blue-500" 
                    value={input} 
                    onClick={() => setClicked(true)}>

                    Login
            </button>
            {(clicked && (input == '')) && <ErrorLabel value="Please enter an ID" />}
        </div>
    );
}

export default GameIdentification;
