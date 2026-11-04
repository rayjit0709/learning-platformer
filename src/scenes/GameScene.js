import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER } from '../config/constants.js';
import { LEVEL_1 } from '../game/levelData.js';
import TouchControls from '../ui/TouchControls.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
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
    this.player = this.add.rectangle(start.x, start.y, PLAYER.width, PLAYER.height, 0xf6ad55)
      .setStrokeStyle(3, 0xc05621);
    this.physics.add.existing(this.player);
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

    // Horizontal movement
    if (left && !right) body.setVelocityX(-PLAYER.speed);
    else if (right && !left) body.setVelocityX(PLAYER.speed);
    else body.setVelocityX(0);

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
