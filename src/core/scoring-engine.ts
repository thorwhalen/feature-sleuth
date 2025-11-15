/**
 * Scoring Engine
 * Calculate scores based on game configuration
 */

import {
  GameState,
  GameConfig,
  GuessResult,
  Score,
  FinalScore,
  ScoreBreakdown,
  GameAnalysis,
} from '../types';

/**
 * Evaluate a guess and calculate score
 */
export function evaluateGuess(
  guess: GuessResult,
  state: GameState,
  config: GameConfig
): Score {
  const { scoring_system } = config;
  const breakdown: ScoreBreakdown = {};

  // Calculate base points
  let basePoints = 0;
  if (guess.isCorrect) {
    if (scoring_system.calculation_method === 'fixed') {
      basePoints = scoring_system.base_points_correct_guess;
    } else if (scoring_system.calculation_method === 'inverse_set_size') {
      // Higher points for guessing with fewer items remaining
      basePoints =
        scoring_system.base_points_correct_guess * (1 / state.currentItems.length);
    } else if (scoring_system.calculation_method === 'custom' && scoring_system.formula) {
      // Parse and evaluate custom formula
      basePoints = evaluateCustomFormula(
        scoring_system.formula,
        state,
        scoring_system.base_points_correct_guess
      );
    }
  }

  breakdown['Base Points'] = basePoints;

  // Apply bonuses
  let bonusPoints = 0;
  if (scoring_system.bonus_points) {
    // High information gain bonus
    if (scoring_system.bonus_points.high_information_gain) {
      const avgInformationGain =
        state.selectedFeatures.reduce((sum, f) => sum + f.informationGain, 0) /
        Math.max(state.selectedFeatures.length, 1);

      if (avgInformationGain > 0.5) {
        const bonus = scoring_system.bonus_points.high_information_gain;
        bonusPoints += bonus;
        breakdown['High Information Gain Bonus'] = bonus;
      }
    }

    // Efficient turns bonus
    if (scoring_system.bonus_points.efficient_turns) {
      const optimalTurns = Math.ceil(Math.log2(state.allItems.length));
      if (state.turnNumber <= optimalTurns) {
        const bonus = scoring_system.bonus_points.efficient_turns;
        bonusPoints += bonus;
        breakdown['Efficient Turns Bonus'] = bonus;
      }
    }
  }

  // Apply penalties
  let penaltyPoints = 0;
  if (scoring_system.penalties) {
    // False positive penalty
    if (
      scoring_system.penalties.false_positive_guess &&
      guess.incorrect.length > 0
    ) {
      const penalty =
        scoring_system.penalties.false_positive_guess * guess.incorrect.length;
      penaltyPoints += Math.abs(penalty);
      breakdown['False Positive Penalty'] = penalty;
    }

    // Excessive turns penalty
    if (
      scoring_system.penalties.excessive_turns_threshold &&
      scoring_system.penalties.penalty_per_extra_turn
    ) {
      const threshold = scoring_system.penalties.excessive_turns_threshold;
      if (state.turnNumber > threshold) {
        const extraTurns = state.turnNumber - threshold;
        const penalty =
          scoring_system.penalties.penalty_per_extra_turn * extraTurns;
        penaltyPoints += Math.abs(penalty);
        breakdown['Excessive Turns Penalty'] = penalty;
      }
    }
  }

  const totalPoints = Math.max(0, basePoints + bonusPoints - penaltyPoints);

  return {
    basePoints,
    bonusPoints,
    penaltyPoints,
    totalPoints,
    breakdown,
  };
}

/**
 * Calculate final score with analysis
 */
export function calculateFinalScore(
  state: GameState,
  guess: GuessResult,
  config: GameConfig
): FinalScore {
  const score = evaluateGuess(guess, state, config);
  const analysis = analyzeGameplay(state);

  // Calculate optimal turns
  const optimalTurns = Math.ceil(Math.log2(state.allItems.length));

  // Calculate efficiency
  const efficiency =
    state.turnNumber > 0 ? (optimalTurns / state.turnNumber) * 100 : 0;

  return {
    ...score,
    turnsUsed: state.turnNumber,
    efficiency,
    optimalTurns,
    analysis,
  };
}

