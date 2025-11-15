This educational game system uses **data-driven guessing** to teach users how to categorize and identify items based on their features, similar to a process of **Deductive Reasoning** or a simplified version of **20 Questions**.

---

## 🎮 The System: "Feature Sleuth" (A Working Title)

### 🌟 TL;DR Description

The system, which could be categorized as an **Educational Guessing Game** or **Data-Driven Feature Identification**, gamifies learning by challenging users to identify a specific item from a collection (a **dataset** or **item catalog**) based on incrementally revealed **feature characteristics**. The core mechanic involves selecting a feature (like color, size, or type) and then using a **random selector** (like a spinning wheel or dice) to narrow down the possible items. The goal is either to identify a single item or make a calculated guess from the remaining possibilities, with scoring rewarding efficient and accurate deduction.

---

## 🎯 Game Category and Lingo

This game falls under several related categories and employs concepts from game design, data science, and education:

* **Educational Guessing/Deduction Game:** The user employs logic and knowledge to eliminate possibilities and deduce the correct answer.
* **Feature Identification/Classification:** The process mirrors how algorithms classify objects based on their feature vector.
* **The 20 Questions Pattern:** The game uses a series of questions/selections to systematically narrow a large set of possibilities until the target is identified.
* **Entropy-Based Selection:** Mentioning the potential for the game to choose the next feature based on **entropy** (a measure of uncertainty) suggests a system that aims to select the feature that will provide the **maximum information gain** (i.e., the feature that, when split, best halves the remaining item set) to efficiently narrow the search.
* **Similar Games/Patterns:**
    * **20 Questions:** A classic example of deductive set reduction.
    * **Guess Who?:** Players systematically eliminate features (glasses, hat, hair color) until only one character remains.
    * **Mastermind:** While it uses features (colors/positions) and deduction, the feedback mechanism is different.
    * **Decision Tree Learning:** The structure of making a choice based on a feature value, which leads to a subset, strongly mirrors the node structure of a **Decision Tree** , where each feature split classifies the data.

---

## ⚙️ Core Mechanics and Game Forms

The system is defined by its data input and its interactive mechanics.

### 1. Data Input and Structure

| Component | Description | Example (for an animal learning app) |
| :--- | :--- | :--- |
| **Input Data** | A list/catalog of items, often structured as a **table** or **dataset**. | A catalog of animals. |
| **Identification Field(s)** | The unique label(s) for the item(s) the user must guess. | **Animal Name** (e.g., *Lion*, *Penguin*). |
| **Feature Field(s)** | The **attributes** or **characteristics** of the items used for selection. | **Habitat**, **Diet**, **Body Covering**. |
| **Feature Processing** | The method for transforming raw data into manageable choices for the random selector. | The numerical feature "Weight" is **bucketed** into {0-10kg: 60%, 10-100kg: 30%, 100+kg: 10%}. |

### 2. Gameplay Loop and Forms

The game can take on several distinct forms based on the required path to identification and the scoring logic. The core loop is:

1.  **Feature Selection:** A feature category is chosen (e.g., "Body Covering").
2.  **Random Selection:** The user spins the wheel to select a specific characteristic (e.g., "Feathers").
3.  **Set Reduction:** The item collection is filtered to include only items matching the selected characteristic.
4.  **Guess/Continue:** The user either makes a guess or selects the next feature to further reduce the item set.

| Game Form | Description | Guess/Scoring Logic |
| :--- | :--- | :--- |
| **Form A: Pure Deduction** | The user must continue selecting features until the remaining item set is $\mathbf{N=1}$. The user then guesses the final item. | **Win/Loss:** Scored on number of turns/features used (fewer turns is better).  |
| **Form B: Calculated Guess** | The user can guess at *any* point, even if $\mathbf{N > 1}$ items remain. | **Risk/Reward Scoring:** Points are weighted by $\mathbf{1/N}$. Higher points for a correct guess when fewer items remain (higher risk/difficulty). |
| **Form C: Multiple Choice** | The selection process reveals the matching set. The user must guess *all* items in the matching set or a percentage of them. | **Accuracy Score:** Scored on the ratio of correctly guessed items to the actual number of matching items. **Negative points** may be applied for guessing an item not in the set (a **false positive**). |

