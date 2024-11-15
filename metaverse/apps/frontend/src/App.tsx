import './App.css';
import PhaserMultiplayer from './components/space';
import World from './components/world';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Welcome to Phaser Multiplayer</h1>
      </header>
      <main className="app-main">
        <PhaserMultiplayer />
      </main>
      
    </div>
  );
}

export default App;

