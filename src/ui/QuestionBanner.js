import { GAME_WIDTH, FONT } from '../config/constants.js';

const BOX_WIDTH = 700;
const TOP = 72;

// The panel at the top of the screen that shows the current question,
// and below it a hint or a short message.
export default class QuestionBanner {
  constructor(scene) {
    this.box = scene.add.rectangle(GAME_WIDTH / 2, TOP, BOX_WIDTH, 80, 0xffffff, 0.96)
      .setStrokeStyle(4, 0x2b6cb0).setScrollFactor(0).setDepth(90);
    this.prompt = scene.add.text(GAME_WIDTH / 2, TOP + 12, '', {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#1a365d',
      align: 'center', wordWrap: { width: BOX_WIDTH - 40 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(91);
    this.note = scene.add.text(GAME_WIDTH / 2, TOP, '', {
      fontFamily: FONT, fontSize: '22px', color: '#c05621',
      align: 'center', wordWrap: { width: BOX_WIDTH - 40 },
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(91);
    this.shownKey = null;
    this.hide();
  }

  // promptText: the question. noteText: optional second line (hint or message).
  show(promptText, noteText = '', noteColor = '#c05621') {
    const key = `${promptText}|${noteText}|${noteColor}`;
    if (key === this.shownKey) return; // nothing changed: avoid redoing the layout every frame
    this.shownKey = key;

    this.prompt.setText(promptText).setColor('#1a365d');
    this.note.setText(noteText).setColor(noteColor);
    const promptBottom = TOP + 12 + this.prompt.height;
    this.note.setY(promptBottom + 6);
    const bottom = noteText ? promptBottom + 6 + this.note.height + 12 : promptBottom + 12;
    this.box.setSize(BOX_WIDTH, bottom - TOP + 12).setPosition(GAME_WIDTH / 2, (TOP - 12 + bottom) / 2);
    // The rectangle keeps its stroke; only its size and position change.
    for (const o of [this.box, this.prompt, this.note]) o.setVisible(true);
  }

  hide() {
    this.shownKey = null;
    for (const o of [this.box, this.prompt, this.note]) o.setVisible(false);
  }
}
