import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

const BUTTON_SIZE = 96;
const MARGIN = 24;

// Big on-screen buttons: left, right (bottom-left) and jump (bottom-right).
// Shown on touch devices, or anywhere with ?touch=1 in the address.
export default class TouchControls {
  constructor(scene) {
    this.state = { left: false, right: false, jump: false };
    this.enabled = scene.sys.game.device.input.touch || new URLSearchParams(location.search).has('touch');
    if (!this.enabled) return;

    const y = GAME_HEIGHT - MARGIN - BUTTON_SIZE / 2;
    this.makeButton(scene, MARGIN + BUTTON_SIZE / 2, y, '◀', 'left');
    this.makeButton(scene, MARGIN * 2 + BUTTON_SIZE * 1.5, y, '▶', 'right');
    this.makeButton(scene, GAME_WIDTH - MARGIN - BUTTON_SIZE / 2, y, '▲', 'jump');
  }

  makeButton(scene, x, y, label, key) {
    const bg = scene.add.circle(x, y, BUTTON_SIZE / 2, 0x000000, 0.3)
      .setStrokeStyle(4, 0xffffff, 0.8)
      .setScrollFactor(0)
      .setDepth(100)
      .setInteractive();
    scene.add.text(x, y, label, { fontSize: '44px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    const press = () => { this.state[key] = true; bg.setFillStyle(0xffffff, 0.45); };
    const release = () => { this.state[key] = false; bg.setFillStyle(0x000000, 0.3); };
    bg.on('pointerdown', press);
    bg.on('pointerup', release);
    bg.on('pointerout', release);
  }
}
