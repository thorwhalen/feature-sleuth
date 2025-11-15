/**
 * Data Processor
 * Transform raw dataset into game-usable structures
 */

import {
  Item,
  FeatureField,
  BucketedFeature,
  GroupedFeature,
  ProcessedFeature,
  FeatureValue,
  WeightMap,
  BucketInfo,
} from '../types';
import { calculateEntropy, splitByFeature } from '../utils/entropy';
import { normalizeWeights } from '../utils/formatters';

/**
 * Process all features in the dataset
 */
export function processFeatures(
  items: Item[],
  featureFields: FeatureField[]
): ProcessedFeature[] {
  return featureFields.map((field) => processFeature(items, field));
}

/**
 * Process a single feature based on its type
 */
export function processFeature(
  items: Item[],
  featureField: FeatureField
): ProcessedFeature {
  const { name, display_name, type } = featureField;

  if (type === 'numerical' && featureField.bucketing) {
    return bucketNumericalFeature(items, featureField);
  } else if (type === 'categorical' && featureField.grouping?.enabled) {
    return groupCategoricalFeature(items, featureField);
  } else {
    return processCategoricalFeature(items, featureField);
  }
}

/**
 * Process categorical feature (default case)
 */
export function processCategoricalFeature(
  items: Item[],
  featureField: FeatureField
): ProcessedFeature {
  const { name, display_name } = featureField;

  // Split items by feature value
  const splits = splitByFeature(items, name);
  const values: FeatureValue[] = [];

  // Calculate weights
  const total = items.length;
  for (const [value, itemList] of Object.entries(splits)) {
    values.push({
      value,
      count: itemList.length,
      weight: itemList.length / total,
      items: itemList,
    });
  }

  // Sort by count descending
  values.sort((a, b) => b.count - a.count);

  // Calculate entropy
  const entropyResult = calculateEntropy(items, name);

  return {
    name,
    displayName: display_name,
    values,
    entropy: entropyResult.entropy,
    type: 'categorical',
  };
}

/**
 * Bucket numerical feature into discrete categories
 */
export function bucketNumericalFeature(
  items: Item[],
  featureField: FeatureField
): BucketedFeature {
  const { name, display_name, bucketing } = featureField;

  if (!bucketing) {
    throw new Error(`Feature ${name} is numerical but has no bucketing configuration`);
  }

  let buckets: BucketInfo[];

  if (bucketing.method === 'custom' && bucketing.buckets) {
    // Use custom buckets
    buckets = bucketing.buckets.map((bucket) => ({
      label: bucket.label,
      range: [bucket.min, bucket.max] as [number, number | null],
      count: 0,
      items: [],
    }));

    // Assign items to buckets
    for (const item of items) {
      const value = Number(item[name]);
      if (isNaN(value)) continue;

      for (const bucket of buckets) {
        const [min, max] = bucket.range;
        if (value >= min && (max === null || value < max)) {
          bucket.count++;
          bucket.items.push(item);
          break;
        }
      }
    }
  } else if (bucketing.method === 'equal_width') {
    buckets = createEqualWidthBuckets(items, name, bucketing.num_buckets || 5);
  } else if (bucketing.method === 'equal_frequency') {
    buckets = createEqualFrequencyBuckets(items, name, bucketing.num_buckets || 5);
  } else {
    throw new Error(`Unknown bucketing method: ${bucketing.method}`);
  }

  // Convert buckets to FeatureValue format
  const values: FeatureValue[] = buckets.map((bucket) => ({
    value: bucket.label,
    count: bucket.count,
    weight: bucket.count / items.length,
    items: bucket.items,
  }));

  // Create a temporary modified dataset for entropy calculation
  const modifiedItems = items.map((item) => {
    const value = Number(item[name]);
    const bucket = buckets.find(
      (b) => value >= b.range[0] && (b.range[1] === null || value < b.range[1])
    );
    return {
      ...item,
      [`${name}_bucketed`]: bucket?.label || 'unknown',
    };
  });

  const entropyResult = calculateEntropy(modifiedItems, `${name}_bucketed`);

  return {
    name,
    displayName: display_name,
    values,
    entropy: entropyResult.entropy,
    type: 'numerical',
    buckets,
  };
}

/**
 * Create equal-width buckets for numerical data
 */
