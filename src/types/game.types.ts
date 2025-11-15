/**
 * Game Runtime Types for Feature Sleuth
 * Defines the structure of game state, selections, and results
 */

import { Item } from './config.types';

// ============================================================================
// Game State Types
// ============================================================================

export interface GameState {
  currentItems: Item[];
  allItems: Item[];
  selectedFeatures: FeatureSelection[];
  turnNumber: number;
  score: number;
  availableFeatures: string[];
  history: Turn[];
  isComplete: boolean;
  targetItem?: Item; // For pure deduction mode
}

export interface FeatureSelection {
  feature: string;
  value: string;
  itemsBeforeSelection: number;
  itemsAfterSelection: number;
  informationGain: number;
  turnNumber: number;
}

export interface Turn {
  turnNumber: number;
  featureSelected: string;
  valueSelected: string;
  itemsRemaining: number;
  informationGain: number;
  timestamp: Date;
}

// ============================================================================
// Selection Types
// ============================================================================

export interface SelectionResult {
  selectedValue: string;
  possibleValues: string[];
  weights: WeightMap;
  animationData?: AnimationData;
}

export interface WeightMap {
  [value: string]: number;
}

export interface AnimationData {
  duration: number;
  finalRotation?: number;
  segments?: WheelSegment[];
}

export interface WheelSegment {
  value: string;
  startAngle: number;
  endAngle: number;
  probability: number;
}

// ============================================================================
// Guess Types
// ============================================================================

export interface GuessResult {
  correct: string[];
  incorrect: string[];
  remaining: string[];
  isComplete: boolean;
  isCorrect: boolean;
}

// ============================================================================
// Scoring Types
// ============================================================================

export interface Score {
  basePoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  [key: string]: number;
}

export interface FinalScore extends Score {
  turnsUsed: number;
  efficiency: number;
  optimalTurns?: number;
  analysis?: GameAnalysis;
}

export interface GameAnalysis {
  averageInformationGain: number;
  bestFeatureSelection?: string;
  worstFeatureSelection?: string;
  suggestions: string[];
}

// ============================================================================
// Processed Feature Types
// ============================================================================

export interface ProcessedFeature {
  name: string;
  displayName: string;
  values: FeatureValue[];
  entropy: number;
  type: 'categorical' | 'numerical' | 'boolean';
}

export interface FeatureValue {
  value: string;
  count: number;
  weight: number;
  items: Item[];
}

export interface BucketedFeature extends ProcessedFeature {
  buckets: BucketInfo[];
}

export interface BucketInfo {
  label: string;
  range: [number, number | null];
  count: number;
  items: Item[];
}

export interface GroupedFeature extends ProcessedFeature {
  originalCategories: number;
  mergedCategories: string[][];
}

// ============================================================================
// Entropy and Information Gain Types
// ============================================================================

export interface EntropyResult {
  entropy: number;
  maxEntropy: number;
  normalizedEntropy: number;
}

export interface InformationGain {
  feature: string;
  gain: number;
  entropyBefore: number;
  entropyAfter: number;
}
