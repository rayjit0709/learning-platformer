// The Tamil voices a player can choose between ("accent"):
// "in" = Tamil as spoken in India, "lk" = Tamil as spoken in Sri Lanka (Eelam).
// The clips themselves are made by tools/make-voices.js; "family" clips (recorded by a person) are the fallback.
import { getSetting } from '../services/settings.js';

export const ACCENTS = [
  { id: 'in', labelKey: 'accent.in' },
  { id: 'lk', labelKey: 'accent.lk' },
];
export const DEFAULT_ACCENT = 'in';

export function chosenAccent() {
  const saved = getSetting('accent');
  return ACCENTS.some((a) => a.id === saved) ? saved : DEFAULT_ACCENT;
}

// index.audio looks like { in: {id: path}, lk: {...}, family: {...} } (an older flat { id: path } also works).
// Returns one { id: path } map: the chosen accent first, then recordings by a person, then the other accent.
export function resolveAudio(indexAudio, accent) {
  const source = indexAudio || {};
  const grouped = Object.values(source).some((v) => v && typeof v === 'object') ? source : { family: source };
  const other = accent === 'in' ? 'lk' : 'in';
  const resolved = {};
  for (const voice of [other, 'family', accent]) Object.assign(resolved, grouped[voice]); // the last one wins
  return resolved;
}

// True when at least one generated voice exists (otherwise the accent choice would change nothing)
export function hasAccentVoices(indexAudio) {
  const source = indexAudio || {};
  return ACCENTS.some((a) => source[a.id] && Object.keys(source[a.id]).length > 0);
}
