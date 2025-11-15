/**
 * Game Engine Core
 * Implement game logic as pure functions
 */

import {
  DataConfig,
  GameConfig,
  GameState,
  Item,
  FeatureSelection,
  Turn,
  SelectionResult,
  GuessResult,
  WeightMap,
} from '../types';
import { calculateFeatureWeights, processFeatures } from './data-processor';
import { calculateEntropy, findBestFeature, splitByFeature } from '../utils/entropy';
import { getItemIdentifier } from '../utils/formatters';

/**
 * Initialize a new game state
 */
export function initializeGame(
  dataConfig: DataConfig,
  gameConfig: GameConfig
): GameState {
  // Process features
  const processedFeatures = processFeatures(dataConfig.items, dataConfig.feature_fields);

  // Determine available features
  let availableFeatures: string[];
  if (gameConfig.feature_selection.available_features) {
    availableFeatures = [...gameConfig.feature_selection.available_features];
  } else {
    availableFeatures = dataConfig.feature_fields.map((f) => f.name);
  }

  // For pure deduction mode, select a random target item
  let targetItem: Item | undefined;
  if (gameConfig.game_mode.type === 'pure_deduction') {
    const randomIndex = Math.floor(Math.random() * dataConfig.items.length);
    targetItem = dataConfig.items[randomIndex];
  }

  return {
    currentItems: [...dataConfig.items],
    allItems: [...dataConfig.items],
    selectedFeatures: [],
    turnNumber: 0,
    score: 0,
    availableFeatures,
    history: [],
    isComplete: false,
    targetItem,
  };
}

/**
 * Select a feature (user choice or automatic)
 */
export function selectFeature(
  state: GameState,
  feature: string | null,
  method: 'user_choice' | 'auto' | 'hybrid' = 'user_choice',
  autoAlgorithm: 'entropy_based' | 'random' = 'entropy_based'
): string {
  if (feature) {
    // User selected a feature
    if (!state.availableFeatures.includes(feature)) {
      throw new Error(`Feature ${feature} is not available`);
    }
    return feature;
  }

  // Automatic selection
  if (method === 'auto' || method === 'hybrid') {
    if (autoAlgorithm === 'entropy_based') {
      const bestFeature = findBestFeature(state.currentItems, state.availableFeatures);
      if (!bestFeature) {
        throw new Error('No features available for selection');
      }
      return bestFeature;
    } else {
      // Random selection
      const randomIndex = Math.floor(Math.random() * state.availableFeatures.length);
      return state.availableFeatures[randomIndex];
    }
  }

  throw new Error('Feature selection failed: no feature provided and method is not auto');
}

/**
 * Generate weights for random selector
 */
export function generateWeights(
  state: GameState,
  feature: string,
  weightMethod: 'proportional' | 'equal' = 'proportional'
): WeightMap {
  return calculateFeatureWeights(state.currentItems, feature, weightMethod);
}

/**
 * Perform random selection (simulated)
 */
export function spinSelector(
  weights: WeightMap,
  random: number = Math.random()
): SelectionResult {
  const values = Object.keys(weights);
  const probabilities = Object.values(weights);

  // Weighted random selection
  let cumulative = 0;
  let selectedValue = values[0];

  for (let i = 0; i < values.length; i++) {
    cumulative += probabilities[i];
    if (random < cumulative) {
      selectedValue = values[i];
      break;
    }
  }

  return {
    selectedValue,
    possibleValues: values,
    weights,
  };
}

/**
 * Filter items based on feature selection
 */
export function filterItems(
  state: GameState,
  feature: string,
  value: string
): GameState {
  const itemsBefore = state.currentItems.length;

  // Filter items that match the selected feature value
  const filteredItems = state.currentItems.filter((item) => {
    return String(item[feature]) === value;
  });

  const itemsAfter = filteredItems.length;

  // Calculate information gain
  const entropyBefore = calculateEntropy(state.currentItems, feature);
  const entropyAfter = calculateEntropy(filteredItems, feature);
  const informationGain = entropyBefore.entropy - entropyAfter.entropy;

  // Create feature selection record
  const featureSelection: FeatureSelection = {
    feature,
    value,
    itemsBeforeSelection: itemsBefore,
    itemsAfterSelection: itemsAfter,
    informationGain,
    turnNumber: state.turnNumber + 1,
  };

  // Create turn record
  const turn: Turn = {
    turnNumber: state.turnNumber + 1,
    featureSelected: feature,
    valueSelected: value,
    itemsRemaining: itemsAfter,
    informationGain,
    timestamp: new Date(),
  };

  // Remove selected feature from available features
  const remainingFeatures = state.availableFeatures.filter((f) => f !== feature);

  return {
    ...state,
    currentItems: filteredItems,
    selectedFeatures: [...state.selectedFeatures, featureSelection],
    turnNumber: state.turnNumber + 1,
    availableFeatures: remainingFeatures,
    history: [...state.history, turn],
  };
}

