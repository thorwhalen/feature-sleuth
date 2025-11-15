# Web Interface for Feature Sleuth

This document explains how to use the web interface for Feature Sleuth.

## Quick Start

To play Feature Sleuth in your browser:

1. **Build the web interface:**
   ```bash
   npm install
   npm run build:web
   ```

2. **Serve the build directory:**
   ```bash
   npx serve -s build
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## How to Play

1. **Select a Dataset**: Choose from Animals, Countries, or Programming Languages
2. **Select Features**: Click on feature buttons to filter the dataset
3. **Random Selection**: The game will randomly select a value for that feature
4. **Narrow Down**: Continue selecting features until you can make a guess
5. **Make Your Guess**: Select the items you think match and submit
6. **View Results**: See your score, efficiency, and suggestions for improvement

## Features

- 🎮 **Interactive UI**: Beautiful, responsive interface
- 🎲 **Multiple Datasets**: Choose from various pre-configured datasets
- 🧮 **Auto-Selection**: Let the game choose the best feature based on entropy
- 📊 **Turn History**: Track all your moves
- 🏆 **Score Tracking**: See your performance metrics
- 💡 **Educational**: Learn about information theory and classification

## Development Mode

For development with hot-reloading:

```bash
npm run dev:web
```

This will start a development server at `http://localhost:3000`.

## Available Datasets

- **Animals**: Learn about animal habitats, diets, and characteristics
- **Countries**: Explore geographical and demographic data
- **Programming Languages**: Discover programming language features and history

## Technical Details

The web interface is built using:
- Vanilla JavaScript (ES6+)
- Webpack for bundling
- The Feature Sleuth game engine (TypeScript)

The build process:
1. Compiles TypeScript to JavaScript (`npm run build`)
2. Bundles the web interface with Webpack
3. Outputs to the `build/` directory
