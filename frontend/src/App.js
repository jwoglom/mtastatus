import logo from './logo.svg';
import './App.css';

import StationsGroup from './components/StationsGroup.js';

function App() {
  return (
    <div className="App">
      <StationsGroup stations="R32N,A32S"></StationsGroup>
    </div>
  );
}

export default App;
