import { isMusicOn, setMusicOn } from '../services/music.js';

const RADIUS = 26;

// A round, semi-transparent button. Returns the circle so the caller can add icon shapes on top.
function roundButton(scene, x, y, onClick) {
  const circle = scene.add.circle(x, y, RADIUS, 0x000000, 0.35)
    .setStrokeStyle(3, 0xffffff, 0.9).setScrollFactor(0).setDepth(100)
    .setInteractive({ useHandCursor: true });
  circle.on('pointerup', onClick);
  return circle;
}

// Adds shapes drawn on top of a button (icons are drawn with shapes, so no font is needed).
function icon(scene, shapes) {
  return shapes.map((shape) => shape.setScrollFactor(0).setDepth(101));
}

// Music on/off. A red slash shows when the music is off.
export function createMusicButton(scene, x, y) {
  roundButton(scene, x, y, () => toggle());
  icon(scene, [
    scene.add.ellipse(x - 5, y + 8, 14, 10, 0xffffff),      // note head
    scene.add.rectangle(x + 1, y - 3, 3, 22, 0xffffff),     // stem
    scene.add.rectangle(x + 7, y - 11, 12, 5, 0xffffff),    // flag
  ]);
  const slash = scene.add.rectangle(x, y, 48, 5, 0xff4d4d).setAngle(-45).setScrollFactor(0).setDepth(102);
  const refresh = () => slash.setVisible(!isMusicOn());
  const toggle = () => { setMusicOn(scene, !isMusicOn()); refresh(); };
  refresh();
  scene.input.keyboard.on('keydown-M', toggle);
  // remove the key listener when the scene ends, so it does not pile up after restarts
  scene.events.once('shutdown', () => scene.input.keyboard.off('keydown-M', toggle));
}

// Back to the start screen (to change character or language).
export function createHomeButton(scene, x, y, onClick) {
  roundButton(scene, x, y, onClick);
  icon(scene, [
    scene.add.triangle(x, y - 8, 0, 14, 13, 0, 26, 14, 0xffffff), // roof
    scene.add.rectangle(x, y + 7, 18, 14, 0xffffff),               // walls
    scene.add.rectangle(x, y + 10, 6, 8, 0x2b6cb0),                // door
  ]);
}
