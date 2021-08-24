/*
 * This file has nothing to do with the misinformation game,
 * but I've left it in here as an example. -Paddy L.
 */

import logo from './logo.svg';
import './App.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";

import Home from "./screens/Home"
import AdminHome from "./screens/AdminHome"
import AdminStudy from "./screens/AdminStudy"
import Game from "./screens/Game"
import GameIdentification from "./screens/GameIdentification"
import GameIntroduction from "./screens/GameIntroduction"
import GamePrompt from "./screens/GamePrompt"

function App() {
  return (
    <BrowserRouter>
        <div>
            <Switch>
                <Route path="/" component={Home} />
                <Route path="/admin" component={AdminHome} />
                <Route path="/admin_study" component={AdminStudy} />
                <Route path="/game" component={Game} />
                <Route path="/game_id" component={GameIdentification} />
                <Route path="/game_intro" component={GameIntroduction} />
                <Route path="/game_prompt" component={GamePrompt} />
                <Route component={Error} />
            </Switch>
        </div>
    </BrowserRouter>
  );
}

export default App;
