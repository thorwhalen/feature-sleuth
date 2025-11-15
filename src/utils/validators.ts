/**
 * Configuration Validation Utilities
 */

import {
  DataConfig,
  GameConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from '../types';

/**
 * Validate data configuration
 */
export function validateDataConfig(config: DataConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check metadata
  if (!config.metadata?.name) {
    errors.push({
      field: 'metadata.name',
      message: 'Dataset name is required',
      severity: 'error',
    });
  }

  // Check identification fields
  if (!config.identification_fields || config.identification_fields.length === 0) {
    errors.push({
      field: 'identification_fields',
      message: 'At least one identification field is required',
      severity: 'error',
    });
  }

  // Check feature fields
  if (!config.feature_fields || config.feature_fields.length === 0) {
    errors.push({
      field: 'feature_fields',
      message: 'At least one feature field is required',
      severity: 'error',
    });
  } else {
    // Validate each feature field
    for (const feature of config.feature_fields) {
      if (!feature.name) {
        errors.push({
          field: 'feature_fields',
          message: `Feature is missing name property`,
          severity: 'error',
        });
      }

      if (!['categorical', 'numerical', 'boolean'].includes(feature.type)) {
        errors.push({
          field: `feature_fields.${feature.name}`,
          message: `Invalid feature type: ${feature.type}`,
          severity: 'error',
        });
      }

      // Validate bucketing for numerical features
      if (feature.type === 'numerical' && feature.bucketing) {
        if (feature.bucketing.method === 'custom' && !feature.bucketing.buckets) {
          errors.push({
            field: `feature_fields.${feature.name}.bucketing`,
            message: 'Custom bucketing requires buckets definition',
            severity: 'error',
          });
        }
      }
    }
  }

  // Check items
  if (!config.items || config.items.length === 0) {
    errors.push({
      field: 'items',
      message: 'Dataset must contain at least one item',
      severity: 'error',
    });
  } else {
    // Validate items have required fields
    const featureNames = config.feature_fields.map((f) => f.name);
    const idFields = config.identification_fields;

    for (let i = 0; i < config.items.length; i++) {
      const item = config.items[i];

      // Check identification fields
      for (const idField of idFields) {
        if (!(idField in item)) {
          errors.push({
            field: `items[${i}]`,
            message: `Item missing identification field: ${idField}`,
            severity: 'error',
          });
        }
      }

      // Check feature fields
      for (const featureName of featureNames) {
        if (!(featureName in item)) {
          warnings.push({
            field: `items[${i}]`,
            message: `Item missing feature field: ${featureName}`,
          });
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate game configuration
 */
export function validateGameConfig(config: GameConfig): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Check metadata
  if (!config.metadata?.game_name) {
    errors.push({
      field: 'metadata.game_name',
      message: 'Game name is required',
      severity: 'error',
    });
  }

  // Check game mode
  if (!config.game_mode?.type) {
    errors.push({
      field: 'game_mode.type',
      message: 'Game mode type is required',
      severity: 'error',
    });
  } else if (
    !['pure_deduction', 'calculated_guess', 'multiple_choice'].includes(
      config.game_mode.type
    )
  ) {
    errors.push({
      field: 'game_mode.type',
      message: `Invalid game mode: ${config.game_mode.type}`,
      severity: 'error',
    });
  }

  // Check feature selection
  if (!config.feature_selection?.method) {
    errors.push({
      field: 'feature_selection.method',
      message: 'Feature selection method is required',
      severity: 'error',
    });
  }

  // Check random selector
  if (!config.random_selector?.type) {
    errors.push({
      field: 'random_selector.type',
      message: 'Random selector type is required',
      severity: 'error',
    });
  }

  // Check scoring system
  if (!config.scoring_system) {
    errors.push({
      field: 'scoring_system',
      message: 'Scoring system is required',
      severity: 'error',
    });
  } else {
    if (typeof config.scoring_system.base_points_correct_guess !== 'number') {
      errors.push({
        field: 'scoring_system.base_points_correct_guess',
        message: 'Base points must be a number',
        severity: 'error',
      });
    }
  }

  // Check turn mechanics
  if (!config.turn_mechanics) {
    errors.push({
      field: 'turn_mechanics',
      message: 'Turn mechanics configuration is required',
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Cross-validate data and game configurations
 */
export function validateConfigs(
  dataConfig: DataConfig,
  gameConfig: GameConfig
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validate individual configs first
  const dataValidation = validateDataConfig(dataConfig);
  const gameValidation = validateGameConfig(gameConfig);

  errors.push(...dataValidation.errors, ...gameValidation.errors);
  warnings.push(...(dataValidation.warnings || []), ...(gameValidation.warnings || []));

  // Cross-validation: Check if features in game config exist in data config
  if (gameConfig.feature_selection?.available_features) {
    const dataFeatures = dataConfig.feature_fields.map((f) => f.name);
    for (const feature of gameConfig.feature_selection.available_features) {
      if (!dataFeatures.includes(feature)) {
        errors.push({
          field: 'feature_selection.available_features',
          message: `Feature "${feature}" not found in data configuration`,
          severity: 'error',
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
