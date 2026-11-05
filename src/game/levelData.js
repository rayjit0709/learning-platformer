// Levels are built from a short recipe (LEVELS below) by buildLevel().
// A level is plain data. x, y = centre of an object; w, h = size. Everything in pixels. Ground top is at y = 500.
//
// Layout rule: the level is a row of "islands" of ground, one question station per island,
// with a gap between islands crossed by a stepping stone. Every island has a small platform with coins.

export const LEVEL_COUNT = 5;

// difficulties: one entry per question station (1 easy to 3 harder), so its length = number of stations.
// maxTier: how advanced the Tamil words may be (see WORD_TIERS in config/subjects.js).
// gap: width of the hole between islands. stoneY: height of the stepping stone (smaller = higher).
// theme: the look of the level, see THEMES in game/backdrops.js.
const LEVELS = [
  { difficulties: [1, 1, 1, 1],       maxTier: 1, gap: 140, stoneY: 440, theme: 'village' }, // village and paddy fields
  { difficulties: [1, 1, 2, 2],       maxTier: 1, gap: 150, stoneY: 440, theme: 'temple' }, // temple town
  { difficulties: [1, 2, 2, 2, 3],    maxTier: 2, gap: 160, stoneY: 430, theme: 'coast' }, // sea coast
  { difficulties: [2, 2, 2, 3, 3],    maxTier: 2, gap: 170, stoneY: 425, theme: 'hills' }, // hills and tea gardens
  { difficulties: [2, 2, 3, 3, 3, 3], maxTier: 3, gap: 180, stoneY: 420, theme: 'festival' }, // night of oil lamps
];

const ISLAND = 1060; // length of one island
const STATION_OFFSET = 560; // where the question blocks sit on an island
const LAST_EXTRA = 300; // extra ground after the last island, for the flag
const FIRST_EXTRA = 100; // the first island is longer: room for the spawn point and its coin platform

function islandStart(i, gap) {
  return i === 0 ? 0 : FIRST_EXTRA + i * (ISLAND + gap);
}

export function buildLevel(number) {
  const recipe = LEVELS[Math.min(Math.max(number, 1), LEVEL_COUNT) - 1];
  const count = recipe.difficulties.length;
  const platforms = [];
  const stations = [];
  const coins = [];

  for (let i = 0; i < count; i += 1) {
    const start = islandStart(i, recipe.gap);
    const last = i === count - 1;
    const length = ISLAND + (i === 0 ? FIRST_EXTRA : 0) + (last ? LAST_EXTRA : 0);
    platforms.push({ x: start + length / 2, y: 520, w: length, h: 40 }); // the ground of this island
    stations.push({ x: start + STATION_OFFSET + (i === 0 ? FIRST_EXTRA : 0), blockY: 335 });

    // Platform with two coins (the first island's is placed away from the spawn point)
    const px = i === 0 ? 300 : start + 120;
    platforms.push({ x: px, y: 400, w: 160, h: 24 });
    coins.push({ x: px - 30, y: 355 }, { x: px + 30, y: 355 });

    if (!last) {
      const edge = start + length; // where the hole begins
      const stoneX = edge + recipe.gap / 2;
      platforms.push({ x: stoneX, y: recipe.stoneY, w: 130, h: 24 });
      coins.push({ x: edge - 100, y: 468 }, { x: edge - 50, y: 468 });
      coins.push({ x: stoneX - 40, y: recipe.stoneY - 40 }, { x: stoneX, y: recipe.stoneY - 45 }, { x: stoneX + 40, y: recipe.stoneY - 40 });
      coins.push({ x: edge + recipe.gap + 90, y: 468 });
    }
  }

  const end = islandStart(count - 1, recipe.gap) + ISLAND + (count === 1 ? FIRST_EXTRA : 0) + LAST_EXTRA;
  coins.push({ x: end - 340, y: 468 });
  return {
    number,
    width: end,
    start: { x: 340, y: 455 },
    platforms,
    stations,
    coins,
    flag: { x: end - 280, groundY: 500 },
    difficulties: recipe.difficulties,
    maxTier: recipe.maxTier,
    theme: recipe.theme,
  };
}
