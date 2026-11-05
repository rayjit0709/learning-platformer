import fr from './fr.json';
import en from './en.json';

// Interface texts. To add a language: add a new json file and list it here.
// The home screen switch (M4) will save the choice; until then use ?lang=en.
const DICTIONARIES = { fr, en };

export function currentLang() {
  const fromAddress = new URLSearchParams(location.search).get('lang');
  if (DICTIONARIES[fromAddress]) return fromAddress;
  try {
    const saved = localStorage.getItem('lp.settings.lang');
    if (DICTIONARIES[saved]) return saved;
  } catch (e) { /* storage can be blocked: just use the default */ }
  return 'fr'; // French first
}

// t('hud.score', { score: 30 }) -> "Score : 30"
export function t(key, values = {}) {
  const text = DICTIONARIES[currentLang()][key] ?? DICTIONARIES.fr[key] ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
}

// Picks the text for the current language from {"fr": "...", "en": "..."}.
// Plain numbers and strings are shown as they are (useful for math answers).
export function localized(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return String(value);
  return value[currentLang()] ?? value.fr ?? Object.values(value)[0] ?? '';
}
