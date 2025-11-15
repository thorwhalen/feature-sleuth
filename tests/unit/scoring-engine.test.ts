/**
 * Tests for scoring engine
 */

import {
  evaluateGuess,
  calculateFinalScore,
  analyzeGameplay,
} from '../../src/core/scoring-engine';
import { GameState, GameConfig, GuessResult } from '../../src/types';

describe('Scoring Engine', () => {
  const testGameConfig: GameConfig = {
    metadata: { game_name: 'Test' },
    game_mode: {
      type: 'calculated_guess',
      allow_early_guess: true,
      require_single_item: false,
    },
    feature_selection: { method: 'user_choice' },
    random_selector: { type: 'spinning_wheel' },
    scoring_system: {
      base_points_correct_guess: 100,
      calculation_method: 'fixed',
      bonus_points: {
        high_information_gain: 20,
        efficient_turns: 10,
      },
      penalties: {
        false_positive_guess: -10,
        excessive_turns_threshold: 5,
        penalty_per_extra_turn: -5,
      },
    },
    turn_mechanics: {
      show_remaining_items_count: true,
      show_remaining_items_list: false,
    },
  };

  const createTestState = (overrides?: Partial<GameState>): GameState => ({
    currentItems: [{ name: 'A' }, { name: 'B' }],
    allItems: [{ name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }],
    selectedFeatures: [],
    turnNumber: 3,
    score: 0,
    availableFeatures: ['color'],
    history: [],
    isComplete: false,
    ...overrides,
  });

  describe('evaluateGuess', () => {
    it('should calculate base points for correct guess', () => {
      const state = createTestState();
      const guess: GuessResult = {
        correct: ['A'],
        incorrect: [],
        remaining: ['B'],
        isComplete: false,
        isCorrect: true,
      };

      const score = evaluateGuess(guess, state, testGameConfig);
      expect(score.basePoints).toBe(100);
      expect(score.totalPoints).toBeGreaterThanOrEqual(0);
    });

    it('should use inverse set size for calculation', () => {
      const inverseConfig = {
        ...testGameConfig,
        scoring_system: {
          ...testGameConfig.scoring_system,
          calculation_method: 'inverse_set_size' as const,
        },
      };

      const state = createTestState({ currentItems: [{ name: 'A' }] });
      const guess: GuessResult = {
        correct: ['A'],
        incorrect: [],
        remaining: [],
        isComplete: true,
        isCorrect: true,
      };

      const score = evaluateGuess(guess, state, inverseConfig);
      expect(score.basePoints).toBe(100); // 100 * (1/1) = 100
    });

    it('should apply false positive penalty', () => {
      const state = createTestState();
      const guess: GuessResult = {
        correct: ['A'],
        incorrect: ['X', 'Y'],
        remaining: ['B'],
        isComplete: false,
        isCorrect: false,
      };

      const score = evaluateGuess(guess, state, testGameConfig);
      expect(score.penaltyPoints).toBeGreaterThan(0);
    });

    it('should apply excessive turns penalty', () => {
      const state = createTestState({ turnNumber: 10 });
      const guess: GuessResult = {
        correct: ['A'],
        incorrect: [],
        remaining: ['B'],
        isComplete: false,
        isCorrect: true,
      };

      const score = evaluateGuess(guess, state, testGameConfig);
      expect(score.penaltyPoints).toBeGreaterThan(0);
    });

    it('should give bonus for high information gain', () => {
      const state = createTestState({
        selectedFeatures: [
          {
            feature: 'color',
            value: 'red',
            itemsBeforeSelection: 4,
            itemsAfterSelection: 2,
            informationGain: 0.8,
            turnNumber: 1,
          },
        ],
      });

      const guess: GuessResult = {
        correct: ['A'],
        incorrect: [],
        remaining: ['B'],
        isComplete: false,
        isCorrect: true,
      };

      const score = evaluateGuess(guess, state, testGameConfig);
      expect(score.bonusPoints).toBeGreaterThan(0);
    });
  });

  describe('calculateFinalScore', () => {
    it('should calculate final score with analysis', () => {
      const state = createTestState();
      const guess: GuessResult = {
        correct: ['A', 'B'],
        incorrect: [],
        remaining: [],
        isComplete: true,
        isCorrect: true,
      };

      const finalScore = calculateFinalScore(state, guess, testGameConfig);
      expect(finalScore.totalPoints).toBeGreaterThanOrEqual(0);
      expect(finalScore.turnsUsed).toBe(3);
      expect(finalScore.efficiency).toBeGreaterThan(0);
      expect(finalScore.optimalTurns).toBeDefined();
      expect(finalScore.analysis).toBeDefined();
    });
  });

  describe('analyzeGameplay', () => {
    it('should provide gameplay analysis', () => {
      const state = createTestState({
        selectedFeatures: [
          {
            feature: 'color',
            value: 'red',
            itemsBeforeSelection: 4,
            itemsAfterSelection: 2,
            informationGain: 0.5,
            turnNumber: 1,
          },
        ],
      });

      const analysis = analyzeGameplay(state);
      expect(analysis.averageInformationGain).toBeCloseTo(0.5);
      expect(analysis.bestFeatureSelection).toBeDefined();
      expect(analysis.suggestions).toBeInstanceOf(Array);
    });

    it('should suggest improvements for low information gain', () => {
      const state = createTestState({
        selectedFeatures: [
          {
            feature: 'color',
            value: 'red',
            itemsBeforeSelection: 4,
            itemsAfterSelection: 3,
            informationGain: 0.1,
            turnNumber: 1,
          },
        ],
      });

      const analysis = analyzeGameplay(state);
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });
  });
});
