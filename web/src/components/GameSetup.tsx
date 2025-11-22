import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './GameSetup.css';

// Import example datasets
import animalsData from '../../../examples/configs/data/animals.json';
import countriesData from '../../../examples/configs/data/countries.json';
import statesData from '../../../examples/configs/data/us_states.json';
import programmingData from '../../../examples/configs/data/programming_languages.json';
import moviesData from '../../../examples/configs/data/movies.json';
import instrumentsData from '../../../examples/configs/data/musical_instruments.json';

import beginnerGame from '../../../examples/configs/games/beginner.json';
import intermediateGame from '../../../examples/configs/games/intermediate.json';

const DATASETS = {
  animals: { name: 'Animals', config: animalsData },
  countries: { name: 'World Countries', config: countriesData },
  states: { name: 'US States', config: statesData },
  programming: { name: 'Programming Languages', config: programmingData },
  movies: { name: 'Classic Movies', config: moviesData },
  instruments: { name: 'Musical Instruments', config: instrumentsData },
};

const GAME_CONFIGS = {
  beginner: { name: 'Beginner (Easy)', config: beginnerGame },
  intermediate: { name: 'Intermediate (Challenge)', config: intermediateGame },
};

export function GameSetup() {
  const [selectedDataset, setSelectedDataset] = useState<keyof typeof DATASETS>('animals');
  const [selectedGame, setSelectedGame] = useState<keyof typeof GAME_CONFIGS>('beginner');

  const { loadGame, startGame, error } = useGameStore();

  const handleStart = () => {
    const dataConfig = DATASETS[selectedDataset].config;
    const gameConfig = GAME_CONFIGS[selectedGame].config;

    // Update game config to use all available features from dataset
    const updatedGameConfig = {
      ...gameConfig,
      feature_selection: {
        ...gameConfig.feature_selection,
        available_features: dataConfig.feature_fields.map((f: any) => f.name),
      },
    };

    loadGame(dataConfig as any, updatedGameConfig as any);
    startGame();
  };

  const dataset = DATASETS[selectedDataset].config;

  return (
    <div className="game-setup">
      <div className="setup-header">
        <h1>🔍 Feature Sleuth</h1>
        <p className="tagline">Educational Guessing Game</p>
      </div>

      <div className="setup-content">
        <div className="setup-section">
          <h2>Choose a Dataset</h2>
          <div className="dataset-grid">
            {Object.entries(DATASETS).map(([key, value]) => (
              <button
                key={key}
                className={`dataset-card ${selectedDataset === key ? 'selected' : ''}`}
                onClick={() => setSelectedDataset(key as keyof typeof DATASETS)}
              >
                <h3>{value.name}</h3>
                <p className="dataset-info">
                  {value.config.items.length} items ·{' '}
                  {value.config.feature_fields.length} features
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h2>Game Difficulty</h2>
          <div className="difficulty-grid">
            {Object.entries(GAME_CONFIGS).map(([key, value]) => (
              <button
                key={key}
                className={`difficulty-card ${selectedGame === key ? 'selected' : ''}`}
                onClick={() => setSelectedGame(key as keyof typeof GAME_CONFIGS)}
              >
                <h3>{value.name}</h3>
                <p className="game-mode">{value.config.game_mode.type.replace('_', ' ')}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="setup-section">
          <h2>Preview</h2>
          <div className="preview-box">
            <h3>{DATASETS[selectedDataset].name}</h3>
            <p><strong>Description:</strong> {dataset.metadata.description}</p>
            <p><strong>Items:</strong> {dataset.items.length}</p>
            <p><strong>Features:</strong> {dataset.feature_fields.map((f: any) => f.display_name).join(', ')}</p>
            <p><strong>Mode:</strong> {GAME_CONFIGS[selectedGame].config.game_mode.type.replace('_', ' ')}</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <button className="start-button" onClick={handleStart}>
          Start Game
        </button>
      </div>
    </div>
  );
}
