// South Indian look, drawn entirely in code (original shapes, no third-party art).
// Each theme has a sky, a far layer and a middle layer that scroll slower than the player (parallax),
// and a temple-style striped border for the ground.
// The layers are painted once into textures, then shown as plain images (cheap to draw).

// ground: [fill, outline]; stripes: the two colours of the border (like the red and white stripes on temple walls)
export const THEMES = {
  village: { sky: ['#7ec8f2', '#dff4ff'], sun: [0xfff2a8, 780, 95, 42], ground: [0xa3562c, 0x6b3418], stripes: [0xc0392b, 0xfff4dc] },
  temple: { sky: ['#ffb870', '#ffe9c2'], sun: [0xfff0c0, 700, 130, 50], ground: [0xb86b3d, 0x7a4122], stripes: [0xc0392b, 0xfff4dc] },
  coast: { sky: ['#ff8a65', '#ffd9a8'], sun: [0xffe29a, 620, 300, 60], ground: [0xe3be80, 0xa8803f], stripes: [0x1f7a8c, 0xfff4dc] },
  hills: { sky: ['#b9dbe8', '#eaf6f4'], sun: [0xffffff, 200, 90, 36], ground: [0x8a6a3f, 0x5a4326], stripes: [0x2f855a, 0xfff4dc] },
  festival: { sky: ['#1d1b4d', '#6b3f8f'], sun: [0xfff6d0, 760, 90, 34], ground: [0x5a3a35, 0x2e1c1a], stripes: [0xe0a030, 0x3b2a4a] },
};

const W = 960;
const H = 540;
const FAR_SPEED = 0.12; // how much the far layer follows the camera (0 = fixed, 1 = same as the ground)
const MID_SPEED = 0.35;

// ---------- small helpers ----------
function seeded(seed) { // the same numbers every time, so a level always looks the same
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hexToInt = (s) => parseInt(s.slice(1), 16);
function mix(a, b, t) {
  const ch = (shift) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
function makeTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g, w, h);
  g.generateTexture(key, w, h);
  g.destroy();
}

// ---------- drawing pieces ----------
function palm(g, x, baseY, height, lean, trunk, leaf) {
  const top = { x: x + lean, y: baseY - height };
  const ctrl = { x: x + lean * 0.1, y: baseY - height * 0.55 };
  let prev = { x, y: baseY };
  for (let i = 1; i <= 10; i += 1) { // curved trunk, thinner towards the top
    const t = i / 10;
    const p = {
      x: (1 - t) * (1 - t) * x + 2 * (1 - t) * t * ctrl.x + t * t * top.x,
      y: (1 - t) * (1 - t) * baseY + 2 * (1 - t) * t * ctrl.y + t * t * top.y,
    };
    g.lineStyle(12 - 6 * t, trunk, 1);
    g.lineBetween(prev.x, prev.y, p.x, p.y);
    prev = p;
  }
  const leafLen = height * 0.5;
  for (let k = 0; k < 9; k += 1) { // long curved leaves
    const angle = Math.PI * (1.05 + (k / 8) * 0.9); // from the left, over the top, to the right
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let last = { x: top.x, y: top.y };
    for (let i = 1; i <= 7; i += 1) {
      const t = i / 7;
      const p = { x: top.x + dx * leafLen * t, y: top.y + dy * leafLen * t * 0.7 + leafLen * 0.55 * t * t };
      g.lineStyle(7 - 5 * t, leaf, 1);
      g.lineBetween(last.x, last.y, p.x, p.y);
      last = p;
    }
  }
  g.fillStyle(0x6b4423, 1);
  g.fillCircle(top.x - 5, top.y + 8, 6);
  g.fillCircle(top.x + 6, top.y + 9, 6);
}

