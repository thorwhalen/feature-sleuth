import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { SpinningWheel } from './SpinningWheel';
import { generateWeights } from 'feature-sleuth';
import './GamePlay.css';

export function GamePlay() {
  const {
    gameState,
    dataConfig,
    gameConfig,
    selectedFeature,
    isSpinning,
    lastSelection,
    phase,
    selectFeature,
    spinWheel,
    submitGuess,
  } = useGameStore();

  const [selectedGuesses, setSelectedGuesses] = useState<string[]>([]);

  if (!gameState || !dataConfig || !gameConfig) return null;

  const handleFeatureSelect = (feature: string) => {
    selectFeature(feature);
  };

  const handleSpin = () => {
    if (!selectedFeature) {
      alert('Please select a feature first!');
      return;
    }
    spinWheel();
  };

  const handleGuessToggle = (itemName: string) => {
    setSelectedGuesses((prev) =>
      prev.includes(itemName)
        ? prev.filter((n) => n !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSubmitGuess = () => {
    if (selectedGuesses.length === 0) {
      alert('Please select at least one item to guess!');
      return;
    }
    submitGuess(selectedGuesses);
  };

  const weights = selectedFeature
    ? generateWeights(gameState, selectedFeature, 'proportional')
    : {};

  const isGuessing = phase === 'guessing';

  return (
    <div className="game-play">
      <div className="game-header">
        <div className="game-info">
          <h2>{dataConfig.metadata.name}</h2>
          <div className="game-stats">
            <span>Turn: {gameState.turnNumber}</span>
            <span>Items Remaining: {gameState.currentItems.length}</span>
            <span>Score: {gameState.score}</span>
          </div>
        </div>
      </div>

      {!isGuessing ? (
        <>
          <div className="feature-selection">
            <h3>Select a Feature</h3>
            <div className="feature-buttons">
              {gameState.availableFeatures.map((feature) => {
                const featureField = dataConfig.feature_fields.find((f) => f.name === feature);
                return (
                  <button
                    key={feature}
                    className={`feature-button ${selectedFeature === feature ? 'selected' : ''}`}
                    onClick={() => handleFeatureSelect(feature)}
                  >
                    {featureField?.display_name || feature}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedFeature && Object.keys(weights).length > 0 && (
            <div className="wheel-section">
              <SpinningWheel
                weights={weights}
                isSpinning={isSpinning}
                selectedValue={lastSelection?.selectedValue || null}
              />
              {!isSpinning && (
                <button className="spin-button" onClick={handleSpin}>
                  Spin the Wheel!
                </button>
              )}
            </div>
          )}

          {lastSelection && !isSpinning && (
            <div className="selection-result">
              <h3>Result: {lastSelection.selectedValue}</h3>
              <p>{gameState.currentItems.length} items match this criteria</p>
            </div>
          )}

          {gameConfig.turn_mechanics.show_remaining_items_list && (
            <div className="remaining-items">
              <h3>Remaining Items</h3>
              <div className="items-list">
                {gameState.currentItems.map((item, index) => (
                  <span key={index} className="item-chip">
                    {item[dataConfig.identification_fields[0]]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="guess-section">
          <h2>Time to Guess!</h2>
          <p>Select the items you think match:</p>
          <div className="guess-grid">
            {gameState.currentItems.map((item, index) => {
              const itemName = item[dataConfig.identification_fields[0]];
              return (
                <label key={index} className="guess-option">
                  <input
                    type="checkbox"
                    checked={selectedGuesses.includes(itemName)}
                    onChange={() => handleGuessToggle(itemName)}
                  />
                  <span>{itemName}</span>
                </label>
              );
            })}
          </div>
          <button className="submit-guess-button" onClick={handleSubmitGuess}>
            Submit Guess
          </button>
        </div>
      )}
    </div>
  );
}
