import { GAME, FONT } from '../config/constants.js';
import { t } from '../i18n/index.js';

const STYLE = { fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: '#ffffff', stroke: '#1a365d', strokeThickness: 5 };

// Score (top left) and hearts for the remaining lives (top right).
export default class Hud {
  constructor(scene, width) {
    this.scoreText = scene.add.text(20, 14, '', STYLE).setScrollFactor(0).setDepth(100);
    this.heartsText = scene.add.text(width - 20, 14, '', { ...STYLE, color: '#ff6b81' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(100);
  }

  update(score, lives) {
    this.scoreText.setText(t('hud.score', { score }));
    // Full hearts for lives left, hollow ones for lives lost
    this.heartsText.setText('♥ '.repeat(lives) + '♡ '.repeat(GAME.lives - lives));
  }
}
