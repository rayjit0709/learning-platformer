import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/constants.js';
import { SUBJECTS, DEFAULT_SUBJECT } from '../config/subjects.js';
import { getSetting, setSetting } from '../services/settings.js';
import { ACCENTS, chosenAccent, hasAccentVoices } from '../config/voices.js';
import { readIndex } from '../content/contentLoader.js';
import { getStars, isUnlocked } from '../services/progress.js';
import { LEVEL_COUNT } from '../game/levelData.js';
import { t } from '../i18n/index.js';
import { createMusicButton, createHomeButton } from '../ui/IconButtons.js';
import { drawStars } from '../ui/Stars.js';
import { THEMES, drawBackdrop, addStripeBorder } from '../game/backdrops.js';

const BUTTON = 140;
const GAP = 36;
const Y = 270;

// Second screen: pick a level. Locked levels open when the level before has enough stars.
export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    this.subject = SUBJECTS[getSetting('subject')] || SUBJECTS[DEFAULT_SUBJECT];
    drawBackdrop(this, 'village');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, THEMES.village.ground[0]).setStrokeStyle(3, THEMES.village.ground[1]);
    addStripeBorder(this, 'village', 0, GAME_HEIGHT - 40, GAME_WIDTH);
    this.add.text(GAME_WIDTH / 2, 56, t('level.title'), {
      fontFamily: FONT, fontSize: '46px', fontStyle: 'bold', color: '#ffffff', stroke: '#1a365d', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 112, t(this.subject.labelKey), {
      fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: '#7b341e',
    }).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, 440, 600, 40, 0xffffff, 0.75);
    this.add.text(GAME_WIDTH / 2, 440, t('level.hint'), { fontFamily: FONT, fontSize: '24px', color: '#1a365d' }).setOrigin(0.5);
    createMusicButton(this, GAME_WIDTH - 40, 40);
    createHomeButton(this, 40, 40, () => this.scene.start('HomeScene'));

    this.makeAccentChips();

    const total = LEVEL_COUNT * BUTTON + (LEVEL_COUNT - 1) * GAP;
    this.buttons = [];
    for (let n = 1; n <= LEVEL_COUNT; n += 1) {
      this.makeButton(n, GAME_WIDTH / 2 - total / 2 + BUTTON / 2 + (n - 1) * (BUTTON + GAP));
    }

    // Keyboard: arrows choose, Enter or Space plays. Starts on the first level not yet won.
    this.index = Math.max(0, this.buttons.findIndex((b) => b.open && getStars(this.subject.id, b.n) < 2));
    if (this.index < 0 || this.buttons[this.index] === undefined) this.index = 0;
    this.refreshFocus();
    this.input.keyboard.on('keydown-LEFT', () => this.move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this.move(1));
    this.input.keyboard.on('keydown-ENTER', () => this.start(this.buttons[this.index]));
    this.input.keyboard.on('keydown-SPACE', () => this.start(this.buttons[this.index]));
  }

  // Tamil only: choose the accent of the spoken words (shown once generated voices exist)
  makeAccentChips() {
    if (this.subject.id !== 'tamil' || !hasAccentVoices(readIndex(this).audio)) return;
    const chosen = chosenAccent();
    ACCENTS.forEach((accent, i) => {
      const x = GAME_WIDTH / 2 + (i === 0 ? -125 : 125);
      const on = accent.id === chosen;
      const chip = this.add.rectangle(x, 172, 230, 44, on ? 0xdd6b20 : 0xffffff, on ? 1 : 0.92)
        .setStrokeStyle(4, 0x7b341e).setInteractive({ useHandCursor: true });
      this.add.text(x, 172, t(accent.labelKey), {
        fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: on ? '#ffffff' : '#7b341e',
      }).setOrigin(0.5);
      chip.on('pointerup', () => {
        if (accent.id === chosenAccent()) return;
        setSetting('accent', accent.id);
        this.scene.restart();
      });
    });
  }

  makeButton(n, x) {
    const open = isUnlocked(this.subject.id, n);
    const frame = this.add.rectangle(x, Y, BUTTON, BUTTON, open ? 0xffffff : 0xa0aec0, open ? 0.95 : 0.8)
      .setStrokeStyle(6, open ? 0x2b6cb0 : 0x718096);
    const item = { n, open, frame };
    if (open) {
      this.add.text(x, Y - 22, String(n), { fontFamily: FONT, fontSize: '64px', fontStyle: 'bold', color: '#2b6cb0' }).setOrigin(0.5);
      drawStars(this, x, Y + 44, getStars(this.subject.id, n), 17, 5, false);
      frame.setInteractive({ useHandCursor: true });
      frame.on('pointerup', () => this.start(item));
    } else {
      this.drawLock(x, Y - 6);
      this.add.text(x, Y + 48, t('level.locked'), { fontFamily: FONT, fontSize: '20px', color: '#4a5568' }).setOrigin(0.5);
    }
    this.buttons.push(item);
  }

  // A padlock drawn with shapes: body plus a loop
  drawLock(x, y) {
    const g = this.add.graphics({ lineStyle: { width: 8, color: 0x4a5568 } });
    g.beginPath();
    g.arc(x, y - 14, 17, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
    g.strokePath();
    this.add.rectangle(x, y + 10, 52, 40, 0x4a5568).setStrokeStyle(3, 0x2d3748);
    this.add.circle(x, y + 8, 6, 0xe2e8f0);
  }

  move(step) {
    let i = this.index;
    do { i += step; } while (i >= 0 && i < this.buttons.length && !this.buttons[i].open);
    if (i >= 0 && i < this.buttons.length) {
      this.index = i;
      this.refreshFocus();
    }
  }

  refreshFocus() {
    this.buttons.forEach((b, i) => {
      if (b.open) b.frame.setStrokeStyle(i === this.index ? 10 : 6, i === this.index ? 0x38a169 : 0x2b6cb0);
    });
  }

  start(item) {
    if (!item || !item.open) return;
    this.scene.start('GameScene', { level: item.n });
  }
}
