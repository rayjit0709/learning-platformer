// Game screen size (the browser scales it to fit any device).
export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Player movement. Tuned to feel forgiving for young children.
export const PLAYER = {
  width: 36,
  height: 48,
  speed: 240,
  jumpSpeed: 560,
  coyoteMs: 120, // can still jump a moment after leaving a platform
  bufferMs: 120, // a jump pressed just before landing still counts
};