### 3. Scoring Considerations

The scoring system is crucial to driving the desired learning behavior.

* **Information Gain Bonus:** Awarding bonus points for selecting a feature that yields the greatest reduction in the item set (**high information gain**), even if that feature was randomly selected by the game.
* **Confidence Bonus:** In the "Calculated Guess" form, scoring can incorporate the user's *stated confidence* or the current set size ($N$). A higher score for correct guesses when $N$ is small incentivizes **knowledge**; a higher score when $N$ is large incentivizes **risk assessment**.
* **Time/Efficiency:** Punishing excessive steps promotes strategic thinking and efficient feature choice.




# Feature Sleuth: Educational Guessing Game
## Architectural Design Document

---

## 🎯 Executive Summary

**Feature Sleuth** is a data-driven educational game that teaches classification and deductive reasoning. Users identify items from a dataset by iteratively selecting features through random selection mechanisms (spinning wheels, dice), progressively narrowing the possibility space until they can make an informed guess.

**Architecture Philosophy:**
- **Frontend-heavy implementation** with game logic in JavaScript/TypeScript
- **Configuration-driven** with zero hardcoded game rules
- **Two-file configuration system**: data specification + game rules
- **Stateless sessions** (can add persistence later)
- **Modular component design** for easy extension

---

## 📐 System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (React/Vue)                 │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   UI Layer   │  │  Game Engine │  │ Config Loader│ │
│  │  Components  │  │    Core      │  │   & Parser   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                            │                            │
│                  ┌─────────┴─────────┐                 │
│                  │   State Manager   │                 │
│                  │   (Redux/Zustand) │                 │
│                  └───────────────────┘                 │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/Fetch
                            ↓
┌─────────────────────────────────────────────────────────┐
│              Static File Server (Optional)               │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  data_config.json│      │  game_config.json│        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Separation of Data & Rules**: Data structure is independent of game mechanics
2. **Immutable Game State**: Each turn creates new state rather than mutating
3. **Pure Functions**: Game logic functions are side-effect-free for testability
4. **Progressive Enhancement**: Basic functionality works, advanced features layer on top

---

## 📋 Configuration System

### Config File 1: Data Configuration (`data_config.json`)

Defines the dataset, features, and how to process them.

```json
{
  "metadata": {
    "name": "Animals Dataset",
    "version": "1.0.0",
    "description": "Collection of animals for educational game"
  },
  
  "identification_fields": ["name"],
  
  "feature_fields": [
    {
      "name": "habitat",
      "display_name": "Habitat",
      "type": "categorical",
      "grouping": {
        "enabled": false,
        "max_categories": 6
      }
    },
    {
      "name": "weight_kg",
      "display_name": "Weight",
      "type": "numerical",
      "bucketing": {
        "method": "custom",
        "buckets": [
          {"label": "0-10kg", "min": 0, "max": 10},
          {"label": "10-100kg", "min": 10, "max": 100},
          {"label": "100kg+", "min": 100, "max": null}
        ]
      }
    },
    {
      "name": "diet",
      "display_name": "Diet",
      "type": "categorical"
    }
  ],
  
  "items": [
    {
      "name": "Lion",
      "habitat": "Savanna",
      "weight_kg": 190,
      "diet": "Carnivore",
      "image_url": "/images/lion.jpg"
    },
    {
      "name": "Penguin",
      "habitat": "Antarctic",
      "weight_kg": 25,
      "diet": "Carnivore",
      "image_url": "/images/penguin.jpg"
    }
  ],
  
  "preprocessing": {
    "feature_selection_entropy_threshold": 0.3,
    "weight_calculation_method": "proportional"
  }
}
```

**Key Components:**

- **`identification_fields`**: Array of field names that uniquely identify items (usually `["name"]`)
- **`feature_fields`**: Array of feature definitions with processing rules
  - `type`: "categorical" | "numerical" | "boolean"
  - `bucketing`: For numerical features, how to create discrete categories
  - `grouping`: For categorical features with too many values
- **`items`**: The actual dataset (can also reference external CSV/JSON file)
- **`preprocessing`**: Rules for processing raw data into game-ready format

