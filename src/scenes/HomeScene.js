import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FONT } from '../config/constants.js';
import { HEROES, chosenHero } from '../config/heroes.js';
import { MUSIC_KEY, MUSIC_URL, startMusic } from '../services/music.js';
import { getSetting, setSetting } from '../services/settings.js';
import { currentLang, t } from '../i18n/index.js';
import { createMusicButton } from '../ui/IconButtons.js';
import { INDEX_URL, QUESTIONS_INDEX_KEY } from '../config/content.js';
import { SUBJECTS, DEFAULT_SUBJECT } from '../config/subjects.js';
import { THEMES, drawBackdrop, addStripeBorder } from '../game/backdrops.js';

const CARD_Y = 332;
const CARD_X = { boy: 345, girl: 615 };

// First screen: choose the character, the language, then press Play.
// (Profiles, level and subject pickers are added here in the next milestone.)
export default class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  preload() {
    for (const hero of Object.values(HEROES)) this.load.image(hero.textureKey, hero.url);
    this.load.audio(MUSIC_KEY, MUSIC_URL);
    this.load.json(QUESTIONS_INDEX_KEY, INDEX_URL); // the list of content files (see scripts/build-content-index.js)
  }

  create() {
    drawBackdrop(this, 'temple');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 20, GAME_WIDTH, 40, THEMES.temple.ground[0]).setStrokeStyle(3, THEMES.temple.ground[1]);
    addStripeBorder(this, 'temple', 0, GAME_HEIGHT - 40, GAME_WIDTH);

    this.add.text(GAME_WIDTH / 2, 52, t('home.title'), {
      fontFamily: FONT, fontSize: '48px', fontStyle: 'bold', color: '#ffffff', stroke: '#1a365d', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(GAME_WIDTH / 2, 172, t('home.choose'), {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#1a365d',
    }).setOrigin(0.5);

    this.selected = chosenHero().id;
    this.cards = {};
    for (const hero of Object.values(HEROES)) this.makeCard(hero);
    this.makeSubjectChips();
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

  // Which subject to play: Tamil or Maths
  makeSubjectChips() {
    const chosen = getSetting('subject') in SUBJECTS ? getSetting('subject') : DEFAULT_SUBJECT;
    Object.values(SUBJECTS).forEach((subject, i) => {
      const x = GAME_WIDTH / 2 + (i === 0 ? -120 : 120);
      const on = subject.id === chosen;
      const chip = this.add.rectangle(x, 116, 210, 52, on ? 0xdd6b20 : 0xffffff, on ? 1 : 0.9)
        .setStrokeStyle(4, 0x7b341e).setInteractive({ useHandCursor: true });
      this.add.text(x, 116, t(subject.labelKey), {
        fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: on ? '#ffffff' : '#7b341e',
      }).setOrigin(0.5);
      chip.on('pointerup', () => {
        if (subject.id === getSetting('subject')) return;
        setSetting('subject', subject.id);
        this.scene.restart();
      });
    });
  }

  makeCard(hero) {
    const x = CARD_X[hero.id];
    const frame = this.add.rectangle(x, CARD_Y, 220, 240, 0xffffff, 0.92).setStrokeStyle(6, 0xcbd5e0)
      .setInteractive({ useHandCursor: true });
    const picture = this.add.image(x, CARD_Y - 14, hero.textureKey).setScale(0.5);
    const label = this.add.text(x, CARD_Y + 96, t(`hero.${hero.id}`), {
      fontFamily: FONT, fontSize: '26px', fontStyle: 'bold', color: '#2d3748',
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
      this.tweens.add({ targets: card.picture, scale: on ? 0.55 : 0.45, duration: 150 });
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
    this.scene.start('LevelSelectScene');
  }
}
