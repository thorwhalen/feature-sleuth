import { create } from 'zustand';
import type {
  DataConfig,
  GameConfig,
  GameState,
  SelectionResult,
  FinalScore,
} from 'feature-sleuth';
import {
  loadConfigsSync,
  initializeGame,
  executeTurn,
  makeGuess,
  calculateFinalScore,
  selectFeature as selectBestFeature,
} from 'feature-sleuth';

export type GamePhase = 'setup' | 'playing' | 'guessing' | 'complete';

interface GameStore {
  // Configurations
  dataConfig: DataConfig | null;
  gameConfig: GameConfig | null;

  // Game state
  gameState: GameState | null;
  phase: GamePhase;
  lastSelection: SelectionResult | null;
  finalScore: FinalScore | null;
  error: string | null;

  // UI state
  selectedFeature: string | null;
  isSpinning: boolean;

  // Actions
  loadGame: (dataConfig: DataConfig, gameConfig: GameConfig) => void;
  startGame: () => void;
  selectFeature: (feature: string) => void;
  spinWheel: () => void;
  submitGuess: (guesses: string[]) => void;
  resetGame: () => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  dataConfig: null,
  gameConfig: null,
  gameState: null,
  phase: 'setup',
  lastSelection: null,
  finalScore: null,
  error: null,
  selectedFeature: null,
  isSpinning: false,

  // Load and validate configurations
  loadGame: (dataConfig, gameConfig) => {
    try {
      const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
        dataConfig,
        gameConfig
      );

      set({
        dataConfig: validatedData,
        gameConfig: validatedGame,
        error: null,
        phase: 'setup',
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load game',
        phase: 'setup',
      });
    }
  },

  // Start a new game
  startGame: () => {
    const { dataConfig, gameConfig } = get();
    if (!dataConfig || !gameConfig) {
      set({ error: 'No configuration loaded' });
      return;
    }

    try {
      const gameState = initializeGame(dataConfig, gameConfig);
      set({
        gameState,
        phase: 'playing',
        lastSelection: null,
        finalScore: null,
        error: null,
        selectedFeature: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start game',
      });
    }
  },

  // Select a feature
  selectFeature: (feature) => {
    set({ selectedFeature: feature, error: null });
  },

  // Spin the wheel and execute turn
  spinWheel: () => {
    const { gameState, selectedFeature, dataConfig, gameConfig } = get();
    if (!gameState || !dataConfig || !gameConfig) {
      set({ error: 'Game not initialized' });
      return;
    }

    let featureToUse = selectedFeature;
    if (!featureToUse) {
      // Auto-select if no feature chosen
      featureToUse = selectBestFeature(gameState, null, 'auto', 'entropy_based');
    }

    try {
      set({ isSpinning: true });

      // Simulate spin animation delay
      setTimeout(() => {
        const { newState, selection } = executeTurn(
          gameState,
          featureToUse!,
          dataConfig,
          gameConfig
        );

        // Check if game should end
        const shouldGuess =
          newState.currentItems.length === 1 ||
          newState.availableFeatures.length === 0 ||
          newState.isComplete;

        set({
          gameState: newState,
          lastSelection: selection,
          selectedFeature: null,
          isSpinning: false,
          phase: shouldGuess ? 'guessing' : 'playing',
        });
      }, 2000); // 2 second spin animation
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to execute turn',
        isSpinning: false,
      });
    }
  },

  // Submit guess
  submitGuess: (guesses) => {
    const { gameState, dataConfig, gameConfig } = get();
    if (!gameState || !dataConfig || !gameConfig) {
      set({ error: 'Game not initialized' });
      return;
    }

    try {
      const guessResult = makeGuess(gameState, guesses, dataConfig.identification_fields);
      const finalScore = calculateFinalScore(gameState, guessResult, gameConfig);

      set({
        finalScore,
        phase: 'complete',
        error: null,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to submit guess',
      });
    }
  },

  // Reset game
  resetGame: () => {
    set({
      gameState: null,
      phase: 'setup',
      lastSelection: null,
      finalScore: null,
      error: null,
      selectedFeature: null,
      isSpinning: false,
    });
  },

  // Set error
  setError: (error) => {
    set({ error });
  },
}));
