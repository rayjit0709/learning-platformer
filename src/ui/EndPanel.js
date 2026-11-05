import { GAME_WIDTH, GAME_HEIGHT, GAME, FONT } from '../config/constants.js';
import { t } from '../i18n/index.js';
import { drawStars } from './Stars.js';

// Full-screen message at the end of a try: "won" (with stars) or "lost", plus buttons:
// Levels, play again and, when the next level is open, Next level.
// Space / Enter does the main action: next level if offered, otherwise play again.
export function showEndPanel(scene, { kind, score, stars, extraLine, onAgain, onNext, onLevels }) {
  const won = kind === 'won';
  const cx = GAME_WIDTH / 2;
  scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45)
    .setScrollFactor(0).setDepth(200);
  scene.add.rectangle(cx, GAME_HEIGHT / 2, 680, 380, 0xffffff, 1)
    .setStrokeStyle(6, won ? 0x38a169 : 0xdd6b20).setScrollFactor(0).setDepth(201);

  const text = (y, str, style) => scene.add.text(cx, y, str, { fontFamily: FONT, ...style })
    .setOrigin(0.5).setScrollFactor(0).setDepth(202);
  text(120, t(`${won ? 'win' : 'lose'}.title`), { fontSize: '52px', fontStyle: 'bold', color: won ? '#2f855a' : '#c05621' });
  text(176, t(`${won ? 'win' : 'lose'}.score`, { score }), { fontSize: '30px', color: '#2d3748' });
  if (won) {
    drawStars(scene, cx, 238, stars, 28);
    if (extraLine) text(288, extraLine, { fontSize: '24px', color: '#2f855a' });
    if (stars < 3) {
      // Say why the next level did not open (needs 2 stars), otherwise just how many stars
      const note = onNext || stars >= 2 ? t('win.stars', { n: stars }) : `${t('win.stars', { n: stars })} · ${t('level.hint')}`;
      text(318, note, { fontSize: '19px', color: '#c05621' });
    }
  }

  // Buttons side by side; the main one is blue, the others lighter
  const buttons = [
    { label: t(won ? 'win.levels' : 'lose.levels'), action: onLevels, main: false },
    { label: t(won ? 'win.again' : 'lose.again'), action: onAgain, main: !onNext },
  ];
  if (onNext) buttons.push({ label: t('win.next'), action: onNext, main: true });
  const width = 190;
  const gap = 20;
  const total = buttons.length * width + (buttons.length - 1) * gap;
  const mainAction = (buttons.find((b) => b.main) || buttons[1]).action;
  const objects = buttons.map((b, i) => {
    const x = cx - total / 2 + width / 2 + i * (width + gap);
    const rect = scene.add.rectangle(x, 372, width, 70, b.main ? 0x2b6cb0 : 0x718096)
      .setStrokeStyle(4, b.main ? 0x1a365d : 0x4a5568).setScrollFactor(0).setDepth(202);
    scene.add.text(x, 372, b.label, {
      fontFamily: FONT, fontSize: b.label.length > 12 ? '22px' : '28px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(203);
    return { rect, action: b.action };
  });
  text(436, t('panel.hint'), { fontSize: '18px', color: '#718096' });

  // A short pause so a finger still holding "jump" does not trigger a button instantly.
  scene.time.delayedCall(GAME.restartDelayMs, () => {
    for (const { rect, action } of objects) {
      rect.setInteractive({ useHandCursor: true });
      rect.on('pointerup', action);
    }
    scene.input.keyboard.once('keydown-SPACE', mainAction);
    scene.input.keyboard.once('keydown-ENTER', mainAction);
  });
}
