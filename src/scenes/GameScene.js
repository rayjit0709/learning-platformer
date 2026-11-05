import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config/constants.js';
import { LEVEL_1 } from '../game/levelData.js';
import TouchControls from '../ui/TouchControls.js';
import { HEROES, chosenHero } from '../config/heroes.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    for (const hero of Object.values(HEROES)) this.load.image(hero.textureKey, hero.url);
  }

  create() {
    this.level = LEVEL_1;
    this.lastOnGround = 0; // time of the last frame on the ground
    this.lastJumpPressed = -1000; // time of the last jump press

    this.buildPlatforms();
    this.buildPlayer();
    this.buildControls();

    // The camera follows the player through a level wider than the screen.
    this.physics.world.setBounds(0, 0, this.level.width, GAME_HEIGHT * 2);
    this.cameras.main.setBounds(0, 0, this.level.width, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  buildPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    for (const p of this.level.platforms) {
      const block = this.add.rectangle(p.x, p.y, p.w, p.h, 0x5a9e4b).setStrokeStyle(3, 0x3b6e30);
      this.physics.add.existing(block, true); // true = static (never moves)
      this.platforms.add(block);
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

  buildControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,D,SPACE');
    this.touch = new TouchControls(this);
    this.jumpWasDown = false;
  }

  update(time) {
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

    // Fell into a gap: back to the start (lives come in M2)
    if (this.player.y > GAME_HEIGHT + 100) {
      this.player.setPosition(this.level.start.x, this.level.start.y);
      body.setVelocity(0, 0);
    }
  }
}
