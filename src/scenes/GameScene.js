import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER, GAME, QUIZ, FONT } from '../config/constants.js';
import { buildLevel, LEVEL_COUNT } from '../game/levelData.js';
import { THEMES, drawBackdrop, addStripeBorder } from '../game/backdrops.js';
import TouchControls from '../ui/TouchControls.js';
import { chosenHero } from '../config/heroes.js';
import Hud from '../ui/Hud.js';
import { showEndPanel } from '../ui/EndPanel.js';
import { showFactCard } from '../ui/FactCard.js';
import QuestionBanner from '../ui/QuestionBanner.js';
import QuestionStation from '../game/QuestionStation.js';
import { pickQuestions, prepareQuestion } from '../content/questions.js';
import { queueSubject, collectSubject, collectFacts } from '../content/contentLoader.js';
import { buildVocabQuestions } from '../content/vocabQuestions.js';
import { SUBJECTS, DEFAULT_SUBJECT, WORD_TIERS } from '../config/subjects.js';
import { saveStars, starsFor, isUnlocked, pickFact } from '../services/progress.js';
import { getSetting } from '../services/settings.js';
import { playWordAudio, stopWordAudio } from '../services/wordAudio.js';
import { t } from '../i18n/index.js';
import { startMusic } from '../services/music.js';
import { createMusicButton, createHomeButton } from '../ui/IconButtons.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  // Which level to play comes from the level-select screen: scene.start('GameScene', { level: 2 })
  init(data) {
    this.levelNumber = Math.min(Math.max(Number(data?.level) || 1, 1), LEVEL_COUNT);
  }

  preload() {
    // (character pictures, music and the content index are loaded by the start screen)
    this.subject = SUBJECTS[getSetting('subject')] || SUBJECTS[DEFAULT_SUBJECT];
    queueSubject(this, this.subject.id);
    queueSubject(this, 'culture'); // the "did you know" facts
  }

  create() {
    this.level = buildLevel(this.levelNumber);
    this.theme = THEMES[this.level.theme];
    drawBackdrop(this, this.level.theme, this.level.width);
    this.lastOnGround = 0; // time of the last frame on the ground
    this.lastJumpPressed = -1000; // time of the last jump press

    this.state = 'playing'; // 'playing' | 'won' | 'lost'
    this.score = 0;
    this.lives = GAME.lives;
    this.checkpoint = { ...this.level.start }; // where to restart after a fall
    this.spokenFor = null; // the station whose recording already played
    this.flashText = ''; // short message shown in the banner after a right answer
    this.flashUntil = 0;
    this.quizStats = { total: 0, firstTry: 0 };

    this.buildPlatforms();
    this.buildPlayer();
    this.buildStations();
    this.buildCoins();
    this.buildFlag();
    this.buildControls();
    this.hud = new Hud(this, GAME_WIDTH);
    this.hud.update(this.score, this.lives);
    this.banner = new QuestionBanner(this);
    this.add.text(20, 52, t('level.n', { n: this.levelNumber }), {
      fontFamily: FONT, fontSize: '22px', fontStyle: 'bold', color: '#ffffff', stroke: '#1a365d', strokeThickness: 4,
    }).setScrollFactor(0).setDepth(100);
    createMusicButton(this, GAME_WIDTH - 36, 92);
    createHomeButton(this, GAME_WIDTH - 96, 92, () => this.scene.start('LevelSelectScene'));
    startMusic(this);

    // The camera follows the player through a level wider than the screen.
    this.physics.world.setBounds(0, 0, this.level.width, GAME_HEIGHT * 2);
    this.cameras.main.setBounds(0, 0, this.level.width, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  buildPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    const [fill, outline] = this.theme.ground;
    for (const p of this.level.platforms) {
      const block = this.add.rectangle(p.x, p.y, p.w, p.h, fill).setStrokeStyle(3, outline);
      this.physics.add.existing(block, true); // true = static (never moves)
      this.platforms.add(block);
      // Striped temple border along the top of the ground and of the stones
      addStripeBorder(this, this.level.theme, p.x - p.w / 2, p.y - p.h / 2, p.w);
    }
  }

  buildPlayer() {
    const { start } = this.level;
    const hero = chosenHero();
    this.player = this.add.image(start.x, start.y, hero.textureKey).setScale(PLAYER.spriteScale);
    this.physics.add.existing(this.player);

    // Hitbox sizes below are in picture pixels (before scaling), so divide by the scale.
    const hitW = PLAYER.width / PLAYER.spriteScale;
    const hitH = PLAYER.height / PLAYER.spriteScale;
    const picW = this.player.width;
    const picH = this.player.height;
    this.player.body.setSize(hitW, hitH);
    this.player.body.setOffset((picW - hitW) / 2, picH - hitH - 8); // feet sit on the platform
    this.player.body.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);
  }

  // Question stations: blocks to jump into, one question each, taken from the JSON file.
  buildStations() {
    this.stations = [];
    this.contentError = false;
    const content = collectSubject(this, this.subject.id);
    // Questions written by hand, plus questions generated from vocabulary lists
    // Early levels only use the easiest words (unless that would leave too few words)
    const easy = content.entries.filter((e) => (WORD_TIERS[e.category] ?? 2) <= this.level.maxTier);
    const entries = easy.length >= 8 ? easy : content.entries;
    const pool = [...content.questions, ...buildVocabQuestions(entries, content.categories, content.audio)];
    if (pool.length === 0) {
      this.contentError = true; // the level stays playable, without questions
      return;
    }
    const raw = pickQuestions(pool, this.level.difficulties);
    this.level.stations.slice(0, raw.length).forEach((def, i) => {
      const station = new QuestionStation(this, def, prepareQuestion(raw[i]), this.level.flag.groundY);
      this.stations.push(station);
      // Hitting a block from below (head first) gives an answer
      this.physics.add.collider(this.player, station.blocks, (player, block) => {
        if (player.body.touching.up && player.y > block.y) station.hit(block);
      });
      if (station.gate) this.physics.add.collider(this.player, station.gate);
    });
    this.quizStats.total = this.stations.length;
  }

  // Called by a station when its question is answered correctly
  onQuestionSolved(station, block) {
    const firstTry = station.attempts === 0;
    const points = firstTry ? QUIZ.pointsFirstTry : QUIZ.pointsLater;
    this.score += points;
    if (firstTry) this.quizStats.firstTry += 1;
    this.hud.update(this.score, this.lives);
    this.checkpoint = { x: station.gateX + 80, y: 420 }; // a fall restarts after this gate
    this.flashText = t('q.correct');
    this.flashUntil = this.time.now + 1600;

    const popup = this.add.text(block.x, block.y - 60, `+${points}`, {
      fontFamily: FONT, fontSize: '36px', fontStyle: 'bold', color: '#fefcbf', stroke: '#744210', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: popup, y: popup.y - 60, alpha: 0, duration: 1200, onComplete: () => popup.destroy() });
  }

  // Shows the question of the station the player is near (or a message), else nothing
  refreshBanner() {
    if (this.contentError) {
      this.banner.show(t('error.content'), '', '#c05621');
      return;
    }
    if (this.time.now < this.flashUntil) {
      this.banner.show(this.flashText, '', '#2f855a');
      return;
    }
    const x = this.player.x;
    const active = this.stations.find((s) => !s.solved && s.containsX(x));
    if (!active) {
      this.banner.hide();
      this.spokenFor = null;
      return;
    }
    const audio = active.question.audio;
    this.banner.onSpeaker = () => playWordAudio(audio);
    this.banner.show(active.question.prompt, active.note, '#c05621', Boolean(audio));
    // The recording plays by itself the first time the question appears
    if (audio && this.spokenFor !== active) playWordAudio(audio);
    this.spokenFor = active;
  }

  buildCoins() {
    this.coins = this.physics.add.staticGroup();
    for (const c of this.level.coins) {
      const coin = this.add.circle(c.x, c.y, 13, 0xfbd34d).setStrokeStyle(3, 0xc58b0a);
      this.physics.add.existing(coin, true);
      this.coins.add(coin);
      // Spinning look: squeeze the coin sideways and back
      this.tweens.add({ targets: coin, scaleX: 0.25, duration: 450, yoyo: true, repeat: -1, delay: (c.x % 5) * 80 });
    }
    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
      this.score += GAME.coinPoints;
      this.hud.update(this.score, this.lives);
    });
  }

  buildFlag() {
    const { x, groundY } = this.level.flag;
    this.add.rectangle(x, groundY - 60, 8, 120, 0xe2e8f0).setStrokeStyle(2, 0x718096); // pole
    this.add.triangle(x + 4, groundY - 100, 0, 0, 0, 44, 56, 22, 0xe53e3e).setOrigin(0, 0).setStrokeStyle(2, 0x9b2c2c); // flag
    this.add.circle(x, groundY - 122, 8, 0xfbd34d); // golden top

    // Invisible zone around the flag that wins the level
    const zone = this.add.zone(x, groundY - 60, 60, 120);
    this.physics.add.existing(zone, true);
    this.physics.add.overlap(this.player, zone, () => this.endTry('won'));
  }

  // Called when the player falls into the gap
  loseLife() {
    this.lives -= 1;
    this.hud.update(this.score, this.lives);
    if (this.lives <= 0) {
      this.endTry('lost');
      return;
    }
    this.player.setPosition(this.checkpoint.x, this.checkpoint.y);
    this.player.body.setVelocity(0, 0);
    this.cameras.main.shake(150, 0.004);
  }

  // Ends the try (won or lost) and shows the panel. Restarting reloads the scene.
  endTry(kind) {
    if (this.state !== 'playing') return;
    this.state = kind;
    this.player.body.setVelocity(0, 0);
    this.player.body.enable = false; // freeze the character
    this.player.setAngle(0);
    const { total, firstTry } = this.quizStats;
    const quizLine = kind === 'won' && total > 0 ? t('win.quiz', { ok: firstTry, total }) : '';
    const stars = kind === 'won' ? starsFor(firstTry, total) : 0;
    if (kind === 'won') saveStars(this.subject.id, this.levelNumber, stars);
    this.banner.hide();
    stopWordAudio();
    const next = this.levelNumber + 1;
    const hasNext = kind === 'won' && next <= LEVEL_COUNT && isUnlocked(this.subject.id, next);
    const play = (level) => this.scene.start('GameScene', { level });
    const showPanel = () => showEndPanel(this, {
      kind, score: this.score, stars, extraLine: quizLine,
      onAgain: () => play(this.levelNumber),
      onNext: hasNext ? () => play(next) : null,
      onLevels: () => this.scene.start('LevelSelectScene'),
    });
    // After a win, first a "did you know" fact about Tamil culture, then the stars
    const fact = kind === 'won' ? pickFact(collectFacts(this), this.levelNumber) : null;
    if (fact) showFactCard(this, fact, this.level.theme, showPanel);
    else showPanel();
  }

  buildControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');
    this.touch = new TouchControls(this);
    this.jumpWasDown = false;
  }

  update(time) {
    if (this.state !== 'playing') return;
    this.refreshBanner();
    const body = this.player.body;
    const left = this.cursors.left.isDown || this.keys.A.isDown || this.touch.state.left;
    const right = this.cursors.right.isDown || this.keys.D.isDown || this.touch.state.right;
    const jumpDown = this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown || this.touch.state.jump;

    // Horizontal movement (the character turns to face where it goes)
    if (left && !right) { body.setVelocityX(-PLAYER.speed); this.player.setFlipX(true); }
    else if (right && !left) { body.setVelocityX(PLAYER.speed); this.player.setFlipX(false); }
    else body.setVelocityX(0);

    // Little side-to-side wobble while walking, so it feels alive
    const walking = body.blocked.down && body.velocity.x !== 0;
    this.player.setAngle(walking ? Math.sin(time / 70) * 4 : 0);

    // Jump: remember the press (buffer) and the last time on the ground (coyote)
    if (body.blocked.down) this.lastOnGround = time;
    if (jumpDown && !this.jumpWasDown) this.lastJumpPressed = time;
    this.jumpWasDown = jumpDown;

    const canJump = time - this.lastOnGround <= PLAYER.coyoteMs;
    const wantsJump = time - this.lastJumpPressed <= PLAYER.bufferMs;
    if (canJump && wantsJump) {
      body.setVelocityY(-PLAYER.jumpSpeed);
      this.lastOnGround = -1000;
      this.lastJumpPressed = -1000;
    }
    // Releasing jump early gives a shorter hop
    if (!jumpDown && body.velocity.y < -200) body.setVelocityY(-200);

    // Fell into a gap: lose a life and go back to the last checkpoint
    if (this.player.y > GAME_HEIGHT + 100) this.loseLife();
  }
}