function hut(g, x, baseY, w, wall, roof) {
  const wallH = w * 0.45;
  g.fillStyle(wall, 1);
  g.fillRect(x - w / 2, baseY - wallH, w, wallH);
  g.fillStyle(mix(wall, 0x000000, 0.5), 1);
  g.fillRect(x - w * 0.09, baseY - wallH * 0.7, w * 0.18, wallH * 0.7); // door
  g.fillStyle(roof, 1);
  g.fillTriangle(x - w * 0.62, baseY - wallH, x + w * 0.62, baseY - wallH, x, baseY - wallH - w * 0.5); // thatched roof
  g.lineStyle(2, mix(roof, 0x000000, 0.35), 1);
  for (let i = -2; i <= 2; i += 1) g.lineBetween(x + i * w * 0.1, baseY - wallH - w * 0.04, x + i * w * 0.2, baseY - wallH);
}

// A gopuram: the tall tiered gateway tower of a South Indian temple
function gopuram(g, cx, baseY, w, h, body, shade) {
  const tiers = 7;
  const th = h / (tiers + 2);
  g.fillStyle(body, 1);
  g.fillRect(cx - w / 2, baseY - th * 1.4, w, th * 1.4); // base with the doorway
  g.fillStyle(shade, 1);
  g.fillRect(cx - w * 0.09, baseY - th * 1.1, w * 0.18, th * 1.1);
  let y = baseY - th * 1.4;
  let tw = w * 0.92;
  for (let i = 0; i < tiers; i += 1) {
    y -= th;
    g.fillStyle(body, 1);
    g.fillRect(cx - tw / 2, y, tw, th);
    g.fillStyle(mix(body, 0xffffff, 0.25), 1); // ledge
    g.fillRect(cx - tw / 2 - 3, y + th - 4, tw + 6, 4);
    g.fillStyle(shade, 1); // little windows
    const n = Math.max(2, Math.floor(tw / 26));
    for (let k = 0; k < n; k += 1) g.fillRect(cx - tw / 2 + (tw / n) * (k + 0.3), y + th * 0.25, (tw / n) * 0.4, th * 0.4);
    tw *= 0.87;
  }
  g.fillStyle(body, 1); // rounded roof on top
  g.fillEllipse(cx, y, tw * 1.15, th * 1.6);
  g.fillStyle(0xf2c94c, 1); // golden pots on the roof
  for (let k = -2; k <= 2; k += 1) {
    g.fillTriangle(cx + k * tw * 0.22 - 5, y - th * 0.4, cx + k * tw * 0.22 + 5, y - th * 0.4, cx + k * tw * 0.22, y - th * 0.4 - 18);
  }
}

function templeWall(g, x, baseY, w, body, stripeA, stripeB) {
  const h = 46;
  g.fillStyle(body, 1);
  g.fillRect(x, baseY - h, w, h);
  const stripe = 16;
  for (let i = 0; i < Math.floor(w / stripe); i += 1) { // red and white stripes under the top edge
    g.fillStyle(i % 2 === 0 ? stripeA : stripeB, 1);
    g.fillRect(x + i * stripe, baseY - h + 8, stripe, 16);
  }
  g.fillStyle(mix(body, 0xffffff, 0.3), 1);
  g.fillRect(x - 4, baseY - h - 6, w + 8, 8);
  for (let i = 0; i < Math.floor(w / 60); i += 1) { // little domes on top
    g.fillEllipse(x + 30 + i * 60, baseY - h - 6, 22, 20);
  }
}

function diya(g, x, baseY, glow) { // a small oil lamp: clay bowl, flame, soft glow
  if (glow) {
    g.fillStyle(0xffb347, 0.12);
    g.fillCircle(x, baseY - 14, 34);
    g.fillStyle(0xffb347, 0.18);
    g.fillCircle(x, baseY - 14, 20);
  }
  g.fillStyle(0xb5562b, 1);
  g.fillEllipse(x, baseY - 4, 26, 12);
  g.fillStyle(0xffd24d, 1);
  g.fillTriangle(x - 5, baseY - 8, x + 5, baseY - 8, x, baseY - 26);
  g.fillStyle(0xfff3b0, 1);
  g.fillTriangle(x - 2.5, baseY - 9, x + 2.5, baseY - 9, x, baseY - 20);
}

