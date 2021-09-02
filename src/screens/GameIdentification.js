import logo from "../logo.svg";

import {useState} from "react"

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GameIdentification() {
    const [input, setInput] = useState('');

    const inputCharLimit = 10; // TODO check if necessary, this is just for the controlled input
    const re = /^[0-9\b]+$/ // TODO possibly allow for whitespace in input
    const handleChange = (e) => {
        if (e.target.value == '' || re.test(e.target.value)){
            setInput(e.target.value)
        }
    }

    return (
        <div className="border-2 border-black rounded-md p-4 grid space-y-2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p className="font-bold text-center -mt-5 p-4">Enter your access ID</p>
            <input className="p-2 border border-black rounded-md justify-self-center mx-4 bg-purple-200" placeholder="Identification Number" onChange={handleChange} maxLength={inputCharLimit}></input>
            <button className="py-1 mx-4 border border-black rounded-md text-white bg-blue-500">Login</button>
        </div>
    );
}

export default GameIdentification;
