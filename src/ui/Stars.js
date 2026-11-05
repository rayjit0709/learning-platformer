// Draws a row of 3 stars; the first `earned` are gold, the others grey.
export function drawStars(scene, cx, cy, earned, size = 26, depth = 202, scrollFree = true) {
  const items = [];
  for (let i = 0; i < 3; i += 1) {
    const on = i < earned;
    const star = scene.add.star(cx + (i - 1) * size * 2.3, cy - (i === 1 ? size * 0.35 : 0), 5, size * 0.45, size, on ? 0xfbd34d : 0xcbd5e0)
      .setStrokeStyle(3, on ? 0xc58b0a : 0xa0aec0).setDepth(depth);
    if (scrollFree) star.setScrollFactor(0);
    items.push(star);
  }
  return items;
}
