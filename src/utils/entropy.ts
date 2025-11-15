/**
 * Entropy and Information Gain Calculations
 * Used for optimal feature selection in educational mode
 */

import { Item, EntropyResult, InformationGain } from '../types';

/**
 * Calculate Shannon entropy for a set of items based on a feature
 * H(X) = -Σ p(x) * log2(p(x))
 */
export function calculateEntropy(items: Item[], feature: string): EntropyResult {
  if (items.length === 0) {
    return {
      entropy: 0,
      maxEntropy: 0,
      normalizedEntropy: 0,
    };
  }

  // Count occurrences of each feature value
  const valueCounts = new Map<string, number>();
  for (const item of items) {
    const value = String(item[feature]);
    valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
  }

  // Calculate entropy
  let entropy = 0;
  const total = items.length;

  for (const count of valueCounts.values()) {
    if (count > 0) {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    }
  }

  // Max entropy is log2(number of unique values)
  const maxEntropy = Math.log2(valueCounts.size);
  const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0;

  return {
    entropy,
    maxEntropy,
    normalizedEntropy,
  };
}

/**
 * Calculate information gain for a feature selection
 * IG(T, a) = H(T) - H(T|a)
 */
export function calculateInformationGain(
  items: Item[],
  feature: string,
  targetFeature?: string
): InformationGain {
  // If no target feature specified, use the count entropy
  const entropyBefore = calculateEntropy(items, targetFeature || 'id').entropy;

  // Calculate weighted entropy after splitting by feature
  const splits = splitByFeature(items, feature);
  let entropyAfter = 0;
  const total = items.length;

  for (const subset of Object.values(splits)) {
    const weight = subset.length / total;
    const subsetEntropy = calculateEntropy(subset, targetFeature || 'id').entropy;
    entropyAfter += weight * subsetEntropy;
  }

  const gain = entropyBefore - entropyAfter;

  return {
    feature,
    gain,
    entropyBefore,
    entropyAfter,
  };
}

/**
 * Split items by feature value
 */
export function splitByFeature(items: Item[], feature: string): Record<string, Item[]> {
  const splits: Record<string, Item[]> = {};

  for (const item of items) {
    const value = String(item[feature]);
    if (!splits[value]) {
      splits[value] = [];
    }
    splits[value].push(item);
  }

  return splits;
}

/**
 * Find the feature with the highest information gain
 */
export function findBestFeature(
  items: Item[],
  availableFeatures: string[],
  targetFeature?: string
): string | null {
  if (availableFeatures.length === 0) {
    return null;
  }

  let bestFeature: string | null = null;
  let maxGain = -Infinity;

  for (const feature of availableFeatures) {
    const gain = calculateInformationGain(items, feature, targetFeature).gain;
    if (gain > maxGain) {
      maxGain = gain;
      bestFeature = feature;
    }
  }

  return bestFeature;
}

/**
 * Calculate the reduction in item set size
 */
export function calculateSetReduction(
  itemsBefore: number,
  itemsAfter: number
): number {
  if (itemsBefore === 0) return 0;
  return ((itemsBefore - itemsAfter) / itemsBefore) * 100;
}
