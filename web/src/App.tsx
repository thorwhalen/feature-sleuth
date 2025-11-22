import { useGameStore } from './store/gameStore';
import { GameSetup } from './components/GameSetup';
import { GamePlay } from './components/GamePlay';
import { GameComplete } from './components/GameComplete';
import './App.css';

function App() {
  const { phase } = useGameStore();

  return (
    <div className="app">
      {phase === 'setup' && <GameSetup />}
      {(phase === 'playing' || phase === 'guessing') && <GamePlay />}
      {phase === 'complete' && <GameComplete />}
    </div>
  );
}

export default App;
