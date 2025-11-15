/**
 * Configuration Types for Feature Sleuth
 * Defines the structure of data and game configuration files
 */

// ============================================================================
// Data Configuration Types
// ============================================================================

export interface DataConfig {
  metadata: DataMetadata;
  identification_fields: string[];
  feature_fields: FeatureField[];
  items: Item[];
  preprocessing?: PreprocessingConfig;
}

export interface DataMetadata {
  name: string;
  version: string;
  description: string;
}

export interface FeatureField {
  name: string;
  display_name: string;
  type: FeatureType;
  bucketing?: BucketingConfig;
  grouping?: GroupingConfig;
}

export type FeatureType = 'categorical' | 'numerical' | 'boolean';

export interface BucketingConfig {
  method: 'custom' | 'equal_width' | 'equal_frequency';
  buckets?: Bucket[];
  num_buckets?: number;
}

export interface Bucket {
  label: string;
  min: number;
  max: number | null;
}

export interface GroupingConfig {
  enabled: boolean;
  max_categories?: number;
  merge_strategy?: 'least_frequent' | 'similar';
}

export interface Item {
  [key: string]: any;
}

export interface PreprocessingConfig {
  feature_selection_entropy_threshold?: number;
  weight_calculation_method?: 'proportional' | 'equal';
}

// ============================================================================
// Game Configuration Types
// ============================================================================

export interface GameConfig {
  metadata: GameMetadata;
  game_mode: GameMode;
  feature_selection: FeatureSelectionConfig;
  random_selector: RandomSelectorConfig;
  scoring_system: ScoringSystem;
  turn_mechanics: TurnMechanics;
  ui_preferences?: UIPreferences;
  educational_mode?: EducationalMode;
}

export interface GameMetadata {
  game_name: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  target_age_range?: string;
}

export interface GameMode {
  type: 'pure_deduction' | 'calculated_guess' | 'multiple_choice';
  allow_early_guess: boolean;
  require_single_item: boolean;
}

export interface FeatureSelectionConfig {
  method: 'user_choice' | 'auto' | 'hybrid';
  auto_selection_algorithm?: 'entropy_based' | 'random';
  available_features?: string[];
}

export interface RandomSelectorConfig {
  type: 'spinning_wheel' | 'dice' | 'card_draw' | 'slot_machine';
  animation_duration_ms?: number;
  options?: {
    show_probabilities?: boolean;
    allow_respin?: boolean;
  };
}

export interface ScoringSystem {
  base_points_correct_guess: number;
  calculation_method: 'fixed' | 'inverse_set_size' | 'custom';
  formula?: string;
  bonus_points?: {
    high_information_gain?: number;
    efficient_turns?: number;
    [key: string]: number | undefined;
  };
  penalties?: {
    false_positive_guess?: number;
    excessive_turns_threshold?: number;
    penalty_per_extra_turn?: number;
    [key: string]: number | undefined;
  };
}

export interface TurnMechanics {
  max_turns?: number;
  show_remaining_items_count: boolean;
  show_remaining_items_list: boolean;
  hint_system?: {
    enabled: boolean;
    hints_per_game?: number;
  };
}

export interface UIPreferences {
  theme?: string;
  show_progress_bar?: boolean;
  show_feature_history?: boolean;
  animations_enabled?: boolean;
}

export interface EducationalMode {
  show_information_gain?: boolean;
  explain_entropy?: boolean;
  post_game_analysis?: boolean;
}

// ============================================================================
// Validation Types
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
}
