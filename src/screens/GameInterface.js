import logo from "../logo.svg";
// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"
import { Component } from "react";
import { getStudySettings } from '../utils/getFromDB';


class GameScreen extends Component {
    //executable code hook 
    componentDidMount(){
        let studyID = "8UsCG45359Hp57i5hmIi" ;//temp code will need to figure a way to have a global active study
        console.log("Page Rendered");
        let studyJSON = getStudySettings(studyID);
        //console.log(studyJSON);
        studyJSON.then(snapshot => {
            console.log(snapshot)
        })
    };

    //render the page
    render() {
        return(GameInterface())
    }
}

//function with the HTML content of the game page
function GameInterface() {
    return (
        <div class="h-screen w-6/12 p-0 flex flex-row flex-col text-center content-center place-content-center space-y-0 fixed left-1/2 transform -translate-x-1/2">
            <header class="h-3/4 p-0 flex flex-col border-2 border-black grid space-y-0">
                <header class="flex flex-row flex-wrap text-center content-center place-content-center space-y-0 gap-0 border-2 border-grey">
                    <h1 class="text-xl">Source 1 (</h1><h1 class="text-green-700 text-xl">87</h1><h1 class="text-xl">) </h1>
                    <p class="w-full"> <br/>999 Followers</p>
                </header>
                <h1 class="flex flex-col text-center content-center place-content-center space-y-0">
                    Image Post
                    <img src={logo} className="App-logo" alt="logo" />
                </h1>
                <header class="flex flex-row flex-wrap text-center content-center place-content-center space-y-0 border-2 border-grey">
                    <h1 class="text-xl">User 1 (</h1><h1 class="text-red-500 text-xl">10</h1><h1 class="text-xl">) </h1>
                    <p class="w-full"> <br/>This content is obviously fake</p>
                </header>
                <header class="flex flex-row flex-wrap text-center content-center place-content-center space-y-0 border-2 border-grey">
                    <h1 class="text-xl">User 2 (</h1><h1 class="text-yellow-500 text-xl">50</h1><h1 class="text-xl">) </h1>
                    <p class="w-full"> <br/>I like this content</p>
                </header>
            </header>
            <footer className="h-1/4">
                <footer className="h-1/2 p-4 border-2 border-black">
                    <button class="px-2"> Like </button>
                    <button class="px-2"> Dislike </button>
                    <button class="px-2"> Block </button>
                    <button class="px-2"> Repost </button>
                    <button class="px-2"> Flag </button>
                </footer>            
                <footer className="h-1/2 p-4 border-2 border-black">
                    <p>
                       Your Progress
                    </p>
                    <p>
                        Followers:999 Credibility: 000
                    </p>
                </footer>
            </footer>
        </div>
    );
}

export default GameScreen;
