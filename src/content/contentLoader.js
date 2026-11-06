import { QUESTIONS_INDEX_KEY, fileKey, assetUrl } from '../config/content.js';
import { chosenAccent, resolveAudio } from '../config/voices.js';

// The index lists every content file that exists (see scripts/build-content-index.js).
export function readIndex(scene) {
  return scene.cache.json.get(QUESTIONS_INDEX_KEY) || { files: [], audio: {} };
}

// Queue (for the loader) every content file of a subject. Call it from preload().
export function queueSubject(scene, subject) {
  for (const file of readIndex(scene).files) {
    if (file.subject === subject) scene.load.json(fileKey(file.path), assetUrl(file.path));
  }
}

// Gathers what was loaded for a subject: explicit questions and vocabulary entries.
// A file that failed to load is skipped, so one missing file never breaks the game.
export function collectSubject(scene, subject) {
  const index = readIndex(scene);
  const questions = [];
  const entries = [];
  const categories = {};
  for (const file of index.files) {
    if (file.subject !== subject) continue;
    const data = scene.cache.json.get(fileKey(file.path));
    if (!data) continue;
    if (file.type === 'questions') questions.push(...data.questions);
    if (file.type === 'vocab') {
      Object.assign(categories, data.meta && data.meta.categories);
      // Packs come first, so a word that is both in the class pack and in the starter list is used once, in its class version
      entries.push(...data.entries.map((e) => ({ ...e, pack: file.pack })));
    }
  }
  entries.sort((a, b) => Number(Boolean(b.pack)) - Number(Boolean(a.pack)));
  const audio = Object.fromEntries(Object.entries(resolveAudio(index.audio, chosenAccent())).map(([id, path]) => [id, assetUrl(path)]));
  return { questions, entries: dedupe(entries), categories, audio };
}

export function dedupe(entries) {
  const seen = new Set();
  return entries.filter((e) => {
    const key = `${e['ta-Latn'].toLowerCase()}|${e.fr.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// "Did you know" facts shown after a level. Same loading rules as above: a missing file just means no facts.
export function collectFacts(scene) {
  const facts = [];
  for (const file of readIndex(scene).files) {
    if (file.type !== 'facts') continue;
    const data = scene.cache.json.get(fileKey(file.path));
    if (data) facts.push(...data.facts);
  }
  return facts;
}
