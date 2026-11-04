import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants.js';

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
  scene: [GameScene],
});

// Only in development: lets automated checks look inside the game.
if (import.meta.env.DEV) window.__game = game;