function createEqualWidthBuckets(
  items: Item[],
  featureName: string,
  numBuckets: number
): BucketInfo[] {
  const values = items
    .map((item) => Number(item[featureName]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) {
    return [];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = (max - min) / numBuckets;

  const buckets: BucketInfo[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const bucketMin = min + i * width;
    const bucketMax = i === numBuckets - 1 ? null : min + (i + 1) * width;

    buckets.push({
      label:
        bucketMax === null
          ? `${bucketMin.toFixed(1)}+`
          : `${bucketMin.toFixed(1)}-${bucketMax.toFixed(1)}`,
      range: [bucketMin, bucketMax],
      count: 0,
      items: [],
    });
  }

  // Assign items to buckets
  for (const item of items) {
    const value = Number(item[featureName]);
    if (isNaN(value)) continue;

    for (const bucket of buckets) {
      const [bucketMin, bucketMax] = bucket.range;
      if (value >= bucketMin && (bucketMax === null || value < bucketMax)) {
        bucket.count++;
        bucket.items.push(item);
        break;
      }
    }
  }

  return buckets;
}

/**
 * Create equal-frequency buckets (quantiles)
 */
function createEqualFrequencyBuckets(
  items: Item[],
  featureName: string,
  numBuckets: number
): BucketInfo[] {
  const values = items
    .map((item) => ({ value: Number(item[featureName]), item }))
    .filter((v) => !isNaN(v.value))
    .sort((a, b) => a.value - b.value);

  if (values.length === 0) {
    return [];
  }

  const bucketSize = Math.ceil(values.length / numBuckets);
  const buckets: BucketInfo[] = [];

  for (let i = 0; i < numBuckets; i++) {
    const start = i * bucketSize;
    const end = Math.min(start + bucketSize, values.length);
    const bucketItems = values.slice(start, end);

    if (bucketItems.length === 0) continue;

    const min = bucketItems[0].value;
    const max = i === numBuckets - 1 ? null : bucketItems[bucketItems.length - 1].value;

    buckets.push({
      label:
        max === null
          ? `${min.toFixed(1)}+`
          : `${min.toFixed(1)}-${max.toFixed(1)}`,
      range: [min, max],
      count: bucketItems.length,
      items: bucketItems.map((bi) => bi.item),
    });
  }

  return buckets;
}

/**
 * Group categorical feature by merging rare categories
 */
export function groupCategoricalFeature(
  items: Item[],
  featureField: FeatureField
): GroupedFeature {
  const { name, display_name, grouping } = featureField;

  if (!grouping) {
    throw new Error(`Feature ${name} has grouping enabled but no configuration`);
  }

  // First process as regular categorical
  const baseFeature = processCategoricalFeature(items, featureField);

  // If we don't need to group, return as-is
  const maxCategories = grouping.max_categories || 10;
  if (baseFeature.values.length <= maxCategories) {
    return {
      ...baseFeature,
      originalCategories: baseFeature.values.length,
      mergedCategories: [],
    };
  }

  // Keep top N-1 categories, merge the rest into "Other"
  const topCategories = baseFeature.values.slice(0, maxCategories - 1);
  const otherCategories = baseFeature.values.slice(maxCategories - 1);

  const otherItems = otherCategories.flatMap((c) => c.items);
  const otherValue: FeatureValue = {
    value: 'Other',
    count: otherItems.length,
    weight: otherItems.length / items.length,
    items: otherItems,
  };

  return {
    name,
    displayName: display_name,
    values: [...topCategories, otherValue],
    entropy: baseFeature.entropy,
    type: 'categorical',
    originalCategories: baseFeature.values.length,
    mergedCategories: [otherCategories.map((c) => c.value)],
  };
}

/**
 * Calculate feature weights for random selector
 */
export function calculateFeatureWeights(
  items: Item[],
  feature: string,
  method: 'proportional' | 'equal' = 'proportional'
): WeightMap {
  const splits = splitByFeature(items, feature);
  const weights: WeightMap = {};

  if (method === 'equal') {
    // Equal weights for all values
    const keys = Object.keys(splits);
    const weight = 1 / keys.length;
    for (const key of keys) {
      weights[key] = weight;
    }
  } else {
    // Proportional to item count
    const total = items.length;
    for (const [value, itemList] of Object.entries(splits)) {
      weights[value] = itemList.length / total;
    }
  }

  return normalizeWeights(weights);
}
