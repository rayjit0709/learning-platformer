import { GAME_WIDTH, GAME_HEIGHT, GAME, FONT } from '../config/constants.js';
import { t, localized } from '../i18n/index.js';
import { addStripeBorder } from '../game/backdrops.js';

// "Did you know?" card shown when a level is won, before the stars panel.
// Space / Enter or the button calls onDone.
export function showFactCard(scene, fact, themeKey, onDone) {
  const cx = GAME_WIDTH / 2;
  const fixed = (obj, depth) => obj.setScrollFactor(0).setDepth(depth);
  fixed(scene.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45), 200);
  fixed(scene.add.rectangle(cx, GAME_HEIGHT / 2, 780, 440, 0xfffaf0, 1).setStrokeStyle(6, 0xb7791f), 201);
  fixed(addStripeBorder(scene, themeKey, cx - 390, 50, 780), 202); // temple-style border on the top edge

  fixed(scene.add.text(cx, 100, t('fact.title'), {
    fontFamily: FONT, fontSize: '38px', fontStyle: 'bold', color: '#b7791f',
  }).setOrigin(0.5), 202);
  fixed(scene.add.text(cx, 140, localized({ fr: fact.fr, en: fact.en }), {
    fontFamily: FONT, fontSize: '25px', color: '#2d3748', align: 'center', lineSpacing: 8,
    wordWrap: { width: 700 },
  }).setOrigin(0.5, 0), 202);

  const button = fixed(scene.add.rectangle(cx, 452, 260, 56, 0x2b6cb0).setStrokeStyle(4, 0x1a365d), 202);
  fixed(scene.add.text(cx, 452, t('fact.continue'), {
    fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
  }).setOrigin(0.5), 203);

  // The card stays until the child is ready. A short pause first, so a held jump key does not skip it.
  const everything = scene.children.list.filter((o) => o.depth >= 200);
  scene.time.delayedCall(GAME.restartDelayMs, () => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      everything.forEach((o) => o.destroy());
      scene.input.keyboard.off('keydown-SPACE', finish);
      scene.input.keyboard.off('keydown-ENTER', finish);
      onDone();
    };
    button.setInteractive({ useHandCursor: true });
    button.on('pointerup', finish);
    scene.input.keyboard.on('keydown-SPACE', finish);
    scene.input.keyboard.on('keydown-ENTER', finish);
  });
}
