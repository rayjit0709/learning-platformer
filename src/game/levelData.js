// A level is plain data: where the platforms are. Later milestones add
// coins, question blocks and a flag here, so content never needs new code.
// x, y = centre of the platform; w, h = size. Everything in pixels.
export const LEVEL_1 = {
  width: 2600,
  start: { x: 340, y: 400 }, // right of the touch buttons
  platforms: [
    { x: 520, y: 520, w: 1040, h: 40 },   // ground, part 1 (ends at x=1040)
    { x: 1900, y: 520, w: 1400, h: 40 },  // ground, part 2 (starts at x=1200: a 160px gap)
    { x: 400, y: 400, w: 160, h: 24 },
    { x: 650, y: 320, w: 160, h: 24 },
    { x: 900, y: 400, w: 160, h: 24 },
    { x: 1120, y: 440, w: 100, h: 24 },   // stepping stone over the gap
    { x: 1700, y: 380, w: 180, h: 24 },
    { x: 1950, y: 300, w: 180, h: 24 },
    { x: 2250, y: 400, w: 200, h: 24 },
  ],
  // Coins: x, y = centre. Placed to guide the player (arc over the gap, trails on platforms).
  coins: [
    { x: 500, y: 468 }, { x: 560, y: 468 }, { x: 620, y: 468 },
    { x: 370, y: 355 }, { x: 430, y: 355 },
    { x: 620, y: 275 }, { x: 680, y: 275 },
    { x: 900, y: 355 },
    { x: 1070, y: 400 }, { x: 1120, y: 395 }, { x: 1175, y: 400 },
    { x: 1350, y: 468 }, { x: 1410, y: 468 }, { x: 1470, y: 468 },
    { x: 1680, y: 335 }, { x: 1720, y: 335 },
    { x: 1950, y: 255 },
    { x: 2250, y: 355 }, { x: 2300, y: 468 }, { x: 2380, y: 468 },
  ],
  // The flag at the end: reaching it wins the level.
  flag: { x: 2490, groundY: 500 },
};
