// Import game engine functions
import {
  loadConfigsSync,
  initializeGame,
  selectFeature,
  executeTurn,
  makeGuess,
  calculateFinalScore,
  getGameStatus
} from '../dist/index.js';

// Dataset configurations
import animalsData from '../examples/configs/data/animals.json';
import countriesData from '../examples/configs/data/countries.json';
import programmingData from '../examples/configs/data/programming_languages.json';
import gameConfig from '../examples/configs/games/beginner.json';

const DATASETS = {
  animals: { data: animalsData, name: 'Animals', icon: '🦁' },
  countries: { data: countriesData, name: 'Countries', icon: '🌍' },
  programming: { data: programmingData, name: 'Programming Languages', icon: '💻' }
};

// Game state
let gameState = null;
let currentDataConfig = null;
let currentGameConfig = null;
let selectedGuesses = new Set();
let turnHistory = [];

// UI Elements
const gameSetup = document.getElementById('gameSetup');
const gameBoard = document.getElementById('gameBoard');
const gameOver = document.getElementById('gameOver');
const gameName = document.getElementById('gameName');
const gameDescription = document.getElementById('gameDescription');
const turnsUsed = document.getElementById('turnsUsed');
const itemsRemaining = document.getElementById('itemsRemaining');
const currentScore = document.getElementById('currentScore');
const featureButtons = document.getElementById('featureButtons');
const autoSelectBtn = document.getElementById('autoSelectBtn');
const selectionResult = document.getElementById('selectionResult');
const selectedFeature = document.getElementById('selectedFeature');
const selectedValue = document.getElementById('selectedValue');
const itemsList = document.getElementById('itemsList');
const guessOptions = document.getElementById('guessOptions');
const submitGuessBtn = document.getElementById('submitGuessBtn');
const newGameBtn = document.getElementById('newGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const finalPoints = document.getElementById('finalPoints');
const finalTurns = document.getElementById('finalTurns');
const finalEfficiency = document.getElementById('finalEfficiency');
const correctGuesses = document.getElementById('correctGuesses');
const suggestions = document.getElementById('suggestions');
const historyList = document.getElementById('historyList');

// Event listeners
document.querySelectorAll('.dataset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const datasetKey = btn.dataset.dataset;
    if (DATASETS[datasetKey]) {
      startGame(datasetKey);
    }
  });
});

autoSelectBtn.addEventListener('click', () => {
  autoSelectFeature();
});

submitGuessBtn.addEventListener('click', () => {
  submitGuess();
});

newGameBtn.addEventListener('click', () => {
  resetToSetup();
});

playAgainBtn.addEventListener('click', () => {
  resetToSetup();
});

// Game functions
function startGame(datasetKey) {
  const dataset = DATASETS[datasetKey];

  try {
    // Load and validate configs
    const { dataConfig, gameConfig: validatedGameConfig } = loadConfigsSync(
      dataset.data,
      gameConfig
    );

    currentDataConfig = dataConfig;
    currentGameConfig = validatedGameConfig;

    // Initialize game state
    gameState = initializeGame(currentDataConfig, currentGameConfig);
    selectedGuesses.clear();
    turnHistory = [];

    // Update UI
    gameName.textContent = currentGameConfig.metadata.game_name;
    gameDescription.textContent = currentDataConfig.metadata.description;

    gameSetup.classList.add('hidden');
    gameBoard.classList.remove('hidden');

    updateGameDisplay();
  } catch (error) {
    console.error('Error starting game:', error);
    alert('Error starting game: ' + error.message);
  }
}

function updateGameDisplay() {
  // Update stats
  turnsUsed.textContent = gameState.turnsUsed || 0;
  itemsRemaining.textContent = gameState.currentItems.length;
  currentScore.textContent = '0'; // Score calculated at end

  // Update feature buttons
  featureButtons.innerHTML = '';
  gameState.availableFeatures.forEach(feature => {
    const featureField = currentDataConfig.feature_fields.find(f => f.name === feature);
    const btn = document.createElement('button');
    btn.className = 'feature-btn';
    btn.textContent = featureField ? featureField.display_name : feature;
    btn.addEventListener('click', () => selectAndExecuteTurn(feature));
    featureButtons.appendChild(btn);
  });

  // Update items list
  updateItemsList();

  // Update guess options
  updateGuessOptions();

  // Check game status
  const status = getGameStatus(gameState, currentGameConfig);
  if (status.mustGuess || status.itemsRemaining === 1) {
    showGuessSection();
  }
}

