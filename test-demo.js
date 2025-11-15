/**
 * Simple demo to test the package
 */

const {
  loadConfigsSync,
  initializeGame,
  selectFeature,
  executeTurn,
  makeGuess,
  calculateFinalScore,
} = require('./dist/index');

const fs = require('fs');
const path = require('path');

// Load configs
const dataConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'examples/configs/data/animals.json'), 'utf-8')
);
const gameConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'examples/configs/games/beginner.json'), 'utf-8')
);

console.log('🎮 Feature Sleuth Demo\n');
console.log('='.repeat(50));

// Validate configs
console.log('\n📁 Loading configurations...');
const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
  dataConfig,
  gameConfig
);

console.log(`✅ Loaded: ${validatedData.metadata.name}`);
console.log(`✅ Game: ${validatedGame.metadata.game_name}`);
console.log(`   Items: ${validatedData.items.length}`);

// Initialize game
console.log('\n🎲 Initializing game...');
let state = initializeGame(validatedData, validatedGame);
console.log(`   Starting with ${state.currentItems.length} items`);

// Play a few turns
console.log('\n🎯 Playing the game...');
for (let i = 0; i < 3 && state.availableFeatures.length > 0; i++) {
  const feature = selectFeature(state, null, 'auto', 'entropy_based');
  console.log(`\n   Turn ${i + 1}: Selected feature "${feature}"`);

  const { newState, selection } = executeTurn(state, feature, validatedData, validatedGame);
  console.log(`   → Spun and got: "${selection.selectedValue}"`);
  console.log(`   → Items remaining: ${newState.currentItems.length}`);

  state = newState;

  if (state.currentItems.length === 1) {
    console.log('   ⚠️  Only one item left!');
    break;
  }
}

// Make a guess
console.log('\n💭 Making a guess...');
const itemNames = state.currentItems.map((item) => item.name);
console.log(`   Guessing: ${itemNames.join(', ')}`);

const guess = makeGuess(state, itemNames, validatedData.identification_fields);
console.log(`   ✓ Correct: ${guess.correct.join(', ')}`);

// Calculate final score
console.log('\n🏆 Final Score:');
const finalScore = calculateFinalScore(state, guess, validatedGame);
console.log(`   Total Points: ${finalScore.totalPoints}`);
console.log(`   Turns Used: ${finalScore.turnsUsed}`);
console.log(`   Efficiency: ${finalScore.efficiency.toFixed(1)}%`);

if (finalScore.analysis && finalScore.analysis.suggestions.length > 0) {
  console.log('\n   💡 Suggestions:');
  finalScore.analysis.suggestions.forEach((s) => console.log(`      - ${s}`));
}

console.log('\n' + '='.repeat(50));
console.log('🎉 Demo complete!\n');
