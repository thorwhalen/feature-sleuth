/**
 * Formatting Utilities
 */

import { Item, WeightMap } from '../types';

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a score with commas
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Get item identifier (concatenate all identification fields)
 */
export function getItemIdentifier(
  item: Item,
  identificationFields: string[]
): string {
  return identificationFields.map((field) => item[field]).join(' ');
}

/**
 * Normalize weights to sum to 1.0
 */
export function normalizeWeights(weights: WeightMap): WeightMap {
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  if (total === 0) {
    // Equal weights if all are zero
    const keys = Object.keys(weights);
    const equalWeight = 1 / keys.length;
    return Object.fromEntries(keys.map((k) => [k, equalWeight]));
  }

  const normalized: WeightMap = {};
  for (const [key, value] of Object.entries(weights)) {
    normalized[key] = value / total;
  }
  return normalized;
}

/**
 * Convert weights to percentages
 */
export function weightsToPercentages(weights: WeightMap): Record<string, string> {
  const normalized = normalizeWeights(weights);
  const percentages: Record<string, string> = {};

  for (const [key, value] of Object.entries(normalized)) {
    percentages[key] = formatPercentage(value);
  }

  return percentages;
}
