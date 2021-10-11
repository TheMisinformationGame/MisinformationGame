import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import {AdminStudyPage} from "./screens/AdminStudy";
import {GameScreen} from "./screens/GameInterface";
import {GameIdentification} from "./screens/GameIdentification";
import {GamePreIntroduction, GamePostIntroduction} from "./screens/GameIntroduction";
import {GameRules} from "./screens/GameRules";
import {GameDebrief} from "./screens/GameDebrief";
import ErrorScreen from "./screens/Error";

ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/admin" component={AdminHome} />
              <Route exact path="/admin/:studyID" component={AdminStudyPage} />
              <Route exact path="/study/:studyID/id" component={GameIdentification} />
              <Route exact path="/study/:studyID" component={GamePreIntroduction} />
              <Route exact path="/study/:studyID/rules" component={GameRules} />
              <Route exact path="/study/:studyID/post-intro" component={GamePostIntroduction} />
              <Route exact path="/study/:studyID/feed" component={GameScreen} />
              <Route exact path="/study/:studyID/debrief" component={GameDebrief} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
