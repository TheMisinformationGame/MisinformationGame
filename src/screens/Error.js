import {Link} from "react-router-dom";

function ErrorScreen() {
    return (
        <div className="text-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="font-bold text-8xl">404</h1>
                <p className="text-2xl my-4">
                    You have stumbled across a missing page.
                </p>
                <Link to="/" className="text-xl text-white px-6 py-3 rounded bg-gray-700 shadow
                                        hover:bg-gray-800">
                    Back to Home
                </Link>
            </div>
        </div>
    );
}

export default ErrorScreen;
