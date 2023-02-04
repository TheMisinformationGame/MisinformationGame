import React, {Component} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {BrowserRouter, Route, Routes, useNavigate, useParams} from "react-router-dom";
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
import {onLCP, onFID, onCLS} from 'web-vitals';


export function setDefaultPageTitle() {
    document.title = "Misinformation Game";
}


/**
 * Scrolls back to the top when each screen is loaded.
 */
class ScreenContainer extends Component {
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return this.props.children;
    }
}


function withNavigation(Comp) {
    return (props) => {
        return (
            <ScreenContainer>
                <Comp {...props} navigate={useNavigate()} params={useParams()} />
            </ScreenContainer>
        );
    };
}


const HomeElem = withNavigation(Home);
const AdminSignInElem = withNavigation(AdminSignIn);
const AdminSignOutElem = withNavigation(AdminSignOut);
const AdminHomeElem = withNavigation(AdminHome);
const AdminStudyPageElem = withNavigation(AdminStudyPage);
const GameIdentificationElem = withNavigation(GameIdentification);
const GamePreIntroductionElem = withNavigation(GamePreIntroduction);
const GameRulesElem = withNavigation(GameRules);
const GamePostIntroductionElem = withNavigation(GamePostIntroduction);
const GameScreenElem = withNavigation(GameScreen);
const GameDebriefElem = withNavigation(GameDebrief);


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route exact path="/" element={<HomeElem />} />
              <Route exact path="/sign-in" element={<AdminSignInElem />} />
              <Route exact path="/sign-out" element={<AdminSignOutElem />} />
              <Route exact path="/admin" element={<AdminHomeElem />} />
              <Route exact path="/admin/:studyID" element={<AdminStudyPageElem />} />
              <Route exact path="/study/:studyID/id" element={<GameIdentificationElem />} />
              <Route exact path="/study/:studyID" element={<GamePreIntroductionElem />} />
              <Route exact path="/study/:studyID/rules" element={<GameRulesElem />} />
              <Route exact path="/study/:studyID/post-intro" element={<GamePostIntroductionElem />} />
              <Route exact path="/study/:studyID/feed" element={<GameScreenElem />} />
              <Route exact path="/study/:studyID/debrief" element={<GameDebriefElem />} />
              <Route element={ErrorScreen} />
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
);


// Web Vitals Reporting.
onCLS(console.log);
onFID(console.log);
onLCP(console.log);