function boat(g, x, baseY, hull, sail) { // a fishing catamaran with a sail
  g.fillStyle(hull, 1);
  g.fillTriangle(x - 34, baseY - 10, x + 34, baseY - 10, x + 24, baseY);
  g.fillTriangle(x - 34, baseY - 10, x - 24, baseY, x + 24, baseY);
  g.lineStyle(3, hull, 1);
  g.lineBetween(x, baseY - 10, x, baseY - 52);
  g.fillStyle(sail, 1);
  g.fillTriangle(x + 2, baseY - 50, x + 2, baseY - 14, x + 32, baseY - 14);
}

function mountain(g, x, baseY, w, h, color, snow) {
  g.fillStyle(color, 1);
  g.fillTriangle(x - w / 2, baseY, x + w / 2, baseY, x, baseY - h);
  if (snow) {
    g.fillStyle(snow, 0.9);
    g.fillTriangle(x - w * 0.09, baseY - h * 0.82, x + w * 0.09, baseY - h * 0.82, x, baseY - h);
  }
}

// ---------- the layers of each theme ----------
// Each function paints one layer into g; (width, height) is the size of the texture; rand gives repeatable randomness.
const LAYERS = {
  village: {
    far(g, width, rand) {
      for (let x = -100; x < width + 200; x += 240 + rand() * 120) {
        g.fillStyle(mix(0x7bc96f, 0xffffff, rand() * 0.2), 1);
        g.fillEllipse(x, 520, 420 + rand() * 200, 130 + rand() * 90);
      }
    },
    mid(g, width, rand) {
      g.fillStyle(0x58a84b, 1); // paddy field in stripes
      g.fillRect(0, 470, width, 70);
      g.fillStyle(0x7acb62, 1);
      for (let x = 0; x < width; x += 54) g.fillRect(x, 470, 26, 70);
      for (let x = 120; x < width; x += 330 + rand() * 260) palm(g, x, 480, 190 + rand() * 90, (rand() - 0.5) * 60, 0x7b5230, 0x2e8b3d);
      for (let x = 700; x < width; x += 1100 + rand() * 500) hut(g, x, 482, 110, 0xfff1d6, 0xb08a4a);
    },
  },
  temple: {
    far(g, width, rand) {
      for (let x = 200; x < width + 100; x += 560 + rand() * 260) gopuram(g, x, 500, 170, 300 + rand() * 60, 0xd9a07a, 0xb97a55);
    },
    mid(g, width, rand) {
      for (let x = 0; x < width; x += 700 + rand() * 300) templeWall(g, x, 490, 380 + rand() * 160, 0xe9c9a0, 0xc0392b, 0xfff4dc);
      for (let x = 320; x < width; x += 480 + rand() * 340) palm(g, x, 490, 170 + rand() * 80, (rand() - 0.5) * 50, 0x7b5230, 0x2f7d3a);
    },
  },
  coast: {
    far(g, width, rand) {
      g.fillStyle(0x3aa6b9, 1); // sea
      g.fillRect(0, 380, width, 160);
      g.fillStyle(0x5cc0cf, 1);
      g.fillRect(0, 380, width, 22);
      for (let x = 300; x < width; x += 700 + rand() * 400) boat(g, x, 392, 0x7a3b1d, 0xfff4dc);
    },
    mid(g, width, rand) {
      g.fillStyle(0xf0d39b, 1); // sand
      g.fillRect(0, 478, width, 62);
      for (let x = 100; x < width; x += 380 + rand() * 260) palm(g, x, 486, 200 + rand() * 80, (rand() < 0.5 ? -1 : 1) * (40 + rand() * 40), 0x7b5230, 0x2f8f4a);
      for (let x = 520; x < width; x += 1200 + rand() * 600) boat(g, x, 492, 0x1f7a8c, 0xffe0a0);
    },
  },
  hills: {
    far(g, width, rand) {
      for (let x = 0; x < width + 200; x += 170 + rand() * 90) mountain(g, x, 500, 380 + rand() * 160, 250 + rand() * 120, mix(0x5a8f78, 0xcfe6ee, 0.35), 0xffffff);
      for (let x = 60; x < width + 200; x += 210 + rand() * 120) mountain(g, x, 500, 360 + rand() * 120, 160 + rand() * 80, 0x6fae8c, null);
    },
    mid(g, width, rand) {
      for (let x = -80; x < width + 200; x += 330 + rand() * 120) { // tea terraces on rounded hills
        g.fillStyle(0x3f9b55, 1);
        g.fillEllipse(x, 520, 480, 160);
        g.lineStyle(3, 0x66bb6a, 1);
        for (let k = 1; k <= 4; k += 1) g.strokeEllipse(x, 520, 480 - k * 90, 160 - k * 28);
      }
      for (let x = 200; x < width; x += 520 + rand() * 360) { // slim trees
        g.fillStyle(0x6b4a2b, 1);
        g.fillRect(x - 4, 430, 8, 60);
        g.fillStyle(0x2f7d46, 1);
        g.fillEllipse(x, 420, 70, 90);
      }
    },
  },
  festival: {
    far(g, width, rand) {
      for (let x = 160; x < width + 100; x += 520 + rand() * 240) {
        gopuram(g, x, 500, 170, 320 + rand() * 60, 0x2b2358, 0x120f33);
        g.fillStyle(0xffd24d, 1); // lit windows
        for (let i = 0; i < 12; i += 1) g.fillRect(x - 60 + rand() * 120, 200 + rand() * 260, 5, 7);
      }
    },
    mid(g, width, rand) {
      g.fillStyle(0x1c1745, 1);
      g.fillRect(0, 486, width, 54);
      for (let x = 90; x < width; x += 360 + rand() * 260) palm(g, x, 490, 180 + rand() * 80, (rand() - 0.5) * 50, 0x120f33, 0x16123a);
      for (let x = 40; x < width; x += 64) diya(g, x, 494, true); // a row of oil lamps
    },
  },
};

