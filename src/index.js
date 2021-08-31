import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import firebase from "./utils/firebase";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import AdminStudy from "./screens/AdminStudy";
import Game from "./screens/Game";
import GameIdentification from "./screens/GameIdentification";
import GameIntroduction from "./screens/GameIntroduction";
import GamePrompt from "./screens/GamePrompt";
import ErrorScreen from "./screens/Error"
import StudyUpload from "./components/StudyUpload";
import db from './utils/initFirestore';
import getPosts from './utils/getPosts';


ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Home} />
              <Route path="/admin" component={AdminHome} />
              <Route path="/admin_study" component={AdminStudy} />
              <Route path="/study_upload" component={StudyUpload} />
              <Route path="/game" component={Game} />
              <Route path="/game_id" component={GameIdentification} />
              <Route path="/game_intro" component={GameIntroduction} />
              <Route path="/game_prompt" component={GamePrompt} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// this is just to test the code
getPosts(db);
