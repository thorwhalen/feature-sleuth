import { useGameStore } from '../store/gameStore';
import './GameComplete.css';

export function GameComplete() {
  const { finalScore, gameState, resetGame } = useGameStore();

  if (!finalScore || !gameState) return null;

  const efficiency = finalScore.efficiency;
  const turnsUsed = finalScore.turnsUsed;
  const optimalTurns = finalScore.optimalTurns || 0;

  // Determine performance rating
  let rating = 'Good';
  let ratingColor = '#4caf50';
  if (efficiency >= 100) {
    rating = 'Excellent!';
    ratingColor = '#4caf50';
  } else if (efficiency >= 70) {
    rating = 'Great!';
    ratingColor = '#8bc34a';
  } else if (efficiency >= 50) {
    rating = 'Good';
    ratingColor = '#ffc107';
  } else {
    rating = 'Keep Practicing';
    ratingColor = '#ff9800';
  }

  return (
    <div className="game-complete">
      <div className="complete-header">
        <h1>🎉 Game Complete!</h1>
        <div className="rating" style={{ color: ratingColor }}>
          {rating}
        </div>
      </div>

      <div className="score-summary">
        <div className="score-card main-score">
          <h2>{finalScore.totalPoints}</h2>
          <p>Total Points</p>
        </div>

        <div className="score-grid">
          <div className="score-card">
            <h3>{finalScore.basePoints}</h3>
            <p>Base Points</p>
          </div>
          <div className="score-card positive">
            <h3>+{finalScore.bonusPoints}</h3>
            <p>Bonus Points</p>
          </div>
          <div className="score-card negative">
            <h3>-{finalScore.penaltyPoints}</h3>
            <p>Penalties</p>
          </div>
        </div>
      </div>

      <div className="efficiency-section">
        <h2>Performance Analysis</h2>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Turns Used</span>
            <span className="stat-value">{turnsUsed}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Optimal Turns</span>
            <span className="stat-value">{optimalTurns}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Efficiency</span>
            <span className="stat-value">{efficiency.toFixed(1)}%</span>
          </div>
        </div>

        <div className="efficiency-bar">
          <div
            className="efficiency-fill"
            style={{ width: `${Math.min(efficiency, 100)}%` }}
          />
        </div>
      </div>

      {finalScore.breakdown && Object.keys(finalScore.breakdown).length > 0 && (
        <div className="breakdown-section">
          <h2>Score Breakdown</h2>
          <div className="breakdown-list">
            {Object.entries(finalScore.breakdown).map(([key, value]) => (
              <div key={key} className="breakdown-item">
                <span>{key}</span>
                <span className={value > 0 ? 'positive' : value < 0 ? 'negative' : ''}>
                  {value > 0 ? '+' : ''}{value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {finalScore.analysis && (
        <div className="analysis-section">
          <h2>Gameplay Analysis</h2>

          <div className="analysis-stats">
            <div className="analysis-item">
              <strong>Average Information Gain:</strong>
              <span>{finalScore.analysis.averageInformationGain.toFixed(3)}</span>
            </div>
            {finalScore.analysis.bestFeatureSelection && (
              <div className="analysis-item">
                <strong>Best Selection:</strong>
                <span>{finalScore.analysis.bestFeatureSelection}</span>
              </div>
            )}
            {finalScore.analysis.worstFeatureSelection && (
              <div className="analysis-item">
                <strong>Least Effective:</strong>
                <span>{finalScore.analysis.worstFeatureSelection}</span>
              </div>
            )}
          </div>

          {finalScore.analysis.suggestions.length > 0 && (
            <div className="suggestions">
              <h3>💡 Suggestions for Next Time</h3>
              <ul>
                {finalScore.analysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="feature-history">
        <h2>Your Journey</h2>
        <div className="history-timeline">
          {gameState.history.map((turn, index) => (
            <div key={index} className="history-item">
              <div className="turn-number">Turn {turn.turnNumber}</div>
              <div className="turn-details">
                <strong>{turn.featureSelected}</strong> = {turn.valueSelected}
              </div>
              <div className="turn-result">
                {turn.itemsRemaining} items remaining
                <span className="info-gain">
                  Info Gain: {turn.informationGain.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="play-again-button" onClick={resetGame}>
        Play Again
      </button>
    </div>
  );
}