/**
 * Make a guess
 */
export function makeGuess(
  state: GameState,
  guesses: string[],
  identificationFields: string[]
): GuessResult {
  const currentIdentifiers = state.currentItems.map((item) =>
    getItemIdentifier(item, identificationFields)
  );

  const correct: string[] = [];
  const incorrect: string[] = [];

  for (const guess of guesses) {
    if (currentIdentifiers.includes(guess)) {
      correct.push(guess);
    } else {
      incorrect.push(guess);
    }
  }

  const remaining = currentIdentifiers.filter((id) => !correct.includes(id));

  // Check if guess is complete
  const isComplete = remaining.length === 0 || state.currentItems.length === 1;
  const isCorrect = incorrect.length === 0 && correct.length > 0;

  return {
    correct,
    incorrect,
    remaining,
    isComplete,
    isCorrect,
  };
}

/**
 * Complete a turn (select feature, spin, filter)
 */
export function executeTurn(
  state: GameState,
  feature: string,
  dataConfig: DataConfig,
  gameConfig: GameConfig
): {
  newState: GameState;
  selection: SelectionResult;
} {
  // Generate weights for the selected feature
  const weightMethod =
    dataConfig.preprocessing?.weight_calculation_method || 'proportional';
  const weights = generateWeights(state, feature, weightMethod);

  // Spin the selector
  const selection = spinSelector(weights);

  // Filter items
  const newState = filterItems(state, feature, selection.selectedValue);

  // Check if game is complete
  const maxTurns = gameConfig.turn_mechanics.max_turns;
  if (maxTurns && newState.turnNumber >= maxTurns) {
    return {
      newState: { ...newState, isComplete: true },
      selection,
    };
  }

  // Check if only one item remains (for pure deduction)
  if (
    gameConfig.game_mode.type === 'pure_deduction' &&
    newState.currentItems.length === 1
  ) {
    return {
      newState: { ...newState, isComplete: true },
      selection,
    };
  }

  return {
    newState,
    selection,
  };
}

/**
 * Check if the game should end
 */
export function isGameComplete(state: GameState, gameConfig: GameConfig): boolean {
  if (state.isComplete) return true;

  // Check max turns
  if (gameConfig.turn_mechanics.max_turns) {
    if (state.turnNumber >= gameConfig.turn_mechanics.max_turns) {
      return true;
    }
  }

  // Check if only one item remains in pure deduction mode
  if (
    gameConfig.game_mode.type === 'pure_deduction' &&
    state.currentItems.length === 1
  ) {
    return true;
  }

  // Check if no more features available
  if (state.availableFeatures.length === 0) {
    return true;
  }

  return false;
}

/**
 * Get the current game status
 */
export function getGameStatus(state: GameState, gameConfig: GameConfig): {
  isComplete: boolean;
  canGuess: boolean;
  mustGuess: boolean;
  itemsRemaining: number;
  turnsRemaining: number | null;
} {
  const isComplete = isGameComplete(state, gameConfig);
  const canGuess = gameConfig.game_mode.allow_early_guess || state.currentItems.length === 1;
  const mustGuess = state.currentItems.length === 1 || state.availableFeatures.length === 0;
  const itemsRemaining = state.currentItems.length;

  let turnsRemaining: number | null = null;
  if (gameConfig.turn_mechanics.max_turns) {
    turnsRemaining = gameConfig.turn_mechanics.max_turns - state.turnNumber;
  }

  return {
    isComplete,
    canGuess,
    mustGuess,
    itemsRemaining,
    turnsRemaining,
  };
}
