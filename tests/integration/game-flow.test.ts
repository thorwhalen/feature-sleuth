/**
 * Integration test for complete game flow
 */

import {
  loadConfigsSync,
  initializeGame,
  executeTurn,
  makeGuess,
  calculateFinalScore,
} from '../../src';
import { DataConfig, GameConfig } from '../../src/types';

describe('Complete Game Flow Integration', () => {
  const dataConfig: DataConfig = {
    metadata: {
      name: 'Test Animals',
      version: '1.0.0',
      description: 'Test dataset',
    },
    identification_fields: ['name'],
    feature_fields: [
      { name: 'habitat', display_name: 'Habitat', type: 'categorical' },
      { name: 'diet', display_name: 'Diet', type: 'categorical' },
    ],
    items: [
      { name: 'Lion', habitat: 'Savanna', diet: 'Carnivore' },
      { name: 'Elephant', habitat: 'Savanna', diet: 'Herbivore' },
      { name: 'Shark', habitat: 'Ocean', diet: 'Carnivore' },
      { name: 'Dolphin', habitat: 'Ocean', diet: 'Carnivore' },
    ],
  };

  const gameConfig: GameConfig = {
    metadata: { game_name: 'Animal Quiz' },
    game_mode: {
      type: 'calculated_guess',
      allow_early_guess: true,
      require_single_item: false,
    },
    feature_selection: {
      method: 'user_choice',
      available_features: ['habitat', 'diet'],
    },
    random_selector: { type: 'spinning_wheel' },
    scoring_system: {
      base_points_correct_guess: 100,
      calculation_method: 'inverse_set_size',
      bonus_points: { efficient_turns: 10 },
    },
    turn_mechanics: {
      max_turns: 5,
      show_remaining_items_count: true,
      show_remaining_items_list: false,
    },
  };

  it('should complete a full game successfully', () => {
    // Load and validate configs
    const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
      dataConfig,
      gameConfig
    );

    // Initialize game
    let state = initializeGame(validatedData, validatedGame);
    expect(state.currentItems).toHaveLength(4);
    expect(state.turnNumber).toBe(0);

    // Execute first turn
    const { newState: state1, selection: selection1 } = executeTurn(
      state,
      'habitat',
      validatedData,
      validatedGame
    );
    expect(state1.turnNumber).toBe(1);
    expect(state1.currentItems.length).toBeLessThanOrEqual(4);
    expect(selection1.selectedValue).toBeTruthy();

    // Execute second turn if needed
    if (state1.currentItems.length > 1 && state1.availableFeatures.length > 0) {
      const { newState: state2 } = executeTurn(
        state1,
        state1.availableFeatures[0],
        validatedData,
        validatedGame
      );
      expect(state2.turnNumber).toBe(2);
    }

    // Make a guess
    const currentState = state1;
    const itemNames = currentState.currentItems.map((item) => item.name);
    const guess = makeGuess(currentState, itemNames, validatedData.identification_fields);

    expect(guess.correct.length).toBeGreaterThan(0);
    expect(guess.incorrect).toHaveLength(0);

    // Calculate final score
    const finalScore = calculateFinalScore(currentState, guess, validatedGame);
    expect(finalScore.totalPoints).toBeGreaterThanOrEqual(0);
    expect(finalScore.turnsUsed).toBeGreaterThan(0);
    expect(finalScore.analysis).toBeDefined();
  });

  it('should handle pure deduction mode', () => {
    const pureDeductionConfig = {
      ...gameConfig,
      game_mode: {
        type: 'pure_deduction' as const,
        allow_early_guess: false,
        require_single_item: true,
      },
    };

    const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
      dataConfig,
      pureDeductionConfig
    );

    const state = initializeGame(validatedData, validatedGame);
    expect(state.targetItem).toBeDefined();
    expect(dataConfig.items).toContainEqual(state.targetItem);
  });

  it('should enforce max turns limit', () => {
    const limitedConfig = {
      ...gameConfig,
      turn_mechanics: {
        ...gameConfig.turn_mechanics,
        max_turns: 1,
      },
    };

    const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
      dataConfig,
      limitedConfig
    );

    const state = initializeGame(validatedData, validatedGame);
    const { newState } = executeTurn(state, 'habitat', validatedData, validatedGame);

    expect(newState.isComplete).toBe(true);
    expect(newState.turnNumber).toBe(1);
  });
});
