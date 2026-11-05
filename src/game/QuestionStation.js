import { FONT, QUIZ } from '../config/constants.js';
import { t } from '../i18n/index.js';

// One question in the level: answer blocks floating above the ground and,
// optionally, a gate further on that opens once the question is answered.
// The player jumps up into a block from below to give an answer.
export default class QuestionStation {
  constructor(scene, def, question, groundY) {
    this.scene = scene;
    this.question = question;
    this.solved = false;
    this.attempts = 0; // wrong answers so far
    this.note = ''; // hint shown under the question after a wrong answer
    // The banner shows while the player is between these two x positions
    this.zoneStart = def.x - 520;
    this.zoneEnd = def.gateX + 20;
    this.gateX = def.gateX;

    this.blocks = question.choices.map((label, i) => this.makeBlock(def, label, i, question.choices.length));
    this.gate = QUIZ.gated ? this.makeGate(def, groundY) : null;
  }

  makeBlock(def, label, i, count) {
    const x = def.x + (i - (count - 1) / 2) * QUIZ.blockSpacing;
    const block = this.scene.add.rectangle(x, def.blockY, QUIZ.blockSize, QUIZ.blockSize, 0x805ad5)
      .setStrokeStyle(5, 0x44337a);
    this.scene.physics.add.existing(block, true); // static: it never moves
    block.choiceIndex = i;
    block.used = false;
    block.label = this.scene.add.text(x, def.blockY, label, {
      fontFamily: FONT, fontStyle: 'bold', color: '#ffffff',
      fontSize: label.length > 5 ? '24px' : '40px',
      align: 'center', wordWrap: { width: QUIZ.blockSize - 8 },
    }).setOrigin(0.5);
    return block;
  }

  makeGate(def, groundY) {
    const height = 280; // too tall to jump over
    const gate = this.scene.add.rectangle(def.gateX, groundY - height / 2, 30, height, 0xed64a6, 0.85)
      .setStrokeStyle(4, 0xb83280);
    this.scene.physics.add.existing(gate, true);
    gate.mark = this.scene.add.text(def.gateX, groundY - 80, '?', {
      fontFamily: FONT, fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5);
    return gate;
  }

  containsX(x) {
    return x >= this.zoneStart && x <= this.zoneEnd;
  }

  // Called when the player's head hits a block from below
  hit(block) {
    if (this.solved || block.used) return;
    // little bump so the block feels hit
    this.scene.tweens.add({ targets: [block, block.label], y: '-=10', duration: 80, yoyo: true });
    if (block.choiceIndex === this.question.answerIndex) this.solve(block);
    else this.wrong(block);
  }

  wrong(block) {
    this.attempts += 1;
    block.used = true;
    block.setFillStyle(0xa0aec0).setStrokeStyle(5, 0x718096);
    block.label.setText('×');
    // A gentle message with the hint. No life is lost.
    this.note = `${t('q.wrong')}\n${t('q.hint', { hint: this.question.hint })}`;
  }

  solve(block) {
    this.solved = true;
    block.setFillStyle(0x38a169).setStrokeStyle(5, 0x276749);
    block.label.setText('✓');
    for (const other of this.blocks) {
      if (other !== block) this.scene.tweens.add({ targets: [other, other.label], alpha: 0.3, duration: 300 });
    }
    if (this.gate) this.openGate();
    this.scene.onQuestionSolved(this, block);
  }

  openGate() {
    this.gate.body.enable = false; // the player can walk through right away
    this.scene.tweens.add({
      targets: [this.gate, this.gate.mark], alpha: 0, duration: 500,
    });
  }
}
