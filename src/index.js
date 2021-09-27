import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {BrowserRouter, Route, Switch} from "react-router-dom";
import Home from "./screens/Home";
import AdminHome from "./screens/AdminHome";
import StudyPage, {AdminStudy} from "./screens/AdminStudy";
import Game from "./screens/GameInterface";
import {GameIdentification} from "./screens/GameIdentification";
import {GameIntroduction} from "./screens/GameIntroduction";
import ErrorScreen from "./screens/Error";

ReactDOM.render(
  <React.StrictMode>
      <BrowserRouter>
          <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/admin" component={AdminHome} />
              <Route exact path="/admin/:studyID" component={AdminStudy} />
              <Route exact path="/game/:studyID" component={Game} />
              <Route exact path="/game/:studyID/id" component={GameIdentification} />
              <Route exact path="/game/:studyID/intro" component={GameIntroduction} />
              <Route component={ErrorScreen} />
          </Switch>
      </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
