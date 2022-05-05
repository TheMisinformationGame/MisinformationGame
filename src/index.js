import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import {AdminStudyPage} from "./screens/AdminStudy";
import {GameScreen} from "./screens/game/GameInterface";
import {GameIdentification} from "./screens/game/GameIdentification";
import {GamePreIntroduction, GamePostIntroduction} from "./screens/game/GameIntroduction";
import {GameRules} from "./screens/game/GameRules";
import {GameDebrief} from "./screens/game/GameDebrief";
import ErrorScreen from "./screens/Error";
import {AdminSignIn} from "./screens/AdminSignIn";
import {AdminSignOut} from "./screens/AdminSignOut";


export function setDefaultPageTitle() {
    document.title = "Misinformation Game";
}


ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/sign-in" component={AdminSignIn} />
              <Route exact path="/sign-out" component={AdminSignOut} />
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