function updateItemsList() {
  itemsList.innerHTML = '';

  gameState.currentItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'item-name';
    nameDiv.textContent = item[currentDataConfig.identification_fields[0]];

    const featuresDiv = document.createElement('div');
    featuresDiv.className = 'item-features';

    // Show some key features
    const keyFeatures = Object.entries(item)
      .filter(([key]) => !currentDataConfig.identification_fields.includes(key))
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    featuresDiv.textContent = keyFeatures;

    card.appendChild(nameDiv);
    card.appendChild(featuresDiv);
    itemsList.appendChild(card);
  });
}

function updateGuessOptions() {
  guessOptions.innerHTML = '';
  selectedGuesses.clear();

  gameState.currentItems.forEach(item => {
    const label = document.createElement('label');
    label.className = 'guess-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    const itemName = item[currentDataConfig.identification_fields[0]];
    checkbox.value = itemName;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedGuesses.add(itemName);
      } else {
        selectedGuesses.delete(itemName);
      }
      submitGuessBtn.classList.toggle('hidden', selectedGuesses.size === 0);
    });

    const span = document.createElement('span');
    span.textContent = itemName;

    label.appendChild(checkbox);
    label.appendChild(span);
    guessOptions.appendChild(label);
  });
}

function selectAndExecuteTurn(feature) {
  try {
    // Execute turn
    const { newState, selection } = executeTurn(
      gameState,
      feature,
      currentDataConfig,
      currentGameConfig
    );

    gameState = newState;

    // Show selection result
    const featureField = currentDataConfig.feature_fields.find(f => f.name === feature);
    selectedFeature.textContent = featureField ? featureField.display_name : feature;
    selectedValue.textContent = selection.selectedValue;
    selectionResult.classList.remove('hidden');

    // Add to history
    addToHistory(feature, selection.selectedValue, gameState.currentItems.length);

    // Update display
    updateGameDisplay();

    // Hide selection result after a delay
    setTimeout(() => {
      selectionResult.classList.add('hidden');
    }, 3000);
  } catch (error) {
    console.error('Error executing turn:', error);
    alert('Error executing turn: ' + error.message);
  }
}

function autoSelectFeature() {
  try {
    const feature = selectFeature(gameState, null, 'auto', 'entropy_based');
    selectAndExecuteTurn(feature);
  } catch (error) {
    console.error('Error auto-selecting feature:', error);
    alert('Error auto-selecting feature: ' + error.message);
  }
}

function showGuessSection() {
  submitGuessBtn.classList.remove('hidden');
}

function submitGuess() {
  if (selectedGuesses.size === 0) {
    alert('Please select at least one item to guess!');
    return;
  }

  try {
    const guessedNames = Array.from(selectedGuesses);
    const guess = makeGuess(
      gameState,
      guessedNames,
      currentDataConfig.identification_fields
    );

    // Calculate final score
    const finalScore = calculateFinalScore(gameState, guess, currentGameConfig);

    // Show results
    showGameOver(finalScore, guess);
  } catch (error) {
    console.error('Error submitting guess:', error);
    alert('Error submitting guess: ' + error.message);
  }
}

function showGameOver(finalScore, guess) {
  finalPoints.textContent = finalScore.totalPoints;
  finalTurns.textContent = finalScore.turnsUsed;
  finalEfficiency.textContent = finalScore.efficiency.toFixed(1) + '%';

  // Show correct guesses
  if (guess.correct.length > 0) {
    correctGuesses.innerHTML = '<h4>Correct Guesses:</h4><p>' +
      guess.correct.join(', ') + '</p>';
  } else {
    correctGuesses.innerHTML = '<h4>No correct guesses</h4>';
  }

  // Show suggestions
  if (finalScore.analysis && finalScore.analysis.suggestions.length > 0) {
    suggestions.innerHTML = '<h4>Suggestions for next time:</h4><ul>' +
      finalScore.analysis.suggestions.map(s => '<li>' + s + '</li>').join('') +
      '</ul>';
  } else {
    suggestions.innerHTML = '';
  }

  gameOver.classList.remove('hidden');
}

function addToHistory(feature, value, remainingItems) {
  const featureField = currentDataConfig.feature_fields.find(f => f.name === feature);
  const displayFeature = featureField ? featureField.display_name : feature;

  const historyItem = document.createElement('div');
  historyItem.className = 'history-item';
  historyItem.textContent = `Turn ${turnHistory.length + 1}: ${displayFeature} = ${value} → ${remainingItems} items remaining`;

  historyList.appendChild(historyItem);
  turnHistory.push({ feature, value, remainingItems });
}

function resetToSetup() {
  gameState = null;
  currentDataConfig = null;
  currentGameConfig = null;
  selectedGuesses.clear();
  turnHistory = [];

  gameBoard.classList.add('hidden');
  gameOver.classList.add('hidden');
  gameSetup.classList.remove('hidden');

  historyList.innerHTML = '';
}

// Initialize
console.log('Feature Sleuth Web Interface loaded');
