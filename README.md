# Feature Sleuth 🔍

An educational guessing game engine for data-driven feature identification. Feature Sleuth teaches classification and deductive reasoning through interactive gameplay similar to "20 Questions" or "Guess Who?", but powered by any dataset you provide.

[![Tests](https://img.shields.io/badge/tests-52%20passing-brightgreen)](tests/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🎯 What is Feature Sleuth?

Feature Sleuth is a **configuration-driven game engine** that turns any dataset into an educational guessing game. Players identify items from your dataset by selecting features and using random selection (spinning wheel, dice, etc.) to narrow down possibilities, learning about:

- **Classification**: How features define and distinguish items
- **Information Theory**: Entropy and information gain
- **Deductive Reasoning**: Systematic elimination of possibilities
- **Data Science Concepts**: Feature importance and decision trees

### Example Gameplay

Given a dataset of animals, the game might proceed:

1. **Select Feature**: "Habitat"
2. **Spin Wheel**: Randomly lands on "Ocean"
3. **Filter**: 12 animals → 2 animals (Shark, Dolphin)
4. **Select Feature**: "Diet"
5. **Spin Wheel**: Lands on "Carnivore"
6. **Filter**: 2 animals → 2 animals (both are carnivores!)
7. **Make Guess**: Guess both Shark and Dolphin
8. **Score**: Calculate points based on efficiency

## ✨ Features

- 🎲 **Configuration-Driven**: Define datasets and game rules through JSON configs
- 🧮 **Multiple Game Modes**: Pure deduction, calculated guess, multiple choice
- 📊 **Entropy-Based Selection**: Automatic feature selection using information gain
- 🏆 **Flexible Scoring**: Customizable scoring with bonuses and penalties
- 🔧 **Data Processing**: Automatic bucketing for numerical features, grouping for categorical
- ✅ **Type-Safe**: Full TypeScript implementation with comprehensive types
- 🧪 **Well-Tested**: 52+ tests with >90% coverage
- 📚 **Educational**: Built-in analysis and suggestions for learning

## 📦 Installation

```bash
npm install
npm run build
```

## 🚀 Quick Start

### 1. Define Your Dataset

Create a `data_config.json`:

```json
{
  "metadata": {
    "name": "Animals Dataset",
    "version": "1.0.0",
    "description": "Collection of animals"
  },
  "identification_fields": ["name"],
  "feature_fields": [
    {
      "name": "habitat",
      "display_name": "Habitat",
      "type": "categorical"
    },
    {
      "name": "diet",
      "display_name": "Diet",
      "type": "categorical"
    }
  ],
  "items": [
    { "name": "Lion", "habitat": "Savanna", "diet": "Carnivore" },
    { "name": "Elephant", "habitat": "Savanna", "diet": "Herbivore" },
    { "name": "Shark", "habitat": "Ocean", "diet": "Carnivore" }
  ]
}
```

### 2. Define Game Rules

Create a `game_config.json`:

```json
{
  "metadata": { "game_name": "Animal Detective" },
  "game_mode": {
    "type": "calculated_guess",
    "allow_early_guess": true,
    "require_single_item": false
  },
  "feature_selection": {
    "method": "user_choice",
    "available_features": ["habitat", "diet"]
  },
  "random_selector": { "type": "spinning_wheel" },
  "scoring_system": {
    "base_points_correct_guess": 100,
    "calculation_method": "inverse_set_size"
  },
  "turn_mechanics": {
    "max_turns": 10,
    "show_remaining_items_count": true,
    "show_remaining_items_list": true
  }
}
```

### 3. Play the Game

```typescript
import {
  loadConfigsSync,
  initializeGame,
  executeTurn,
  makeGuess,
  calculateFinalScore
} from './dist/index';

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

console.log(`Spun and got: ${selection.selectedValue}`);
console.log(`Items remaining: ${newState.currentItems.length}`);

// Make a guess
const itemNames = newState.currentItems.map(item => item.name);
const guess = makeGuess(newState, itemNames, dataConfig.identification_fields);

// Calculate score
const finalScore = calculateFinalScore(newState, guess, gameConfig);
console.log(`Score: ${finalScore.totalPoints} points`);
console.log(`Efficiency: ${finalScore.efficiency.toFixed(1)}%`);
```

## 📖 Usage Examples

### Basic Game Loop

```typescript
import { initializeGame, executeTurn, getGameStatus } from './dist/index';

let state = initializeGame(dataConfig, gameConfig);

while (!state.isComplete) {
  // Select a feature (manually or automatically)
  const feature = selectFeature(state, null, 'auto', 'entropy_based');

  // Execute the turn
  const { newState, selection } = executeTurn(state, feature, dataConfig, gameConfig);

  console.log(`Selected ${feature} = ${selection.selectedValue}`);
  console.log(`${newState.currentItems.length} items remaining`);

  state = newState;

  // Check if we should guess
  const status = getGameStatus(state, gameConfig);
  if (status.mustGuess || status.itemsRemaining === 1) {
    break;
  }
}
```

### Auto-Selection with Entropy

```typescript
import { selectFeature, generateWeights } from './dist/index';

// Automatically select the feature with highest information gain
const bestFeature = selectFeature(state, null, 'auto', 'entropy_based');

// Generate probability weights for the selector
const weights = generateWeights(state, bestFeature, 'proportional');
console.log(weights); // { "Ocean": 0.4, "Savanna": 0.6 }
```

### Custom Scoring Formula

```json
{
  "scoring_system": {
    "base_points_correct_guess": 100,
    "calculation_method": "custom",
    "formula": "base_points * (1 / remaining_items) * (10 / turns_used)",
    "bonus_points": {
      "high_information_gain": 20,
      "efficient_turns": 10
    }
  }
}
```

### Numerical Feature Bucketing

```json
{
  "name": "weight_kg",
  "display_name": "Weight",
  "type": "numerical",
  "bucketing": {
    "method": "custom",
    "buckets": [
      { "label": "Light (0-10kg)", "min": 0, "max": 10 },
      { "label": "Medium (10-100kg)", "min": 10, "max": 100 },
      { "label": "Heavy (100kg+)", "min": 100, "max": null }
    ]
  }
}
```

## 🎮 Game Modes

### 1. Pure Deduction
Players must narrow down to exactly one item before guessing.
- Best for learning systematic elimination
- Requires complete feature exploration
- Scored on efficiency (fewer turns = higher score)

### 2. Calculated Guess
Players can guess at any time with partial information.
- Risk/reward: Early guesses are harder but score higher
- Uses inverse set size: `points × (1 / items_remaining)`
- Teaches probability and confidence assessment

### 3. Multiple Choice
Players guess all matching items from current filtered set.
- Tests understanding of feature combinations
- Penalties for false positives
- Good for learning feature relationships

## 📊 Datasets Included

Feature Sleuth comes with several example datasets:

| Dataset | Items | Features | Use Case |
|---------|-------|----------|----------|
| **Animals** | 12 | Habitat, Diet, Weight, Covering, Can Fly | Biology education |
| **Countries** | 50 | Continent, Population, GDP, Language, etc. | Geography & social studies |
| **US States** | 50 | Region, Size, Population, Coast, etc. | American geography |
| **Programming Languages** | 20 | Paradigm, Typing, Use Case, Age | Computer science |
| **Movies** | 30 | Genre, Era, Rating, Awards | Film studies |
| **Musical Instruments** | 25 | Family, Material, Origin, Pitch Range | Music education |

See the [`examples/configs/data/`](examples/configs/data/) directory for full datasets.

## 🏗️ Architecture

Feature Sleuth uses a **pure functional architecture** for predictable, testable game logic:

```
┌─────────────────────────────────────┐
│     Configuration Files (JSON)      │
│  • data_config.json                 │
│  • game_config.json                 │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│      Config Loader & Validator      │
│  • Load and parse configurations    │
│  • Validate structure and rules     │
│  • Cross-validate compatibility     │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│        Data Processor               │
│  • Bucket numerical features        │
│  • Group categorical features       │
│  • Calculate weights & entropy      │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│         Game Engine                 │
│  • Initialize game state            │
│  • Execute turns (pure functions)   │
│  • Filter items immutably           │
│  • Select features (manual/auto)    │
└──────────────┬──────────────────────┘
               │
               ↓
┌─────────────────────────────────────┐
│       Scoring Engine                │
│  • Calculate base points            │
│  • Apply bonuses & penalties        │
│  • Analyze gameplay efficiency      │
│  • Generate improvement suggestions │
└─────────────────────────────────────┘
```

### Core Principles

1. **Immutable State**: Every game operation returns a new state
2. **Pure Functions**: No side effects, predictable outputs
3. **Configuration-Driven**: Zero hardcoded game rules
4. **Type-Safe**: Full TypeScript coverage
5. **Testable**: Easy to test with deterministic behavior

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

Current test coverage:
- ✅ **52 tests** passing
- ✅ **>90% coverage** across all modules
- ✅ Unit tests for all core functions
- ✅ Integration tests for complete game flows

## 📚 API Reference

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for complete API documentation.

### Key Functions

#### Game Flow
- `initializeGame(dataConfig, gameConfig)` - Create new game state
- `executeTurn(state, feature, dataConfig, gameConfig)` - Execute complete turn
- `makeGuess(state, guesses, identificationFields)` - Validate guesses
- `calculateFinalScore(state, guess, gameConfig)` - Calculate final score

#### Feature Selection
- `selectFeature(state, feature?, method, algorithm)` - Choose feature
- `generateWeights(state, feature, method)` - Calculate probabilities
- `spinSelector(weights, random?)` - Perform random selection

#### Data Processing
- `processFeatures(items, featureFields)` - Process all features
- `bucketNumericalFeature(items, field)` - Create buckets
- `calculateFeatureWeights(items, feature)` - Calculate weights

#### Utilities
- `calculateEntropy(items, feature)` - Shannon entropy
- `findBestFeature(items, features)` - Highest information gain
- `validateConfigs(dataConfig, gameConfig)` - Validate configurations

## 🔧 Configuration Reference

### Data Configuration Schema

```typescript
interface DataConfig {
  metadata: {
    name: string;
    version: string;
    description: string;
  };
  identification_fields: string[];
  feature_fields: FeatureField[];
  items: Item[];
  preprocessing?: {
    feature_selection_entropy_threshold?: number;
    weight_calculation_method?: 'proportional' | 'equal';
  };
}
```

### Game Configuration Schema

```typescript
interface GameConfig {
  metadata: { game_name: string };
  game_mode: {
    type: 'pure_deduction' | 'calculated_guess' | 'multiple_choice';
    allow_early_guess: boolean;
    require_single_item: boolean;
  };
  feature_selection: {
    method: 'user_choice' | 'auto' | 'hybrid';
    available_features?: string[];
  };
  random_selector: {
    type: 'spinning_wheel' | 'dice' | 'card_draw' | 'slot_machine';
  };
  scoring_system: ScoringSystem;
  turn_mechanics: TurnMechanics;
}
```

## 🎨 Creating Custom Datasets

### 1. Gather Your Data

Any tabular data works! Examples:
- Countries, cities, landmarks
- Products, brands, companies
- Historical figures, events
- Chemicals, elements, compounds
- Sports teams, athletes, games

### 2. Identify Features

Choose 4-8 distinguishing features:
- **Categorical**: Color, Type, Category, Location
- **Numerical**: Size, Weight, Price, Year (will be bucketed)
- **Boolean**: HasProperty, IsType, CanAction

### 3. Format as JSON

```json
{
  "items": [
    { "name": "ItemName", "feature1": "value", "feature2": 123 }
  ]
}
```

### 4. Test Your Dataset

```bash
npm test -- --testPathPattern=integration
```

See [`examples/configs/data/`](examples/configs/data/) for complete examples.

## 🎯 Educational Applications

### Classroom Use
- **Science**: Animals, plants, elements, planets
- **Geography**: Countries, states, landmarks, biomes
- **History**: Events, figures, civilizations, inventions
- **Language**: Words, grammar rules, literature
- **Math**: Shapes, number properties, theorems

### Corporate Training
- **Product Knowledge**: Features, use cases, specifications
- **Company Information**: Departments, policies, people
- **Industry Terms**: Concepts, regulations, standards

### Self-Learning
- **Data Science**: Practice feature selection and classification
- **Critical Thinking**: Develop systematic reasoning skills
- **Domain Knowledge**: Learn any subject through play

## 🚧 Roadmap & Future Features

### Implemented ✅
- ✅ Core game engine with pure functional design
- ✅ Configuration-driven architecture
- ✅ Multiple game modes (pure deduction, calculated guess, multiple choice)
- ✅ Data processing (bucketing, grouping, weights)
- ✅ Entropy-based feature selection
- ✅ Flexible scoring system with bonuses/penalties
- ✅ Comprehensive validation
- ✅ Full TypeScript implementation
- ✅ Complete test suite (52+ tests)

### Not Yet Implemented 🚧

The original design document described a **full-stack web application**. This package implements the **core game engine only**. The following components are **not included** in this package:

#### Frontend Components (Not Implemented)
- ❌ React/Vue UI components
- ❌ Visual random selectors (spinning wheel, dice, card draw animations)
- ❌ State management integration (Redux/Zustand)
- ❌ Progress tracking UI
- ❌ Post-game analysis dashboard
- ❌ Theme system and animations
- ❌ Mobile-responsive layouts

#### Backend Features (Not Implemented)
- ❌ User accounts and authentication
- ❌ Progress tracking and persistence
- ❌ Leaderboards and achievements
- ❌ Multiplayer modes
- ❌ Dataset management API
- ❌ Analytics and telemetry

#### Advanced Features (Not Implemented)
- ❌ Adaptive difficulty
- ❌ AI opponent
- ❌ Hint system implementation (engine supports it, but no UI)
- ❌ Community dataset sharing
- ❌ In-app dataset creator
- ❌ Classroom management integration

### Potential Next Steps

If you need any of the above features, you can:

1. **Build a Frontend**: Use this package as the engine and build UI with React/Vue
2. **Add Backend**: Wrap this package in an Express/FastAPI server
3. **Extend the Engine**: Fork and add custom features
4. **Integrate**: Use with existing educational platforms

**This package provides the solid foundation** for any of these directions.

See [`README_ORIGINAL.md`](README_ORIGINAL.md) for the full architectural design document that inspired this implementation.

## 🤝 Contributing

Contributions welcome! Areas of interest:

1. **New Datasets**: Add interesting domains to `examples/configs/data/`
2. **Game Modes**: Implement new game mode variants
3. **Scoring Algorithms**: Add new scoring methods
4. **Frontend Integration**: Build UI components using this engine
5. **Documentation**: Improve guides and examples

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by classic games:
- **20 Questions** - Deductive reasoning through questioning
- **Guess Who?** - Feature-based elimination
- **Akinator** - Web-based character guessing

Built with modern educational game design principles from decision tree learning and information theory.

---

**Ready to turn your data into an educational game?** Start with the [Quick Start](#-quick-start) guide or explore the [example datasets](examples/configs/data/)!
