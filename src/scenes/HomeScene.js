import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/constants.js';
import { HEROES, chosenHero } from '../config/heroes.js';
import { MUSIC_KEY, MUSIC_URL, startMusic } from '../services/music.js';
import { getSetting, setSetting } from '../services/settings.js';
import { currentLang, t } from '../i18n/index.js';
import { createMusicButton } from '../ui/IconButtons.js';

const CARD_Y = 298;
const CARD_X = { boy: 330, girl: 630 };

// First screen: choose the character, the language, then press Play.
// (Profiles, level and subject pickers are added here in the next milestone.)
export default class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  preload() {
    for (const hero of Object.values(HEROES)) this.load.image(hero.textureKey, hero.url);
    this.load.audio(MUSIC_KEY, MUSIC_URL);
  }

  create() {
    this.cameras.main.setBackgroundColor('#8fd3ff');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, 0x5a9e4b).setStrokeStyle(3, 0x3b6e30);

    this.add.text(GAME_WIDTH / 2, 62, t('home.title'), {
      fontFamily: FONT, fontSize: '54px', fontStyle: 'bold', color: '#ffffff', stroke: '#1a365d', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 122, t('home.choose'), {
      fontFamily: FONT, fontSize: '30px', fontStyle: 'bold', color: '#1a365d',
    }).setOrigin(0.5);

    this.selected = chosenHero().id;
    this.cards = {};
    for (const hero of Object.values(HEROES)) this.makeCard(hero);
    this.makeLanguageButtons();
    this.makePlayButton();
    createMusicButton(this, 40, 40);

    this.refreshSelection();
    startMusic(this);

    // Keyboard: arrows choose, Enter or Space plays
    this.input.keyboard.on('keydown-LEFT', () => this.select('boy'));
    this.input.keyboard.on('keydown-RIGHT', () => this.select('girl'));
    this.input.keyboard.on('keydown-ENTER', () => this.play());
    this.input.keyboard.on('keydown-SPACE', () => this.play());
  }

  makeCard(hero) {
    const x = CARD_X[hero.id];
    const frame = this.add.rectangle(x, CARD_Y, 230, 290, 0xffffff, 0.92).setStrokeStyle(6, 0xcbd5e0)
      .setInteractive({ useHandCursor: true });
    const picture = this.add.image(x, CARD_Y - 15, hero.textureKey).setScale(0.55);
    const label = this.add.text(x, CARD_Y + 118, t(`hero.${hero.id}`), {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#2d3748',
    }).setOrigin(0.5);
    frame.on('pointerup', () => this.select(hero.id));
    this.cards[hero.id] = { frame, picture, label };
  }

  select(id) {
    this.selected = id;
    setSetting('hero', id);
    this.refreshSelection();
  }

  refreshSelection() {
    for (const [id, card] of Object.entries(this.cards)) {
      const on = id === this.selected;
      card.frame.setStrokeStyle(on ? 10 : 6, on ? 0x38a169 : 0xcbd5e0);
      this.tweens.add({ targets: card.picture, scale: on ? 0.6 : 0.5, duration: 150 });
    }
  }

  makeLanguageButtons() {
    const lang = currentLang();
    [['fr', 'FR', GAME_WIDTH - 110], ['en', 'EN', GAME_WIDTH - 50]].forEach(([code, text, x]) => {
      const on = code === lang;
      const button = this.add.rectangle(x, 40, 54, 44, on ? 0x2b6cb0 : 0xffffff, on ? 1 : 0.85)
        .setStrokeStyle(3, 0x1a365d).setInteractive({ useHandCursor: true });
      this.add.text(x, 40, text, { fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: on ? '#ffffff' : '#1a365d' })
        .setOrigin(0.5);
      button.on('pointerup', () => {
        if (code === currentLang()) return;
        setSetting('lang', code);
        this.scene.restart(); // redraw the texts in the new language
      });
    });
  }

  makePlayButton() {
    const button = this.add.rectangle(GAME_WIDTH / 2, 494, 320, 70, 0x2b6cb0)
      .setStrokeStyle(5, 0x1a365d).setInteractive({ useHandCursor: true });
    this.add.text(GAME_WIDTH / 2, 494, t('home.play'), {
      fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerup', () => this.play());
  }

  play() {
    this.scene.start('GameScene');
  }
}
