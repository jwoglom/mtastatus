import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import MtaStatusHome from './components/MtaStatusHome.js';
import MtaStatusStation from "./components/MtaStatusStation.js";
import MtaStatusStationsList from "./components/MtaStatusStationsList.js";
import MtaStatusDualStation from "./components/MtaStatusDualStation.js";

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path="/">
          <MtaStatusHome />
        </Route>
        <Switch>
          <Route path="/stations" children={<MtaStatusStationsList />}></Route>
          <Route path="/stations/:stations" children={<MtaStatusHome />}></Route>
          <Route path="/station/:station" children={<MtaStatusStation />}></Route>
          <Route path="/dualstation/:nbStation/:sbStation" children={<MtaStatusDualStation />}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
