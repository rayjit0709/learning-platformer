// Game screen size (the browser scales it to fit any device).
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Player movement. Tuned to feel forgiving for young children.
export const PLAYER = {
  width: 30, // hitbox (on screen), a bit smaller than the drawing
  height: 78,
  spriteScale: 0.25, // the character PNGs are 4x the on-screen size, for sharpness
  speed: 240,
  jumpSpeed: 560,
  coyoteMs: 120, // can still jump a moment after leaving a platform
  bufferMs: 120, // a jump pressed just before landing still counts
};
