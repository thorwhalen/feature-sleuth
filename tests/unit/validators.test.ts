/**
 * Tests for validators
 */

import { validateDataConfig, validateGameConfig, validateConfigs } from '../../src/utils/validators';
import { DataConfig, GameConfig } from '../../src/types';

describe('Validators', () => {
  const validDataConfig: DataConfig = {
    metadata: {
      name: 'Test Dataset',
      version: '1.0.0',
      description: 'Test',
    },
    identification_fields: ['name'],
    feature_fields: [
      {
        name: 'color',
        display_name: 'Color',
        type: 'categorical',
      },
    ],
    items: [
      { name: 'Item1', color: 'red' },
      { name: 'Item2', color: 'blue' },
    ],
  };

  const validGameConfig: GameConfig = {
    metadata: {
      game_name: 'Test Game',
    },
    game_mode: {
      type: 'calculated_guess',
      allow_early_guess: true,
      require_single_item: false,
    },
    feature_selection: {
      method: 'user_choice',
    },
    random_selector: {
      type: 'spinning_wheel',
    },
    scoring_system: {
      base_points_correct_guess: 100,
      calculation_method: 'fixed',
    },
    turn_mechanics: {
      show_remaining_items_count: true,
      show_remaining_items_list: false,
    },
  };

  describe('validateDataConfig', () => {
    it('should validate correct data config', () => {
      const result = validateDataConfig(validDataConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config without metadata name', () => {
      const invalid = { ...validDataConfig, metadata: { ...validDataConfig.metadata, name: '' } };
      const result = validateDataConfig(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject config without identification fields', () => {
      const invalid = { ...validDataConfig, identification_fields: [] };
      const result = validateDataConfig(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject config without items', () => {
      const invalid = { ...validDataConfig, items: [] };
      const result = validateDataConfig(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid feature type', () => {
      const invalid = {
        ...validDataConfig,
        feature_fields: [
          {
            name: 'test',
            display_name: 'Test',
            type: 'invalid' as any,
          },
        ],
      };
      const result = validateDataConfig(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateGameConfig', () => {
    it('should validate correct game config', () => {
      const result = validateGameConfig(validGameConfig);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject config without game name', () => {
      const invalid = { ...validGameConfig, metadata: { game_name: '' } };
      const result = validateGameConfig(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid game mode', () => {
      const invalid = {
        ...validGameConfig,
        game_mode: {
          type: 'invalid' as any,
          allow_early_guess: true,
          require_single_item: false,
        },
      };
      const result = validateGameConfig(invalid);
      expect(result.valid).toBe(false);
    });
  });

  describe('validateConfigs', () => {
    it('should validate compatible configs', () => {
      const result = validateConfigs(validDataConfig, validGameConfig);
      expect(result.valid).toBe(true);
    });

    it('should reject when game references non-existent features', () => {
      const invalidGame = {
        ...validGameConfig,
        feature_selection: {
          method: 'user_choice' as const,
          available_features: ['nonexistent'],
        },
      };
      const result = validateConfigs(validDataConfig, invalidGame);
      expect(result.valid).toBe(false);
    });
  });
});
