import logo from "../logo.svg";

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function GameIdentification() {
    return (
        <div className="border-2 border-black p-4 grid space-y-2 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <p className="font-bold text-center -mt-5 p-4">Enter your access ID</p>
            <input className="border border-black rounded-md justify-self-center mx-4 bg-purple-200" placeholder="Identification Number"></input>
            <button className="py-1 mx-4 border border-black rounded-md text-white bg-blue-500">Login</button>
        </div>
    );
}

export default GameIdentification;
