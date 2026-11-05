// Best number of stars (0 to 3) earned in each level, per subject. Stored on this device only.
// Shape: { tamil: { "1": 3, "2": 2 }, math: { ... } }.
// (When profiles arrive in M4, this will be split per profile.)
const KEY = 'lp.progress.v1';
export const UNLOCK_STARS = 2; // stars needed in a level to open the next one
let cache = null;

function load() {
  if (cache) return cache;
  cache = {};
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) cache = JSON.parse(raw) || {};
  } catch (e) { /* storage blocked or broken: start empty */ }
  return cache;
}

export function getStars(subject, level) {
  return Number(load()[subject]?.[level]) || 0;
}

// Keeps the best result only
export function saveStars(subject, level, stars) {
  if (stars <= getStars(subject, level)) return;
  const data = load();
  data[subject] = { ...(data[subject] || {}), [level]: stars };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) { /* the game still works, it just forgets next time */ }
}

// Level 1 is always open; the others need enough stars in the level before.
// Adding ?unlock=1 to the address opens everything (handy for testing).
export function isUnlocked(subject, level) {
  if (level <= 1) return true;
  if (new URLSearchParams(window.location.search).get('unlock') === '1') return true;
  return getStars(subject, level - 1) >= UNLOCK_STARS;
}

// 3 stars = everything right at the first try, 2 = at least half, 1 = finished the level.
export function starsFor(firstTry, total) {
  if (total === 0) return UNLOCK_STARS; // no questions loaded: never block the child
  if (firstTry === total) return 3;
  return firstTry / total >= 0.5 ? 2 : 1;
}

// Which "did you know" facts this device has already shown, so each replay shows a new one first.
const FACTS_KEY = 'lp.facts.v1';
function seenFacts() {
  try {
    const raw = JSON.parse(localStorage.getItem(FACTS_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch (e) { return []; }
}

// Picks a fact for a level: one not shown yet if possible, otherwise any. Returns null when there is none.
export function pickFact(facts, level) {
  const own = facts.filter((f) => f.level === level);
  if (own.length === 0) return null;
  const seen = seenFacts();
  const fresh = own.filter((f) => !seen.includes(f.id));
  const pool = fresh.length > 0 ? fresh : own;
  const fact = pool[Math.floor(Math.random() * pool.length)];
  try {
    localStorage.setItem(FACTS_KEY, JSON.stringify([...new Set([...seen, fact.id])]));
  } catch (e) { /* fine: it just may repeat */ }
  return fact;
}