### Config File 2: Game Configuration (`game_config.json`)

Defines game rules, mechanics, scoring, and UI preferences.

```json
{
  "metadata": {
    "game_name": "Animal Detective",
    "difficulty": "medium",
    "target_age_range": "8-12"
  },
  
  "game_mode": {
    "type": "calculated_guess",
    "allow_early_guess": true,
    "require_single_item": false
  },
  
  "feature_selection": {
    "method": "user_choice",
    "auto_selection_algorithm": "entropy_based",
    "available_features": ["habitat", "weight_kg", "diet"]
  },
  
  "random_selector": {
    "type": "spinning_wheel",
    "animation_duration_ms": 2000,
    "options": {
      "show_probabilities": false,
      "allow_respin": false
    }
  },
  
  "scoring_system": {
    "base_points_correct_guess": 100,
    "calculation_method": "inverse_set_size",
    "formula": "base_points * (1 / remaining_items)",
    "bonus_points": {
      "high_information_gain": 20,
      "efficient_turns": 10
    },
    "penalties": {
      "false_positive_guess": -10,
      "excessive_turns_threshold": 10,
      "penalty_per_extra_turn": -5
    }
  },
  
  "turn_mechanics": {
    "max_turns": 15,
    "show_remaining_items_count": true,
    "show_remaining_items_list": false,
    "hint_system": {
      "enabled": true,
      "hints_per_game": 2
    }
  },
  
  "ui_preferences": {
    "theme": "educational_bright",
    "show_progress_bar": true,
    "show_feature_history": true,
    "animations_enabled": true
  },
  
  "educational_mode": {
    "show_information_gain": true,
    "explain_entropy": false,
    "post_game_analysis": true
  }
}
```

**Key Components:**

- **`game_mode`**: Defines which of the three game forms to use
- **`feature_selection`**: Who chooses features and how
- **`random_selector`**: Type of randomization UI and behavior
- **`scoring_system`**: Complete scoring logic including formulas
- **`turn_mechanics`**: Game flow rules and constraints
- **`ui_preferences`**: Visual and interaction preferences
- **`educational_mode`**: Learning-focused features

---

## 🏗️ Component Architecture

### 1. **Config Loader & Parser** (`config-loader.ts`)

**Responsibility**: Load, validate, and parse both configuration files.

```typescript
interface ConfigLoader {
  loadDataConfig(url: string): Promise<DataConfig>
  loadGameConfig(url: string): Promise<GameConfig>
  validateConfigs(data: DataConfig, game: GameConfig): ValidationResult
}
```

**Key Functions:**
- `loadDataConfig()`: Fetch and parse data configuration
- `loadGameConfig()`: Fetch and parse game configuration
- `validateConfigs()`: Cross-validate both configs for consistency
- `processDataset()`: Transform raw items into game-ready format

---

### 2. **Data Processor** (`data-processor.ts`)

**Responsibility**: Transform raw dataset into game-usable structures.

```typescript
interface DataProcessor {
  bucketNumericalFeature(items: Item[], feature: FeatureField): BucketedFeature
  groupCategoricalFeature(items: Item[], feature: FeatureField): GroupedFeature
  calculateFeatureWeights(items: Item[], feature: string): WeightMap
  computeEntropy(items: Item[], feature: string): number
}
```

**Key Functions:**
- `bucketNumericalFeature()`: Convert numerical values into discrete categories
- `groupCategoricalFeature()`: Merge rare categories if needed
- `calculateFeatureWeights()`: Generate probability distribution for selector
- `computeEntropy()`: Calculate information gain for feature selection

---

### 3. **Game Engine Core** (`game-engine.ts`)

**Responsibility**: Implement game logic as pure functions.

```typescript
interface GameEngine {
  initializeGame(data: DataConfig, game: GameConfig): GameState
  selectFeature(state: GameState, feature: string): GameState
  spinSelector(state: GameState): SelectionResult
  filterItems(state: GameState, selection: string): GameState
  makeGuess(state: GameState, guesses: string[]): GuessResult
  calculateScore(state: GameState, result: GuessResult): Score
}
```

**Key Types:**

