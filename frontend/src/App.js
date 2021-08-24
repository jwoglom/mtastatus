import logo from './logo.svg';
import './App.css';

import StationInfo from './components/StationInfo.js';

function App() {
  return (
    <div className="App">
      <StationInfo line="R" station="R32N"></StationInfo>
    </div>
  );
}

export default App;
