import logo from "../logo.svg";

import {useState} from "react"

import gameImage from "./game-mockup.png"

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GameIntroduction() {

    const filler = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Facilisis leo vel fringilla est ullamcorper eget nulla. Tellus orci ac auctor augue mauris augue. Ut porttitor leo a diam sollicitudin tempor. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit amet. Egestas maecenas pharetra convallis posuere morbi leo urna molestie. Penatibus et magnis dis parturient montes nascetur ridiculus mus. Malesuada fames ac turpis egestas. At imperdiet dui accumsan sit amet. Dictum fusce ut placerat orci. Tellus rutrum tellus pellentesque eu tincidunt tortor aliquam nulla. Massa ultricies mi quis hendrerit dolor magna. Amet massa vitae tortor condimentum lacinia quis. Ipsum nunc aliquet bibendum enim facilisis gravida neque.';

    return (
        <div class="m-px">
            {/* <div className="fixed w-full h-full left-0 top-0 bg-gray-200 border-2 border-black rounded-md p-4 overflow-y-scroll">
                <h2 className=" text-4xl">{'omori '.repeat(1000)}</h2>
            </div> */}
            <div className="m-px bg-white opacity-90 border-2 border-black rounded-md fixed top-0 left-0 h-5/6 p-10 leading-10
                            
                            overflow-y-scroll">
                <h2 className="align-middle text-4xl mb-4">Study Name</h2>
                <p className="leading-5 mb-4">{filler}</p>
                <h2 className="align-middle text-4xl mb-4">How to participate</h2>
                <p className="leading-5 mb-4">{filler}</p>
                <img className="max-h-64" src={gameImage} alt="Example of what the game will look like" />
            </div>
            <div className="bg-white opacity-100 border-2 border-black rounded-md py-1 fixed bottom-0 left-0 w-full h-1/6
                            flex justify-center items-center">
                <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 text-2xl text-white border-black border-2 rounded-md">Continue</button>
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
