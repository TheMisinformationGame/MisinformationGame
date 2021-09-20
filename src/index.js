import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import firebase from "./utils/firebase";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import StudyPage from "./screens/AdminStudy";
import Game from "./screens/GameInterface";
import GameIdentification from "./screens/GameIdentification";
import GameIntroduction from "./screens/GameIntroduction";
import GamePrompt from "./screens/GamePrompt";
import ErrorScreen from "./screens/Error"
import StudyUpload from "./components/StudyUpload";
import { db } from './utils/initFirestore';
import { postStudy } from './utils/postToDB';
import getPosts from './utils/getPosts';
import { postReact, testPostFullObject } from './utils/sendReact';

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
              <Route path="/game_prompt" component={GamePrompt} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

