/**
 * Demo script showing how to use Feature Sleuth
 */

import {
  loadConfigs,
  initializeGame,
  selectFeature,
  executeTurn,
  makeGuess,
  calculateFinalScore,
  getGameStatus,
} from '../src';
import * as path from 'path';

async function runDemo() {
  console.log('🎮 Feature Sleuth Demo\n');
  console.log('='.repeat(50));

  // Load configurations
  console.log('\n📁 Loading configurations...');
  const dataConfigPath = path.join(__dirname, 'configs/data/animals.json');
  const gameConfigPath = path.join(__dirname, 'configs/games/beginner.json');

  const { dataConfig, gameConfig, validation } = await loadConfigs(
    dataConfigPath,
    gameConfigPath
  );

  console.log(`✅ Loaded: ${dataConfig.metadata.name}`);
  console.log(`✅ Game: ${gameConfig.metadata.game_name}`);
  console.log(`   Items: ${dataConfig.items.length}`);
  console.log(`   Features: ${dataConfig.feature_fields.map((f) => f.display_name).join(', ')}`);

  // Initialize game
  console.log('\n🎲 Initializing game...');
  let state = initializeGame(dataConfig, gameConfig);
  console.log(`   Starting with ${state.currentItems.length} items`);

  // Game loop
  let turnCount = 0;
  const maxTurns = 3; // Limit for demo

  console.log('\n🎯 Playing the game...');
  while (turnCount < maxTurns && state.availableFeatures.length > 0) {
    turnCount++;

    // Select a feature (for demo, use auto-selection)
    const feature = selectFeature(state, null, 'auto', 'entropy_based');
    console.log(`\n   Turn ${turnCount}: Selected feature "${feature}"`);

    // Execute turn
    const { newState, selection } = executeTurn(state, feature, dataConfig, gameConfig);

    console.log(`   → Spun and got: "${selection.selectedValue}"`);
    console.log(`   → Items remaining: ${newState.currentItems.length}`);

    // Show remaining items (if configured)
    if (gameConfig.turn_mechanics.show_remaining_items_list) {
      const itemNames = newState.currentItems.map((item) => item.name).join(', ');
      console.log(`   → Remaining items: ${itemNames}`);
    }

    state = newState;

    // Check if we should stop
    const status = getGameStatus(state, gameConfig);
    if (status.isComplete || status.mustGuess) {
      console.log('\n   ⚠️  Time to make a guess!');
      break;
    }
  }

  // Make a guess
  console.log('\n💭 Making a guess...');
  const itemNames = state.currentItems.map((item) => item.name);
  console.log(`   Guessing: ${itemNames.join(', ')}`);

  const guess = makeGuess(state, itemNames, dataConfig.identification_fields);
  console.log(`   ✓ Correct: ${guess.correct.join(', ')}`);
  if (guess.incorrect.length > 0) {
    console.log(`   ✗ Incorrect: ${guess.incorrect.join(', ')}`);
  }

  // Calculate final score
  console.log('\n🏆 Final Score:');
  const finalScore = calculateFinalScore(state, guess, gameConfig);
  console.log(`   Base Points: ${finalScore.basePoints}`);
  console.log(`   Bonus Points: ${finalScore.bonusPoints}`);
  console.log(`   Penalty Points: ${finalScore.penaltyPoints}`);
  console.log(`   Total Points: ${finalScore.totalPoints}`);
  console.log(`   Turns Used: ${finalScore.turnsUsed}`);
  console.log(`   Efficiency: ${finalScore.efficiency.toFixed(1)}%`);

  // Show analysis
  if (finalScore.analysis) {
    console.log('\n📊 Game Analysis:');
    console.log(
      `   Average Information Gain: ${finalScore.analysis.averageInformationGain.toFixed(2)}`
    );
    if (finalScore.analysis.bestFeatureSelection) {
      console.log(`   Best Selection: ${finalScore.analysis.bestFeatureSelection}`);
    }
    if (finalScore.analysis.suggestions.length > 0) {
      console.log('\n   💡 Suggestions:');
      finalScore.analysis.suggestions.forEach((s) => console.log(`      - ${s}`));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('🎉 Demo complete!\n');
}

// Run the demo
if (require.main === module) {
  runDemo().catch((error) => {
    console.error('Error running demo:', error);
    process.exit(1);
  });
}

export { runDemo };
