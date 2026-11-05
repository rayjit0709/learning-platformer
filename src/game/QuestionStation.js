import { FONT, QUIZ } from '../config/constants.js';
import { t } from '../i18n/index.js';

const FONT_SIZES = [40, 30, 24, 20]; // tried from big to small

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

    // Short answers (numbers) get small blocks; longer ones get wider blocks and smaller text.
    this.look = this.chooseLook(question.choices);
    const count = question.choices.length;
    const spacing = this.look.width + QUIZ.blockGap;
    const halfSpan = (spacing * (count - 1)) / 2 + this.look.width / 2;
    // The gate stands past the blocks, whatever their width
    this.gateX = def.x + Math.max(190, halfSpan + 40);
    // The banner shows while the player is between these two x positions
    this.zoneStart = def.x - 520;
    this.zoneEnd = this.gateX + 20;

    this.blocks = question.choices.map((label, i) => {
      const x = def.x + (i - (count - 1) / 2) * spacing;
      return this.makeBlock(x, def.blockY, label, i);
    });
    this.gate = QUIZ.gated ? this.makeGate(groundY) : null;
  }

  // Measures the answers to pick a block width and a text size that fit.
  chooseLook(choices) {
    const style = (size) => ({ fontFamily: FONT, fontStyle: 'bold', fontSize: `${size}px` });
    for (const size of FONT_SIZES) {
      let widest = 0;
      for (const label of choices) {
        const probe = this.scene.add.text(-1000, -1000, label, style(size));
        widest = Math.max(widest, probe.width);
        probe.destroy();
      }
      if (widest + 24 <= QUIZ.maxBlockWidth) {
        return { width: Math.max(QUIZ.minBlockWidth, Math.ceil(widest + 24)), height: QUIZ.blockHeight, fontSize: size, wrap: false };
      }
    }
    // Very long answers: widest block, small text on up to 3 lines
    return { width: QUIZ.maxBlockWidth, height: QUIZ.blockHeight + 12, fontSize: 17, wrap: true };
  }

  makeBlock(x, y, label, i) {
    const { width, height, fontSize, wrap } = this.look;
    const block = this.scene.add.rectangle(x, y, width, height, 0x805ad5).setStrokeStyle(5, 0x44337a);
    this.scene.physics.add.existing(block, true); // static: it never moves
    block.choiceIndex = i;
    block.used = false;
    block.label = this.scene.add.text(x, y, label, {
      fontFamily: FONT, fontStyle: 'bold', color: '#ffffff', fontSize: `${fontSize}px`, align: 'center',
      ...(wrap ? { wordWrap: { width: width - 20 } } : {}),
    }).setOrigin(0.5);
    return block;
  }

  makeGate(groundY) {
    const height = 280; // too tall to jump over
    const gate = this.scene.add.rectangle(this.gateX, groundY - height / 2, 30, height, 0xed64a6, 0.85)
      .setStrokeStyle(4, 0xb83280);
    this.scene.physics.add.existing(gate, true);
    gate.mark = this.scene.add.text(this.gateX, groundY - 80, '?', {
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
    block.label.setText('×').setFontSize(40);
    // A gentle message with the hint. No life is lost.
    this.note = `${t('q.wrong')}\n${t('q.hint', { hint: this.question.hint })}`;
  }

  solve(block) {
    this.solved = true;
    block.setFillStyle(0x38a169).setStrokeStyle(5, 0x276749);
    block.label.setText('✓').setFontSize(40);
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