```typescript
type GameState = {
  currentItems: Item[]
  selectedFeatures: FeatureSelection[]
  turnNumber: number
  score: number
  availableFeatures: string[]
  history: Turn[]
}

type FeatureSelection = {
  feature: string
  value: string
  itemsBeforeSelection: number
  itemsAfterSelection: number
  informationGain: number
}

type GuessResult = {
  correct: string[]
  incorrect: string[]
  remaining: string[]
  isComplete: boolean
}
```

**Key Functions:**
- `initializeGame()`: Create initial game state from configs
- `selectFeature()`: Choose next feature (user or auto)
- `spinSelector()`: Execute random selection with animation data
- `filterItems()`: Apply selection to narrow item set
- `makeGuess()`: Validate user guesses against current set
- `calculateScore()`: Apply scoring formula from config

---

### 4. **Random Selector Component** (`selectors/`)

**Responsibility**: Render different types of random selection UI.

```typescript
interface RandomSelector {
  render(weights: WeightMap, config: SelectorConfig): JSX.Element
  animate(): Promise<string>
  getSelectedValue(): string
}
```

**Implementations:**
- `SpinningWheel.tsx`: Wheel-of-fortune style selector
- `DiceRoll.tsx`: Dice-based selection
- `CardDraw.tsx`: Card shuffle and draw
- `SlotMachine.tsx`: Slot machine style

Each selector receives weights and returns selected value.

---

### 5. **Scoring Engine** (`scoring-engine.ts`)

**Responsibility**: Calculate scores based on game configuration.

```typescript
interface ScoringEngine {
  evaluateGuess(guess: GuessResult, state: GameState): number
  applyBonuses(score: number, state: GameState): number
  applyPenalties(score: number, state: GameState): number
  calculateFinalScore(state: GameState): FinalScore
}
```

**Key Features:**
- Formula parser for custom scoring formulas
- Bonus/penalty system from config
- Turn efficiency tracking
- Information gain rewards

---

### 6. **State Manager** (`store.ts`)

**Responsibility**: Manage game state with Redux/Zustand.

```typescript
interface GameStore {
  // State
  gameState: GameState
  dataConfig: DataConfig
  gameConfig: GameConfig
  
  // Actions
  initializeNewGame(): void
  selectFeature(feature: string): void
  executeSelection(): void
  submitGuess(guesses: string[]): void
  restartGame(): void
}
```

---

### 7. **UI Components** (`components/`)

**Component Tree:**

```
<App>
  <ConfigLoader onLoad={startGame} />
  
  <GameContainer>
    <Header score={score} turns={turns} />
    
    <FeatureSelector 
      features={availableFeatures}
      onSelect={selectFeature}
    />
    
    <RandomSelectorContainer>
      {/* SpinningWheel | DiceRoll | CardDraw */}
    </RandomSelectorContainer>
    
    <ItemDisplay 
      items={remainingItems}
      showCount={config.show_count}
      showList={config.show_list}
    />
    
    <GuessInterface
      onGuess={submitGuess}
      allowMultiple={gameMode === 'multiple_choice'}
    />
    
    <ProgressTracker
      history={featureHistory}
      showInformationGain={educationalMode}
    />
  </GameContainer>
  
  <GameOverModal
    finalScore={score}
    analysis={postGameAnalysis}
  />
</App>
```

---

## 🔄 Implementation Sequence

### Phase 1: Foundation (Week 1)

1. **Project Setup**
   - Initialize React/Vue project with TypeScript
   - Set up build system (Vite/Webpack)
   - Configure linting, formatting, testing

2. **Config System**
   - Define TypeScript interfaces for both configs
   - Implement `ConfigLoader` with validation
   - Create sample data and game configs
   - Test config loading and validation

3. **Data Processor**
   - Implement numerical bucketing logic
   - Implement categorical grouping logic
   - Create weight calculation functions
   - Test with sample datasets

### Phase 2: Core Game Logic (Week 2)

4. **Game Engine - State Management**
   - Define `GameState` type and interfaces
   - Implement `initializeGame()`
   - Implement state transitions as pure functions
   - Write unit tests for all functions

