// Game screen size (the browser scales it to fit any device).
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Player movement. Tuned to feel forgiving for young children.
export const PLAYER = {
  width: 30, // hitbox (on screen), a bit smaller than the drawing
  height: 78,
  spriteScale: 0.25, // the character PNGs are 4x the on-screen size, for sharpness
  speed: 240,
  jumpSpeed: 650, // about 176 px of height: every platform is reachable with room to spare
  coyoteMs: 120, // can still jump a moment after leaving a platform
  bufferMs: 120, // a jump pressed just before landing still counts
};

export const GAME = {
  lives: 3,
  coinPoints: 10,
  restartDelayMs: 700, // ignore key presses right after the end panel appears
};

// Friendly, round-looking system fonts (no download needed, works offline).
// "Noto Sans Tamil" is bundled with the game so Tamil letters show correctly on every device.
export const FONT = '"Trebuchet MS", "Segoe UI", Verdana, Arial, "Noto Sans Tamil", sans-serif';

// Learning part
export const QUIZ = {
  gated: true, // a gate blocks the way until the question is answered
  pointsFirstTry: 50,
  pointsLater: 20,
  blockHeight: 84,
  minBlockWidth: 84,
  maxBlockWidth: 150, // wider blocks for longer answers, such as Tamil phrases
  blockGap: 28,
};
