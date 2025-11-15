/**
 * Tests for entropy calculations
 */

import {
  calculateEntropy,
  calculateInformationGain,
  splitByFeature,
  findBestFeature,
} from '../../src/utils/entropy';
import { Item } from '../../src/types';

describe('Entropy Utils', () => {
  const testItems: Item[] = [
    { id: 1, color: 'red', size: 'small' },
    { id: 2, color: 'red', size: 'large' },
    { id: 3, color: 'blue', size: 'small' },
    { id: 4, color: 'blue', size: 'large' },
  ];

  describe('calculateEntropy', () => {
    it('should calculate entropy for perfectly balanced data', () => {
      const result = calculateEntropy(testItems, 'color');
      expect(result.entropy).toBeCloseTo(1.0, 1); // log2(2) = 1
    });

    it('should return 0 entropy for uniform data', () => {
      const uniformItems = [
        { id: 1, color: 'red' },
        { id: 2, color: 'red' },
        { id: 3, color: 'red' },
      ];
      const result = calculateEntropy(uniformItems, 'color');
      expect(result.entropy).toBe(0);
    });

    it('should return 0 for empty dataset', () => {
      const result = calculateEntropy([], 'color');
      expect(result.entropy).toBe(0);
    });

    it('should handle multiple categories', () => {
      const items = [
        { id: 1, color: 'red' },
        { id: 2, color: 'blue' },
        { id: 3, color: 'green' },
        { id: 4, color: 'yellow' },
      ];
      const result = calculateEntropy(items, 'color');
      expect(result.entropy).toBeCloseTo(2.0, 1); // log2(4) = 2
    });
  });

  describe('splitByFeature', () => {
    it('should split items by feature value', () => {
      const splits = splitByFeature(testItems, 'color');
      expect(Object.keys(splits)).toHaveLength(2);
      expect(splits['red']).toHaveLength(2);
      expect(splits['blue']).toHaveLength(2);
    });

    it('should handle empty dataset', () => {
      const splits = splitByFeature([], 'color');
      expect(Object.keys(splits)).toHaveLength(0);
    });
  });

  describe('calculateInformationGain', () => {
    it('should calculate information gain', () => {
      const result = calculateInformationGain(testItems, 'color', 'id');
      expect(result.feature).toBe('color');
      expect(result.gain).toBeGreaterThanOrEqual(0);
    });
  });

  describe('findBestFeature', () => {
    it('should find feature with highest information gain', () => {
      const bestFeature = findBestFeature(testItems, ['color', 'size']);
      expect(bestFeature).toBeTruthy();
      expect(['color', 'size']).toContain(bestFeature);
    });

    it('should return null for empty feature list', () => {
      const bestFeature = findBestFeature(testItems, []);
      expect(bestFeature).toBeNull();
    });
  });
});
