// Settings remembered on this device (language, character, subject, Tamil accent, music on/off).
// Stored in localStorage under one versioned key, so future changes can migrate old saves.
const KEY = 'lp.settings.v1';
const DEFAULTS = { lang: 'fr', hero: 'boy', musicOn: true, subject: 'tamil', accent: 'in' };
let cache = null;

function load() {
  if (cache) return cache;
  cache = { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) cache = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch (e) { /* storage blocked or broken: keep the defaults */ }
  return cache;
}

export function getSetting(name) {
  return load()[name];
}

export function setSetting(name, value) {
  load()[name] = value;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch (e) { /* the game still works, it just forgets next time */ }
}
