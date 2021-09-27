import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import {AdminStudy} from "./screens/AdminStudy";
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
              <Route exact path="/admin/:studyID" component={AdminStudy} />
              <Route exact path="/game/:studyID" component={GameScreen} />
              <Route exact path="/game/:studyID/id" component={GameIdentification} />
              <Route exact path="/game/:studyID/pre-intro" component={GamePreIntroduction} />
              <Route exact path="/game/:studyID/rules" component={GameRules} />
              <Route exact path="/game/:studyID/post-intro" component={GamePostIntroduction} />
              <Route exact path="/game/:studyID/debrief" component={GameDebrief} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
