// A level is plain data. x, y = centre of an object; w, h = size. Everything in pixels.
// Ground top is at y = 500.
export const LEVEL_1 = {
  width: 4000,
  start: { x: 340, y: 455 }, // right of the touch buttons, standing on the ground
  platforms: [
    // Three pieces of ground with two 140 px gaps between them
    { x: 500, y: 520, w: 1000, h: 40 },   // ground 1: x 0 to 1000
    { x: 1670, y: 520, w: 1060, h: 40 },  // ground 2: x 1140 to 2200
    { x: 3170, y: 520, w: 1660, h: 40 },  // ground 3: x 2340 to 4000
    // Stepping stones over the gaps
    { x: 1070, y: 440, w: 100, h: 24 },
    { x: 2270, y: 440, w: 100, h: 24 },
    // Platforms with coins (kept clear of the question blocks and gates)
    { x: 300, y: 400, w: 160, h: 24 },
    { x: 1280, y: 400, w: 160, h: 24 },
    { x: 2110, y: 390, w: 160, h: 24 },
  ],
  // Question stations: x = middle of the answer blocks, blockY = their height.
  // The gate that closes the way is placed automatically just after the blocks.
  // Long answers make wider blocks, so keep about 700 px of free ground around each station.
  stations: [
    { x: 660, blockY: 335 },
    { x: 1700, blockY: 335 },
    { x: 2740, blockY: 335 },
    { x: 3330, blockY: 335 },
  ],
  coins: [
    { x: 270, y: 355 }, { x: 330, y: 355 }, { x: 440, y: 468 },
    { x: 960, y: 468 },
    { x: 1030, y: 400 }, { x: 1070, y: 395 }, { x: 1110, y: 400 },
    { x: 1250, y: 355 }, { x: 1310, y: 355 }, { x: 1400, y: 468 },
    { x: 2080, y: 355 }, { x: 2140, y: 355 },
    { x: 2230, y: 400 }, { x: 2270, y: 395 }, { x: 2310, y: 400 },
    { x: 2400, y: 468 }, { x: 2440, y: 468 },
    { x: 3090, y: 468 }, { x: 3140, y: 468 },
    { x: 3660, y: 468 },
  ],
  // The flag at the end: reaching it wins the level.
  flag: { x: 3720, groundY: 500 },
};