5. **Game Engine - Selection & Filtering**
   - Implement `selectFeature()`
   - Implement `filterItems()`
   - Implement entropy-based auto-selection
   - Test filtering logic extensively

6. **Scoring Engine**
   - Parse scoring formulas from config
   - Implement base scoring calculation
   - Add bonus/penalty system
   - Test all scoring scenarios

### Phase 3: UI Components (Week 3)

7. **Basic UI Framework**
   - Create component structure
   - Implement state management (Redux/Zustand)
   - Connect components to game engine
   - Basic styling

8. **Feature Selector Component**
   - Display available features
   - Handle user selection
   - Show/hide based on config
   - Accessibility features

9. **Item Display Component**
   - Show remaining items count
   - Show/hide item list based on config
   - Add filtering visualization
   - Responsive design

### Phase 4: Random Selectors (Week 4)

10. **Spinning Wheel Selector**
    - SVG-based wheel rendering
    - Weight-based segment sizing
    - Smooth spin animation
    - Result selection logic

11. **Alternative Selectors**
    - Dice roll implementation
    - Card draw implementation
    - Configurable selector switching
    - Test all selector types

### Phase 5: Guess & Scoring (Week 5)

12. **Guess Interface**
    - Single item guess UI
    - Multiple item guess UI
    - Validation and feedback
    - Accessibility

13. **Scoring Display**
    - Real-time score updates
    - Bonus/penalty notifications
    - Score breakdown modal
    - Animation effects

### Phase 6: Educational Features (Week 6)

14. **Progress Tracking**
    - Feature history display
    - Information gain visualization
    - Decision tree view (optional)
    - Export learning data

15. **Post-Game Analysis**
    - Optimal path calculation
    - Efficiency metrics
    - Educational insights
    - Replay functionality

### Phase 7: Polish & Testing (Week 7)

16. **UI/UX Refinement**
    - Animations and transitions
    - Sound effects (optional)
    - Theme system
    - Mobile responsiveness

17. **Comprehensive Testing**
    - Unit tests for all logic
    - Integration tests
    - E2E tests with Playwright/Cypress
    - Accessibility testing

18. **Documentation**
    - Config file documentation
    - Developer guide
    - User instructions
    - Deployment guide

---

## 🛠️ Technical Decisions & Rationale

### Frontend Framework: React with TypeScript

**Rationale:**
- Strong typing prevents config mismatches
- Large ecosystem for UI components
- Excellent testing support
- Component reusability

**Alternative:** Vue 3 + TypeScript (equally valid choice)

### State Management: Zustand

**Rationale:**
- Simpler than Redux for this use case
- TypeScript-first design
- Minimal boilerplate
- Easy to test

**Alternative:** Redux Toolkit (if need time-travel debugging)

### Random Selector: SVG-based Custom Components

**Rationale:**
- Full control over appearance
- Smooth animations with CSS/GSAP
- Lightweight (no heavy dependencies)
- Configurable

**Alternative:** Canvas (if need complex graphics)

### Config Format: JSON

**Rationale:**
- Native JavaScript parsing
- Schema validation with JSON Schema
- Type generation with tools like quicktype
- Widely supported

**Alternative:** YAML (more human-readable but needs parser)

### Data Loading: Static JSON Files

**Rationale:**
- Simplest deployment (no backend needed)
- Fast loading
- Easy to version control
- Can upgrade to API later

**Phase 2 Option:** Add optional API endpoint support

---

## 📊 Data Flow Diagram

