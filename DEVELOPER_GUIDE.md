# Feature Sleuth - Developer Guide

## Overview

Feature Sleuth is a TypeScript/Node.js package that provides the core game engine for an educational guessing game system. The package implements data-driven feature identification through a configuration-based architecture.

## Installation

```bash
npm install
```

## Project Structure

```
feature-sleuth/
├── src/                      # Source code
│   ├── core/                 # Core game modules
│   │   ├── config-loader.ts  # Configuration loading and validation
│   │   ├── data-processor.ts # Data transformation and bucketing
│   │   ├── game-engine.ts    # Main game logic
│   │   └── scoring-engine.ts # Scoring calculations
│   ├── types/                # TypeScript type definitions
│   │   ├── config.types.ts   # Configuration types
│   │   ├── game.types.ts     # Game state types
│   │   └── index.ts          # Type exports
│   ├── utils/                # Utility functions
│   │   ├── entropy.ts        # Entropy and information gain
│   │   ├── validators.ts     # Configuration validation
│   │   └── formatters.ts     # Formatting utilities
│   └── index.ts              # Main package entry point
├── tests/                    # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
├── examples/                 # Example configurations and demos
│   ├── configs/              # Sample configurations
│   │   ├── data/             # Data configurations
│   │   └── games/            # Game configurations
│   └── demo.ts               # Demo script
└── dist/                     # Compiled output (generated)
```

## Quick Start

### 1. Basic Usage

```typescript
import {
  loadConfigsSync,
  initializeGame,
  executeTurn,
  makeGuess,
  calculateFinalScore,
} from 'feature-sleuth';

// Load configurations
const { dataConfig, gameConfig } = loadConfigsSync(myDataConfig, myGameConfig);

// Initialize game
let state = initializeGame(dataConfig, gameConfig);

// Execute a turn
const { newState, selection } = executeTurn(
  state,
  'habitat',  // selected feature
  dataConfig,
  gameConfig
);

// Make a guess
const guess = makeGuess(newState, ['Lion', 'Tiger'], dataConfig.identification_fields);

// Calculate score
const finalScore = calculateFinalScore(newState, guess, gameConfig);
```

### 2. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 3. Building

```bash
# Build TypeScript to JavaScript
npm run build

# Output will be in dist/
```

### 4. Running the Demo

```bash
# Build the package
npm run build

# Run the demo
node test-demo.js
```

## Core Concepts

### Configuration-Driven Design

The game is entirely driven by two configuration files:

1. **Data Configuration** (`data_config.json`): Defines the dataset, features, and processing rules
2. **Game Configuration** (`game_config.json`): Defines game mechanics, scoring, and UI preferences

### Game Flow

1. **Initialize**: Load and validate configurations
2. **Feature Selection**: Choose a feature (user or auto)
3. **Random Selection**: Spin selector to choose a value
4. **Filter Items**: Narrow down the item set
5. **Guess**: Make a guess when ready
6. **Score**: Calculate final score with analysis

### Pure Functional Core

All game logic is implemented as pure functions:
- **Immutable state**: Each operation returns a new state
- **No side effects**: Functions don't modify input parameters
- **Testable**: Easy to test with predictable outputs

## API Reference

### Core Functions

#### `loadConfigsSync(dataConfig, gameConfig)`

Loads and validates both configurations synchronously.

**Parameters:**
- `dataConfig`: DataConfig object
- `gameConfig`: GameConfig object

**Returns:**
- `{ dataConfig, gameConfig, validation }`

#### `initializeGame(dataConfig, gameConfig)`

Initializes a new game state.

**Returns:** `GameState`

#### `executeTurn(state, feature, dataConfig, gameConfig)`

Executes a complete turn (select feature, spin, filter).

**Returns:** `{ newState, selection }`

#### `makeGuess(state, guesses, identificationFields)`

Validates user guesses against current items.

**Returns:** `GuessResult`

#### `calculateFinalScore(state, guess, gameConfig)`

Calculates final score with analysis.

