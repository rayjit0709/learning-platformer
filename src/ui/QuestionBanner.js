import { GAME_WIDTH, FONT } from '../config/constants.js';

const BOX_WIDTH = 660;
const TOP = 72;
const AUDIO_ROOM = 60; // space kept free for the speaker button

// The panel at the top of the screen that shows the current question,
// and below it a hint or a short message. When the question has a recording,
// a speaker button plays it.
export default class QuestionBanner {
  constructor(scene) {
    this.box = scene.add.rectangle(GAME_WIDTH / 2, TOP, BOX_WIDTH, 80, 0xffffff, 0.96)
      .setStrokeStyle(4, 0x2b6cb0).setScrollFactor(0).setDepth(90);
    this.prompt = scene.add.text(GAME_WIDTH / 2, TOP + 12, '', {
      fontFamily: FONT, fontSize: '28px', fontStyle: 'bold', color: '#1a365d', align: 'center',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(91);
    this.note = scene.add.text(GAME_WIDTH / 2, TOP, '', {
      fontFamily: FONT, fontSize: '22px', color: '#c05621', align: 'center',
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(91);

    // Speaker button (hidden unless the question has a recording)
    this.onSpeaker = () => {};
    this.speakerParts = this.makeSpeaker(scene, GAME_WIDTH / 2 + BOX_WIDTH / 2 - 38);
    this.shownKey = null;
    this.hide();
  }

  makeSpeaker(scene, x) {
    const y = TOP + 28;
    const button = scene.add.circle(x, y, 24, 0x2b6cb0).setStrokeStyle(3, 0x1a365d)
      .setScrollFactor(0).setDepth(92).setInteractive({ useHandCursor: true });
    button.on('pointerup', () => this.onSpeaker());
    const icon = [
      scene.add.polygon(x - 4, y, [0, 6, 7, 6, 15, 0, 15, 24, 7, 18, 0, 18]).setFillStyle(0xffffff),
      scene.add.rectangle(x + 10, y, 5, 3, 0xffffff),
      scene.add.rectangle(x + 9, y - 8, 5, 3, 0xffffff).setAngle(-35),
      scene.add.rectangle(x + 9, y + 8, 5, 3, 0xffffff).setAngle(35),
    ].map((o) => o.setScrollFactor(0).setDepth(93));
    return { button, icon };
  }

  // promptText: the question. noteText: optional second line (hint or message).
  // hasAudio: show the speaker button.
  show(promptText, noteText = '', noteColor = '#c05621', hasAudio = false) {
    const key = `${promptText}|${noteText}|${noteColor}|${hasAudio}`;
    if (key === this.shownKey) return; // nothing changed: avoid redoing the layout every frame
    this.shownKey = key;

    const textWidth = BOX_WIDTH - 40 - (hasAudio ? AUDIO_ROOM : 0);
    this.prompt.setWordWrapWidth(textWidth).setText(promptText);
    this.note.setWordWrapWidth(textWidth).setText(noteText).setColor(noteColor);
    const shift = hasAudio ? -AUDIO_ROOM / 2 + 10 : 0; // centre the text in the space left of the speaker
    this.prompt.setX(GAME_WIDTH / 2 + shift);
    this.note.setX(GAME_WIDTH / 2 + shift);

    const promptBottom = TOP + 12 + this.prompt.height;
    this.note.setY(promptBottom + 6);
    const bottom = noteText ? promptBottom + 6 + this.note.height + 12 : promptBottom + 12;
    this.box.setSize(BOX_WIDTH, bottom - TOP + 12).setPosition(GAME_WIDTH / 2, (TOP - 12 + bottom) / 2);
    for (const o of [this.box, this.prompt, this.note]) o.setVisible(true);
    this.speakerParts.button.setVisible(hasAudio);
    for (const o of this.speakerParts.icon) o.setVisible(hasAudio);
  }

  hide() {
    this.shownKey = null;
    for (const o of [this.box, this.prompt, this.note, this.speakerParts.button, ...this.speakerParts.icon]) o.setVisible(false);
  }
}