/**
 * Analyze gameplay and provide insights
 */
export function analyzeGameplay(state: GameState): GameAnalysis {
  const suggestions: string[] = [];

  // Calculate average information gain
  const avgInformationGain =
    state.selectedFeatures.length > 0
      ? state.selectedFeatures.reduce((sum, f) => sum + f.informationGain, 0) /
        state.selectedFeatures.length
      : 0;

  // Find best and worst feature selections
  let bestFeature: string | undefined;
  let worstFeature: string | undefined;
  let maxGain = -Infinity;
  let minGain = Infinity;

  for (const selection of state.selectedFeatures) {
    if (selection.informationGain > maxGain) {
      maxGain = selection.informationGain;
      bestFeature = `${selection.feature}=${selection.value}`;
    }
    if (selection.informationGain < minGain) {
      minGain = selection.informationGain;
      worstFeature = `${selection.feature}=${selection.value}`;
    }
  }

  // Generate suggestions
  if (avgInformationGain < 0.3) {
    suggestions.push(
      'Try to select features that split the items more evenly for higher information gain.'
    );
  }

  const optimalTurns = Math.ceil(Math.log2(state.allItems.length));
  if (state.turnNumber > optimalTurns * 1.5) {
    suggestions.push(
      'Consider using features with higher entropy to reduce the number of turns.'
    );
  }

  if (state.selectedFeatures.length > 0) {
    const lastSelection = state.selectedFeatures[state.selectedFeatures.length - 1];
    if (lastSelection.informationGain < 0.1) {
      suggestions.push(
        'The last feature selection provided little information. Try to choose features that better divide the remaining items.'
      );
    }
  }

  return {
    averageInformationGain: avgInformationGain,
    bestFeatureSelection: bestFeature,
    worstFeatureSelection: worstFeature,
    suggestions,
  };
}

/**
 * Evaluate custom scoring formula
 * Supports variables: base_points, remaining_items, turns_used
 */
function evaluateCustomFormula(
  formula: string,
  state: GameState,
  basePoints: number
): number {
  try {
    // Create a safe evaluation context
    const context = {
      base_points: basePoints,
      remaining_items: state.currentItems.length,
      turns_used: state.turnNumber,
      Math: Math,
    };

    // Replace variable names in formula
    let evaluatedFormula = formula;
    for (const [key, value] of Object.entries(context)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      evaluatedFormula = evaluatedFormula.replace(regex, String(value));
    }

    // Evaluate the formula (note: in production, use a proper expression parser)
    // This is a simplified version
    const result = Function('"use strict"; return (' + evaluatedFormula + ')')();

    return typeof result === 'number' ? result : basePoints;
  } catch (error) {
    console.warn('Failed to evaluate custom formula, using base points', error);
    return basePoints;
  }
}

/**
 * Apply bonuses to a score
 */
export function applyBonuses(score: number, state: GameState, config: GameConfig): number {
  let bonusPoints = 0;

  if (config.scoring_system.bonus_points) {
    // Add all bonuses
    for (const [key, value] of Object.entries(config.scoring_system.bonus_points)) {
      if (typeof value === 'number') {
        bonusPoints += value;
      }
    }
  }

  return score + bonusPoints;
}

/**
 * Apply penalties to a score
 */
export function applyPenalties(score: number, state: GameState, config: GameConfig): number {
  let penaltyPoints = 0;

  if (config.scoring_system.penalties) {
    // Add all penalties
    for (const [key, value] of Object.entries(config.scoring_system.penalties)) {
      if (typeof value === 'number' && value < 0) {
        penaltyPoints += Math.abs(value);
      }
    }
  }

  return Math.max(0, score - penaltyPoints);
}
