
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import MtaStatusHome from './components/MtaStatusHome.js';
import MtaStatusStation from "./components/MtaStatusStation.js";

import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Route exact path="/">
          <MtaStatusHome />
        </Route>
        <Switch>
          <Route path="/:station" children={<MtaStatusStation />}></Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