// Stars for the night sky
function stars(g, rand) {
  g.fillStyle(0xffffff, 1);
  for (let i = 0; i < 70; i += 1) g.fillCircle(rand() * W, rand() * 330, 0.8 + rand() * 1.4);
}

// ---------- public ----------
// Shows the backdrop of a theme behind everything. worldWidth = level width (use 960 for fixed screens).
export function drawBackdrop(scene, themeKey, worldWidth = W) {
  const theme = THEMES[themeKey] || THEMES.village;
  const layers = LAYERS[themeKey] || LAYERS.village;

  makeTexture(scene, `bg-sky-${themeKey}`, W, H, (g) => {
    const top = hexToInt(theme.sky[0]);
    const bottom = hexToInt(theme.sky[1]);
    const bands = 30;
    for (let i = 0; i < bands; i += 1) {
      g.fillStyle(mix(top, bottom, i / (bands - 1)), 1);
      g.fillRect(0, (H / bands) * i, W, H / bands + 1);
    }
    if (themeKey === 'festival') stars(g, seeded(7));
    const [color, x, y, r] = theme.sun;
    g.fillStyle(color, 0.35);
    g.fillCircle(x, y, r * 1.5);
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
  });
  scene.add.image(0, 0, `bg-sky-${themeKey}`).setOrigin(0).setScrollFactor(0).setDepth(-30);

  [['far', FAR_SPEED, -20, 1], ['mid', MID_SPEED, -10, 2]].forEach(([name, speed, depth, seed]) => {
    // the layer only needs to be as wide as what the camera can ever see of it
    const width = Math.ceil(W + Math.max(0, worldWidth - W) * speed) + 20;
    const key = `bg-${name}-${themeKey}-${width}`;
    makeTexture(scene, key, width, H, (g) => layers[name](g, width, seeded(seed * 1000 + themeKey.length)));
    scene.add.image(0, 0, key).setOrigin(0).setScrollFactor(speed, 0).setDepth(depth);
  });
}

// Temple-style striped border: a strip of two alternating colours, e.g. along the top of the ground.
export function addStripeBorder(scene, themeKey, x, y, width) {
  const theme = THEMES[themeKey] || THEMES.village;
  const key = `stripes-${themeKey}`;
  makeTexture(scene, key, 40, 14, (g) => {
    g.fillStyle(theme.stripes[0], 1);
    g.fillRect(0, 0, 20, 14);
    g.fillStyle(theme.stripes[1], 1);
    g.fillRect(20, 0, 20, 14);
  });
  return scene.add.tileSprite(x, y, width, 14, key).setOrigin(0, 0);
}
