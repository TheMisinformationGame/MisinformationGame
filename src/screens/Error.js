import logo from "../logo.svg";

// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"

function Error() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    You have stumbled across a missing page...
                </p>
            </header>
        </div>
    );
}

export default Error;