**Returns:** `FinalScore`

### Data Processing Functions

#### `processFeatures(items, featureFields)`

Processes all features in the dataset.

#### `bucketNumericalFeature(items, featureField)`

Converts numerical features into discrete buckets.

#### `calculateFeatureWeights(items, feature, method)`

Calculates probability weights for random selector.

### Utility Functions

#### `calculateEntropy(items, feature)`

Calculates Shannon entropy for a feature.

#### `findBestFeature(items, availableFeatures)`

Finds feature with highest information gain.

## Configuration Guide

### Data Configuration

```json
{
  "metadata": {
    "name": "Dataset Name",
    "version": "1.0.0",
    "description": "Description"
  },
  "identification_fields": ["name"],
  "feature_fields": [
    {
      "name": "feature_name",
      "display_name": "Feature Display Name",
      "type": "categorical|numerical|boolean",
      "bucketing": { /* for numerical */ },
      "grouping": { /* for categorical */ }
    }
  ],
  "items": [
    { "name": "Item1", "feature_name": "value" }
  ]
}
```

### Game Configuration

```json
{
  "metadata": { "game_name": "Game Name" },
  "game_mode": {
    "type": "pure_deduction|calculated_guess|multiple_choice",
    "allow_early_guess": true,
    "require_single_item": false
  },
  "scoring_system": {
    "base_points_correct_guess": 100,
    "calculation_method": "fixed|inverse_set_size|custom",
    "bonus_points": { /* bonuses */ },
    "penalties": { /* penalties */ }
  }
}
```

## Testing

### Test Coverage

The package includes comprehensive tests:
- **52 unit tests** covering all core modules
- **3 integration tests** for complete game flows
- **Coverage**: > 90% of code paths

### Writing Tests

Tests use Jest. Example:

```typescript
import { calculateEntropy } from '../src/utils/entropy';

describe('Entropy', () => {
  it('should calculate entropy correctly', () => {
    const items = [
      { id: 1, color: 'red' },
      { id: 2, color: 'blue' }
    ];
    const result = calculateEntropy(items, 'color');
    expect(result.entropy).toBeCloseTo(1.0);
  });
});
```

## Best Practices

### 1. Configuration Validation

Always validate configurations before use:

```typescript
import { validateConfigs } from 'feature-sleuth';

const validation = validateConfigs(dataConfig, gameConfig);
if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### 2. Immutable State Updates

Never modify state directly:

```typescript
// ❌ Bad
state.turnNumber++;

// ✅ Good
const newState = { ...state, turnNumber: state.turnNumber + 1 };
```

### 3. Error Handling

Handle errors gracefully:

```typescript
try {
  const { dataConfig, gameConfig } = await loadConfigs(dataPath, gamePath);
} catch (error) {
  console.error('Failed to load configs:', error.message);
}
```

## Performance Considerations

### Entropy Calculation

Entropy calculations are O(n) where n is the number of items. For large datasets (>10,000 items):
- Cache entropy results when possible
- Use preprocessing to reduce dataset size

### Weight Calculation

Weight calculation is performed on each turn. For optimal performance:
- Use proportional weights (default) when possible
- Consider pre-computing weights for static features

## Extending the Package

### Adding New Feature Types

1. Add type to `FeatureType` in `config.types.ts`
2. Implement processing in `data-processor.ts`
3. Add validation in `validators.ts`
4. Write tests

### Adding New Scoring Methods

1. Add method to `calculation_method` type
2. Implement in `scoring-engine.ts`
3. Update documentation
4. Add tests

## Troubleshooting

### Common Issues

**Issue**: "Feature not found in data configuration"
- **Solution**: Ensure feature names in game config match data config exactly

**Issue**: "No items match selection"
- **Solution**: Check that data values match expected feature values

**Issue**: "Validation failed"
- **Solution**: Review validation errors and fix configuration

## Contributing

1. Write tests for new features
2. Ensure all tests pass: `npm test`
3. Follow TypeScript best practices
4. Update documentation

## License

MIT
