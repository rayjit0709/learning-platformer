import { GAME_WIDTH, GAME_HEIGHT, GAME, FONT } from '../config/constants.js';
import { t } from '../i18n/index.js';

// Full-screen message at the end of a try: "won" or "lost", plus a button to play again.
// Pressing Space/Enter or touching the button calls onRestart.
export function showEndPanel(scene, kind, score, onRestart) {
  const cx = GAME_WIDTH / 2;
  scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45)
    .setScrollFactor(0).setDepth(200);
  scene.add.rectangle(cx, GAME_HEIGHT / 2, 560, 330, 0xffffff, 1)
    .setStrokeStyle(6, kind === 'won' ? 0x38a169 : 0xdd6b20).setScrollFactor(0).setDepth(201);

  scene.add.text(cx, 175, t(`${kind === 'won' ? 'win' : 'lose'}.title`), {
    fontFamily: FONT, fontSize: '56px', fontStyle: 'bold', color: kind === 'won' ? '#2f855a' : '#c05621',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(202);
  scene.add.text(cx, 245, t(`${kind === 'won' ? 'win' : 'lose'}.score`, { score }), {
    fontFamily: FONT, fontSize: '32px', color: '#2d3748',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(202);

  const button = scene.add.rectangle(cx, 330, 300, 80, 0x2b6cb0).setStrokeStyle(4, 0x1a365d)
    .setScrollFactor(0).setDepth(202).setInteractive({ useHandCursor: true });
  scene.add.text(cx, 330, t(`${kind === 'won' ? 'win' : 'lose'}.again`), {
    fontFamily: FONT, fontSize: '36px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
  scene.add.text(cx, 400, t('panel.hint'), { fontFamily: FONT, fontSize: '20px', color: '#718096' })
    .setOrigin(0.5).setScrollFactor(0).setDepth(202);

  // A short pause so a finger still holding "jump" does not restart instantly.
  // Only after the pause does the panel react to keys or touch.
  scene.time.delayedCall(GAME.restartDelayMs, () => {
    button.on('pointerup', onRestart);
    scene.input.keyboard.once('keydown-SPACE', onRestart);
    scene.input.keyboard.once('keydown-ENTER', onRestart);
  });
}