```
[Load Configs]
     ↓
[Validate & Parse]
     ↓
[Process Dataset]
  ├─ Bucket Numerical Features
  ├─ Group Categorical Features
  └─ Calculate Weights
     ↓
[Initialize Game State]
     ↓
┌────────────────────────────────┐
│     GAME LOOP                  │
│  ┌──────────────────────────┐ │
│  │ 1. Select Feature        │ │
│  │    (User or Auto)        │ │
│  └──────────────────────────┘ │
│            ↓                   │
│  ┌──────────────────────────┐ │
│  │ 2. Generate Weights      │ │
│  │    for Selector          │ │
│  └──────────────────────────┘ │
│            ↓                   │
│  ┌──────────────────────────┐ │
│  │ 3. Spin Selector         │ │
│  │    (Random Selection)    │ │
│  └──────────────────────────┘ │
│            ↓                   │
│  ┌──────────────────────────┐ │
│  │ 4. Filter Items          │ │
│  │    by Selection          │ │
│  └──────────────────────────┘ │
│            ↓                   │
│  ┌──────────────────────────┐ │
│  │ 5. User Makes Guess      │ │
│  │    or Continues          │ │
│  └──────────────────────────┘ │
│            ↓                   │
│  ┌──────────────────────────┐ │
│  │ 6. Calculate Score       │ │
│  │    & Update State        │ │
│  └──────────────────────────┘ │
│            ↓                   │
│     [Game Complete?]           │
│      Yes ↓    No ↑             │
└──────────────────────────────┘
     ↓
[Show Results & Analysis]
```

---

## 🧪 Testing Strategy

### Unit Tests

**Files to Test:**
- `data-processor.ts`: All bucketing and grouping logic
- `game-engine.ts`: State transitions, filtering, selection
- `scoring-engine.ts`: Formula parsing, calculation
- `config-loader.ts`: Validation logic

**Framework:** Jest + Testing Library

### Integration Tests

**Scenarios:**
- Complete game flow from config load to completion
- Different game modes (all three forms)
- Edge cases (single item dataset, no matching items)

### E2E Tests

**User Flows:**
- Play complete game and win
- Play complete game and lose
- Use all selector types
- Test educational features

**Framework:** Playwright or Cypress

---

## 📁 Project Structure

```
feature-sleuth/
├── public/
│   ├── configs/
│   │   ├── data/
│   │   │   ├── animals.json
│   │   │   ├── geography.json
│   │   │   └── schema.json
│   │   └── games/
│   │       ├── beginner.json
│   │       ├── intermediate.json
│   │       └── schema.json
│   └── assets/
│       └── images/
│
├── src/
│   ├── core/
│   │   ├── config-loader.ts
│   │   ├── data-processor.ts
│   │   ├── game-engine.ts
│   │   └── scoring-engine.ts
│   │
│   ├── components/
│   │   ├── selectors/
│   │   │   ├── SpinningWheel.tsx
│   │   │   ├── DiceRoll.tsx
│   │   │   └── index.ts
│   │   ├── FeatureSelector.tsx
│   │   ├── ItemDisplay.tsx
│   │   ├── GuessInterface.tsx
│   │   └── ProgressTracker.tsx
│   │
│   ├── store/
│   │   └── game-store.ts
│   │
│   ├── types/
│   │   ├── config.types.ts
│   │   ├── game.types.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── entropy.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── hooks/
│   │   ├── useGameEngine.ts
│   │   └── useSelector.ts
│   │
│   └── App.tsx
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── CONFIG_SCHEMA.md
│   ├── DEVELOPER_GUIDE.md
│   └── USER_GUIDE.md
│
└── package.json
```

---

## 🔒 Validation & Error Handling

### Config Validation

**Data Config Validation:**
- All items have required fields
- Feature types match actual data
- Bucket ranges don't overlap
- References are valid (image URLs exist)

**Game Config Validation:**
- Referenced features exist in data config
- Scoring formulas are syntactically valid
- Turn limits are positive integers
- Game mode is valid enum value

### Runtime Error Handling

**Graceful Failures:**
- Missing config files → Show friendly error + instructions
- Invalid feature selection → Prevent selection + show message
- No matching items → Automatic win/special scoring
- Calculation errors → Default to base scoring

---

## 🚀 Deployment Considerations

### Static Hosting (Recommended for MVP)

**Platforms:** Vercel, Netlify, GitHub Pages

**Advantages:**
- Zero backend complexity
- Free tier available
- Automatic deployments
- CDN included

**Setup:**
1. Build production bundle
2. Deploy `dist/` folder
3. Configure routing for SPA
4. Upload config files to `public/configs/`

### With Backend (Optional Phase 2)

**When Needed:**
- User accounts and progress tracking
- Dynamic dataset management
- Multiplayer features
- Analytics collection

