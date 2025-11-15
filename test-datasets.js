/**
 * Test all example datasets
 */

const { loadConfigsSync, initializeGame, executeTurn, selectFeature } = require('./dist/index');
const fs = require('fs');
const path = require('path');

// List of datasets to test
const datasets = [
  'animals',
  'countries',
  'us_states',
  'programming_languages',
  'movies',
  'musical_instruments'
];

// Load beginner game config
const gameConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'examples/configs/games/beginner.json'), 'utf-8')
);

console.log('🧪 Testing All Datasets\n');
console.log('='.repeat(60));

let allPassed = true;

for (const dataset of datasets) {
  const dataPath = path.join(__dirname, `examples/configs/data/${dataset}.json`);

  try {
    // Load dataset
    const dataConfig = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`\n📊 Testing: ${dataConfig.metadata.name}`);
    console.log(`   Items: ${dataConfig.items.length}`);
    console.log(`   Features: ${dataConfig.feature_fields.length}`);

    // Validate configs
    const gameConfigCopy = {
      ...gameConfig,
      feature_selection: {
        ...gameConfig.feature_selection,
        available_features: dataConfig.feature_fields.map(f => f.name)
      }
    };

    const { dataConfig: validatedData, gameConfig: validatedGame } = loadConfigsSync(
      dataConfig,
      gameConfigCopy
    );

    console.log(`   ✅ Configuration valid`);

    // Initialize game
    const state = initializeGame(validatedData, validatedGame);
    console.log(`   ✅ Game initialized (${state.currentItems.length} items)`);

    // Test a turn
    const feature = selectFeature(state, null, 'auto', 'entropy_based');
    console.log(`   ✅ Feature selection works (selected: ${feature})`);

    const { newState, selection } = executeTurn(state, feature, validatedData, validatedGame);
    console.log(`   ✅ Turn executed (${selection.selectedValue} → ${newState.currentItems.length} items)`);

    // Test numerical bucketing if present
    const numericalFeatures = dataConfig.feature_fields.filter(f => f.type === 'numerical');
    if (numericalFeatures.length > 0) {
      console.log(`   ✅ Has ${numericalFeatures.length} numerical feature(s) with bucketing`);
    }

    console.log(`   ✅ ${dataset.toUpperCase()} PASSED`);

  } catch (error) {
    console.log(`   ❌ ${dataset.toUpperCase()} FAILED: ${error.message}`);
    allPassed = false;
  }
}

console.log('\n' + '='.repeat(60));
if (allPassed) {
  console.log('✅ All datasets passed!\n');
  process.exit(0);
} else {
  console.log('❌ Some datasets failed\n');
  process.exit(1);
}
