// Please use Tailwind CSS (https://tailwindcss.com/)
// instead of plain CSS where possible.
import "../App.css"
import {Link} from "react-router-dom";

function ErrorScreen() {
    return (
        <div className="App">
            <header className="App-header">
                <h1 className="font-bold text-6xl">404</h1>
                <p className="my-4">
                    You have stumbled across a missing page.
                </p>
                <Link className="py-2 px-4 my-2 rounded bg-gray-700 hover:bg-blue-400" to="/">Back to Home</Link>
            </header>
        </div>
    );
}

export default ErrorScreen;
