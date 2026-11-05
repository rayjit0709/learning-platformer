import Phaser from 'phaser';
import '@fontsource/noto-sans-tamil/tamil-400.css';
import '@fontsource/noto-sans-tamil/tamil-700.css';
import HomeScene from './scenes/HomeScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';

function startGame() {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#8fd3ff',
    roundPixels: true, // explicit: Phaser 4 changed the default to false
    scale: {
      mode: Phaser.Scale.FIT, // fills the screen, keeps the proportions
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 1200 }, debug: false },
    },
    input: { activePointers: 3 }, // allows holding "right" and tapping "jump" together
    scene: [HomeScene, LevelSelectScene, GameScene],
  });

  // Only in development: lets automated checks look inside the game.
  if (import.meta.env.DEV) window.__game = game;
}

// The game draws its text on a canvas, so the Tamil font must be ready before the first screen,
// otherwise Tamil letters would flash as empty boxes. If it is slow (3 s), start anyway.
const sample = 'நாய் தமிழ்';
const fontsReady = Promise.all([
  document.fonts.load('400 24px "Noto Sans Tamil"', sample),
  document.fonts.load('700 24px "Noto Sans Tamil"', sample),
]).catch(() => {});
Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 3000))]).then(startGame);
