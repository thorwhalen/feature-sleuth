/**
 * Tests for game engine
 */

import {
  initializeGame,
  selectFeature,
  filterItems,
  makeGuess,
  spinSelector,
  executeTurn,
} from '../../src/core/game-engine';
import { DataConfig, GameConfig } from '../../src/types';

describe('Game Engine', () => {
  const testDataConfig: DataConfig = {
    metadata: {
      name: 'Test',
      version: '1.0.0',
      description: 'Test',
    },
    identification_fields: ['name'],
    feature_fields: [
      { name: 'color', display_name: 'Color', type: 'categorical' },
      { name: 'size', display_name: 'Size', type: 'categorical' },
    ],
    items: [
      { name: 'A', color: 'red', size: 'small' },
      { name: 'B', color: 'red', size: 'large' },
      { name: 'C', color: 'blue', size: 'small' },
      { name: 'D', color: 'blue', size: 'large' },
    ],
  };

  const testGameConfig: GameConfig = {
    metadata: { game_name: 'Test' },
    game_mode: {
      type: 'calculated_guess',
      allow_early_guess: true,
      require_single_item: false,
    },
    feature_selection: {
      method: 'user_choice',
      available_features: ['color', 'size'],
    },
    random_selector: { type: 'spinning_wheel' },
    scoring_system: {
      base_points_correct_guess: 100,
      calculation_method: 'fixed',
    },
    turn_mechanics: {
      show_remaining_items_count: true,
      show_remaining_items_list: false,
    },
  };

  describe('initializeGame', () => {
    it('should initialize game state', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      expect(state.currentItems).toHaveLength(4);
      expect(state.turnNumber).toBe(0);
      expect(state.score).toBe(0);
      expect(state.availableFeatures).toContain('color');
      expect(state.availableFeatures).toContain('size');
    });

    it('should select target item for pure deduction', () => {
      const pureDeductionConfig = {
        ...testGameConfig,
        game_mode: {
          type: 'pure_deduction' as const,
          allow_early_guess: false,
          require_single_item: true,
        },
      };
      const state = initializeGame(testDataConfig, pureDeductionConfig);
      expect(state.targetItem).toBeDefined();
    });
  });

  describe('selectFeature', () => {
    it('should select user-chosen feature', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const feature = selectFeature(state, 'color');
      expect(feature).toBe('color');
    });

    it('should auto-select feature based on entropy', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const feature = selectFeature(state, null, 'auto', 'entropy_based');
      expect(['color', 'size']).toContain(feature);
    });

    it('should throw error for unavailable feature', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      expect(() => selectFeature(state, 'invalid')).toThrow();
    });
  });

  describe('spinSelector', () => {
    it('should select a value based on weights', () => {
      const weights = { red: 0.5, blue: 0.5 };
      const result = spinSelector(weights, 0.3);
      expect(['red', 'blue']).toContain(result.selectedValue);
    });

    it('should respect weight distribution', () => {
      const weights = { red: 1.0, blue: 0.0 };
      const result = spinSelector(weights, 0.5);
      expect(result.selectedValue).toBe('red');
    });
  });

  describe('filterItems', () => {
    it('should filter items by feature value', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const newState = filterItems(state, 'color', 'red');
      expect(newState.currentItems).toHaveLength(2);
      expect(newState.currentItems.every((item) => item.color === 'red')).toBe(true);
      expect(newState.turnNumber).toBe(1);
    });

    it('should remove used feature from available features', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const newState = filterItems(state, 'color', 'red');
      expect(newState.availableFeatures).not.toContain('color');
    });

    it('should record turn in history', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const newState = filterItems(state, 'color', 'red');
      expect(newState.history).toHaveLength(1);
      expect(newState.history[0].featureSelected).toBe('color');
    });
  });

  describe('makeGuess', () => {
    it('should validate correct guess', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const result = makeGuess(state, ['A', 'B'], ['name']);
      expect(result.correct).toContain('A');
      expect(result.correct).toContain('B');
      expect(result.incorrect).toHaveLength(0);
    });

    it('should identify incorrect guesses', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const result = makeGuess(state, ['X', 'Y'], ['name']);
      expect(result.incorrect).toContain('X');
      expect(result.incorrect).toContain('Y');
      expect(result.correct).toHaveLength(0);
    });

    it('should mark as complete when all items guessed', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const result = makeGuess(state, ['A', 'B', 'C', 'D'], ['name']);
      expect(result.isComplete).toBe(true);
    });
  });

  describe('executeTurn', () => {
    it('should execute complete turn', () => {
      const state = initializeGame(testDataConfig, testGameConfig);
      const { newState, selection } = executeTurn(state, 'color', testDataConfig, testGameConfig);

      expect(selection.selectedValue).toBeDefined();
      expect(newState.turnNumber).toBe(1);
      expect(newState.currentItems.length).toBeLessThanOrEqual(4);
    });

    it('should mark game complete at max turns', () => {
      const limitedConfig = {
        ...testGameConfig,
        turn_mechanics: {
          ...testGameConfig.turn_mechanics,
          max_turns: 1,
        },
      };

      const state = initializeGame(testDataConfig, limitedConfig);
      const { newState } = executeTurn(state, 'color', testDataConfig, limitedConfig);
      expect(newState.isComplete).toBe(true);
    });
  });
});
