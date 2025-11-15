/**
 * Tests for data processor
 */

import {
  processFeature,
  bucketNumericalFeature,
  groupCategoricalFeature,
  calculateFeatureWeights,
} from '../../src/core/data-processor';
import { Item, FeatureField } from '../../src/types';

describe('Data Processor', () => {
  const testItems: Item[] = [
    { name: 'A', weight: 5, color: 'red' },
    { name: 'B', weight: 15, color: 'red' },
    { name: 'C', weight: 50, color: 'blue' },
    { name: 'D', weight: 150, color: 'blue' },
  ];

  describe('bucketNumericalFeature', () => {
    it('should bucket numerical values into custom buckets', () => {
      const field: FeatureField = {
        name: 'weight',
        display_name: 'Weight',
        type: 'numerical',
        bucketing: {
          method: 'custom',
          buckets: [
            { label: '0-10', min: 0, max: 10 },
            { label: '10-100', min: 10, max: 100 },
            { label: '100+', min: 100, max: null },
          ],
        },
      };

      const result = bucketNumericalFeature(testItems, field);
      expect(result.buckets).toHaveLength(3);
      expect(result.values).toHaveLength(3);
      expect(result.type).toBe('numerical');
    });

    it('should create equal-width buckets', () => {
      const field: FeatureField = {
        name: 'weight',
        display_name: 'Weight',
        type: 'numerical',
        bucketing: {
          method: 'equal_width',
          num_buckets: 3,
        },
      };

      const result = bucketNumericalFeature(testItems, field);
      expect(result.buckets.length).toBeGreaterThan(0);
    });
  });

  describe('groupCategoricalFeature', () => {
    it('should not group when under max categories', () => {
      const field: FeatureField = {
        name: 'color',
        display_name: 'Color',
        type: 'categorical',
        grouping: {
          enabled: true,
          max_categories: 10,
        },
      };

      const result = groupCategoricalFeature(testItems, field);
      expect(result.values.length).toBeLessThanOrEqual(10);
    });

    it('should group rare categories into Other', () => {
      const manyItems = [
        { id: 1, color: 'red' },
        { id: 2, color: 'red' },
        { id: 3, color: 'blue' },
        { id: 4, color: 'green' },
        { id: 5, color: 'yellow' },
        { id: 6, color: 'purple' },
        { id: 7, color: 'orange' },
      ];

      const field: FeatureField = {
        name: 'color',
        display_name: 'Color',
        type: 'categorical',
        grouping: {
          enabled: true,
          max_categories: 3,
        },
      };

      const result = groupCategoricalFeature(manyItems, field);
      expect(result.values).toHaveLength(3);
      expect(result.values.some((v) => v.value === 'Other')).toBe(true);
    });
  });

  describe('calculateFeatureWeights', () => {
    it('should calculate proportional weights', () => {
      const weights = calculateFeatureWeights(testItems, 'color', 'proportional');
      expect(weights['red']).toBe(0.5);
      expect(weights['blue']).toBe(0.5);
    });

    it('should calculate equal weights', () => {
      const weights = calculateFeatureWeights(testItems, 'color', 'equal');
      expect(weights['red']).toBe(0.5);
      expect(weights['blue']).toBe(0.5);
    });

    it('should normalize weights to sum to 1', () => {
      const weights = calculateFeatureWeights(testItems, 'color');
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0, 5);
    });
  });
});
