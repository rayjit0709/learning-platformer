// A level is plain data. x, y = centre of an object; w, h = size. Everything in pixels.
// Ground top is at y = 500.
export const LEVEL_1 = {
  width: 3600,
  start: { x: 340, y: 455 }, // right of the touch buttons, standing on the ground
  platforms: [
    // Three pieces of ground with two 140 px gaps between them
    { x: 500, y: 520, w: 1000, h: 40 },   // ground 1: x 0 to 1000
    { x: 1670, y: 520, w: 1060, h: 40 },  // ground 2: x 1140 to 2200
    { x: 2970, y: 520, w: 1260, h: 40 },  // ground 3: x 2340 to 3600
    // Stepping stones over the gaps
    { x: 1070, y: 440, w: 100, h: 24 },
    { x: 2270, y: 440, w: 100, h: 24 },
    // Platforms with coins
    { x: 300, y: 400, w: 160, h: 24 },
    { x: 900, y: 390, w: 140, h: 24 },
    { x: 1400, y: 400, w: 160, h: 24 },
    { x: 1950, y: 390, w: 160, h: 24 },
    { x: 2480, y: 400, w: 160, h: 24 },
  ],
  // Question stations: x = middle of the 3 answer blocks, blockY = their height,
  // gateX = where the gate that closes the way stands.
  stations: [
    { x: 620, blockY: 335, gateX: 810 },
    { x: 1650, blockY: 335, gateX: 1840 },
    { x: 2800, blockY: 335, gateX: 2990 },
    { x: 3250, blockY: 335, gateX: 3440 },
  ],
  coins: [
    { x: 270, y: 355 }, { x: 330, y: 355 },
    { x: 430, y: 468 }, { x: 880, y: 355 }, { x: 920, y: 355 },
    { x: 1030, y: 400 }, { x: 1070, y: 395 }, { x: 1110, y: 400 },
    { x: 1250, y: 468 }, { x: 1320, y: 468 },
    { x: 1380, y: 355 }, { x: 1420, y: 355 },
    { x: 1930, y: 355 }, { x: 1970, y: 355 },
    { x: 2230, y: 400 }, { x: 2270, y: 395 }, { x: 2310, y: 400 },
    { x: 2400, y: 468 }, { x: 2460, y: 355 }, { x: 2500, y: 355 }, { x: 2620, y: 468 },
    { x: 3050, y: 468 }, { x: 3100, y: 468 }, { x: 3490, y: 468 },
  ],
  // The flag at the end: reaching it wins the level.
  flag: { x: 3540, groundY: 500 },
};
