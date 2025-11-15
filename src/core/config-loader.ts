/**
 * Config Loader & Parser
 * Load, validate, and parse configuration files
 */

import { DataConfig, GameConfig, ValidationResult } from '../types';
import { validateConfigs, validateDataConfig, validateGameConfig } from '../utils/validators';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load data configuration from file or object
 */
export async function loadDataConfig(source: string | DataConfig): Promise<DataConfig> {
  if (typeof source === 'string') {
    // Load from file
    const content = await fs.promises.readFile(source, 'utf-8');
    return JSON.parse(content) as DataConfig;
  } else {
    // Already an object
    return source;
  }
}

/**
 * Load game configuration from file or object
 */
export async function loadGameConfig(source: string | GameConfig): Promise<GameConfig> {
  if (typeof source === 'string') {
    // Load from file
    const content = await fs.promises.readFile(source, 'utf-8');
    return JSON.parse(content) as GameConfig;
  } else {
    // Already an object
    return source;
  }
}

/**
 * Load and validate both configurations
 */
export async function loadConfigs(
  dataSource: string | DataConfig,
  gameSource: string | GameConfig
): Promise<{
  dataConfig: DataConfig;
  gameConfig: GameConfig;
  validation: ValidationResult;
}> {
  const dataConfig = await loadDataConfig(dataSource);
  const gameConfig = await loadGameConfig(gameSource);

  const validation = validateConfigs(dataConfig, gameConfig);

  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join('\n');
    throw new Error(`Configuration validation failed:\n${errorMessages}`);
  }

  return {
    dataConfig,
    gameConfig,
    validation,
  };
}

/**
 * Synchronous version for loading from objects
 */
export function loadConfigsSync(
  dataConfig: DataConfig,
  gameConfig: GameConfig
): {
  dataConfig: DataConfig;
  gameConfig: GameConfig;
  validation: ValidationResult;
} {
  const validation = validateConfigs(dataConfig, gameConfig);

  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join('\n');
    throw new Error(`Configuration validation failed:\n${errorMessages}`);
  }

  return {
    dataConfig,
    gameConfig,
    validation,
  };
}
