import fr from './fr.json';
import en from './en.json';
import { getSetting } from '../services/settings.js';

// Interface texts. To add a language: add a new json file and list it here.
// The language switch on the start screen saves the choice; ?lang=en in the address overrides it.
const DICTIONARIES = { fr, en };

export function currentLang() {
  const fromAddress = new URLSearchParams(location.search).get('lang');
  if (DICTIONARIES[fromAddress]) return fromAddress;
  const saved = getSetting('lang');
  return DICTIONARIES[saved] ? saved : 'fr'; // French first
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
