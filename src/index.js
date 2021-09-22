import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import StudyPage from "./screens/AdminStudy";
import Game from "./screens/GameInterface";
import GameIdentification from "./screens/GameIdentification";
import {GameIntroduction} from "./screens/GameIntroduction";
import ErrorScreen from "./screens/Error"
import StudyUpload from "./components/StudyUpload";

ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/admin" component={AdminHome} />
              <Route exact path="/admin/:id" component={StudyPage} />
              <Route path="/study_upload" component={StudyUpload} />
              <Route path="/game" component={Game} />
              <Route path="/game_id" component={GameIdentification} />
              <Route path="/game_intro" component={GameIntroduction} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