**Stack Suggestion:**
- API: Node.js + Express or Python + FastAPI
- Database: PostgreSQL for user data, MongoDB for configs
- Auth: Supabase or Auth0

---

## 🎨 UI/UX Guidelines

### Design Principles

1. **Clarity Over Cleverness**: Game mechanics should be immediately obvious
2. **Progressive Disclosure**: Show complexity only when needed
3. **Immediate Feedback**: Every action gets instant visual response
4. **Accessibility First**: WCAG 2.1 AA compliance minimum

### Key Interactions

**Feature Selection:**
- Highlight available features
- Disable selected features
- Show entropy/information gain if educational mode

**Random Selector:**
- Build anticipation with animation
- Clear result highlight
- Smooth transitions

**Item Display:**
- Visual indication of set reduction
- Smooth filtering animation
- Clear count update

**Guess Interface:**
- Auto-complete for item names
- Multiple selection for multi-guess mode
- Confirmation before submit

---

## 📈 Future Enhancements (Post-MVP)

### Phase 2 Features

1. **Multiplayer Mode**
   - Competitive: Race to guess first
   - Cooperative: Work together with turn limits

2. **User Accounts**
   - Progress tracking
   - Achievement system
   - Leaderboards

3. **Dataset Management**
   - In-app dataset creator
   - Community datasets
   - Import from CSV/Excel

4. **Advanced Educational Features**
   - Adaptive difficulty
   - Personalized hints based on learning patterns
   - Integration with classroom management systems

5. **AI Opponent**
   - Computer plays optimally (using entropy)
   - Teaching mode: Shows why it chose each feature

---

## 🤝 Development Best Practices

### Code Organization

- **Pure functions** for all game logic (testability)
- **Single Responsibility**: Each function does one thing
- **DRY**: Extract common patterns into utilities
- **Type safety**: No `any` types in production code

### Performance

- **Memoization**: Cache expensive calculations (entropy, weights)
- **Virtual scrolling**: For large datasets
- **Lazy loading**: Load selector components on demand
- **Bundle splitting**: Separate vendor and app code

### Accessibility

- **Keyboard navigation**: All interactions keyboard-accessible
- **Screen readers**: Proper ARIA labels
- **Color contrast**: WCAG AA compliant
- **Focus management**: Clear focus indicators

---

## 📚 Documentation Deliverables

1. **CONFIG_SCHEMA.md**
   - Complete JSON schema for both configs
   - Examples for each game mode
   - Validation rules explained

2. **DEVELOPER_GUIDE.md**
   - Setup instructions
   - Architecture overview
   - How to add new features
   - Testing guidelines

3. **USER_GUIDE.md**
   - How to create custom datasets
   - Game mode explanations
   - Scoring system guide
   - Troubleshooting

4. **API_REFERENCE.md**
   - Core function signatures
   - Type definitions
   - Usage examples

---

## ✅ Success Metrics

### MVP Success Criteria

- [ ] Loads custom config files without errors
- [ ] Supports all three game modes
- [ ] Spinning wheel selector works smoothly
- [ ] Correct scoring in all scenarios
- [ ] Responsive on mobile and desktop
- [ ] Passes accessibility audit
- [ ] Load time < 2 seconds
- [ ] Zero crashes in 100 test games

### Educational Effectiveness

- User understands feature-based classification
- User improves efficiency over multiple games
- User can explain why certain features are informative

---

## 🏁 Getting Started

### Immediate Next Steps

1. **Review and approve** this architectural document
2. **Choose** frontend framework (React recommended)
3. **Create** sample data and game configs
4. **Set up** project skeleton with build system
5. **Begin** Phase 1: Foundation implementation

### Questions to Answer Before Starting

1. Target deployment platform? (Vercel, Netlify, self-hosted)
2. Need backend eventually? (influences architecture)
3. Mobile-first or desktop-first?
4. Accessibility level target? (AA vs AAA)
5. Browser support requirements? (modern only vs IE11)
6. Analytics/telemetry needed?

---

This architecture provides a solid foundation for building Feature Sleuth as a maintainable, extensible, configuration-driven educational game. The separation of data and game configs allows for infinite game variations without code changes, while the pure functional core ensures reliability and testability.
