// Checks every question file under public/content for mistakes.
// Run with: npm run content   (also runs automatically before every build)
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { CONTENT_DIR as ROOT, walkContent } from './content-lib.js';
const REQUIRED_LANGS = ['fr', 'en'];
const SUPPORTED_TYPES = ['multiple-choice']; // more types arrive in later milestones

const errors = [];
const warnings = [];
const seenIds = new Map();
let fileCount = 0;
let questionCount = 0;
let unreviewedFiles = 0;
let vocabCount = 0;
const seenVocabIds = new Map();
const categoryLabels = new Set();
const usedCategories = new Map();

function checkText(obj, where, file) {
  if (!obj || typeof obj !== 'object') return errors.push(`${file}: ${where} must be an object like {"fr": "...", "en": "..."}`);
  for (const lang of REQUIRED_LANGS) {
    if (typeof obj[lang] !== 'string' || obj[lang].trim() === '') errors.push(`${file}: ${where} is missing the "${lang}" text`);
  }
}

function checkQuestion(q, index, file) {
  const label = `${file}: question #${index + 1}${q && q.id ? ` (${q.id})` : ''}`;
  if (!q || typeof q !== 'object') return errors.push(`${label} is not an object`);
  if (typeof q.id !== 'string' || q.id === '') errors.push(`${label} has no "id"`);
  else if (seenIds.has(q.id)) errors.push(`${label}: id already used in ${seenIds.get(q.id)}`);
  else seenIds.set(q.id, file);

  if (!SUPPORTED_TYPES.includes(q.type)) errors.push(`${label}: type "${q.type}" is not supported yet (use: ${SUPPORTED_TYPES.join(', ')})`);
  checkText(q.prompt, 'prompt', label);
  checkText(q.hint, 'hint', label);

  if (!Array.isArray(q.choices) || q.choices.length < 2 || q.choices.length > 4) {
    errors.push(`${label}: "choices" must be a list of 2 to 4 answers`);
  } else {
    const keys = q.choices.map((c) => JSON.stringify(c));
    if (new Set(keys).size !== keys.length) errors.push(`${label}: two choices are identical`);
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.choices.length) {
      errors.push(`${label}: "answer" must be the position of the right choice (0 = first), between 0 and ${q.choices.length - 1}`);
    }
    for (const c of q.choices) {
      if (c !== null && typeof c === 'object') checkText(c, 'a choice', label);
    }
  }
  if (q.difficulty !== undefined && ![1, 2, 3].includes(q.difficulty)) errors.push(`${label}: "difficulty" must be 1, 2 or 3`);
  if (q.status === 'to be verified') unverifiedQuestions += 1;
  questionCount += 1;
}

function checkVocabEntry(v, index, file) {
  const label = `${file}: entry #${index + 1}${v && v.id ? ` (${v.id})` : ''}`;
  if (!v || typeof v !== 'object') return errors.push(`${label} is not an object`);
  if (typeof v.id !== 'string' || v.id === '') errors.push(`${label} has no "id"`);
  else if (seenVocabIds.has(v.id)) errors.push(`${label}: id already used in ${seenVocabIds.get(v.id)}`);
  else seenVocabIds.set(v.id, file);
  for (const key of ['category', 'ta-Latn', 'fr', 'en']) {
    if (typeof v[key] !== 'string' || v[key].trim() === '') errors.push(`${label}: missing "${key}"`);
  }
  if (v['ta-Taml'] !== undefined && typeof v['ta-Taml'] !== 'string') errors.push(`${label}: "ta-Taml" must be text`);
  if (typeof v.category === 'string') usedCategories.set(v.category, file);
  if (v.status === 'to be verified') unverifiedVocab += 1;
  vocabCount += 1;
}
let unverifiedVocab = 0;
let unverifiedQuestions = 0;

for (const file of walkContent()) {
  const name = relative(ROOT, file);
  fileCount += 1;
  let data;
  try {
    data = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${name}: not valid JSON (${e.message})`);
    continue;
  }
  if (!data.meta || data.meta.reviewed !== true) unreviewedFiles += 1;
  if (data.meta && data.meta.categories) Object.keys(data.meta.categories).forEach((c) => categoryLabels.add(c));
  if (Array.isArray(data.entries)) {
    if (data.entries.length === 0) errors.push(`${name}: "entries" is empty`);
    data.entries.forEach((v, i) => checkVocabEntry(v, i, name));
    continue;
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push(`${name}: needs a non-empty "questions" list (or an "entries" list for a vocabulary file)`);
    continue;
  }
  data.questions.forEach((q, i) => checkQuestion(q, i, name));
}

for (const [category, file] of usedCategories) {
  if (!categoryLabels.has(category)) warnings.push(`category "${category}" (used in ${file}) has no label in any "meta.categories", so hints for it will be generic`);
}
if (unverifiedQuestions > 0) warnings.push(`${unverifiedQuestions} question(s) still "to be verified"`);
if (unverifiedVocab > 0) warnings.push(`${unverifiedVocab} vocabulary entr${unverifiedVocab === 1 ? 'y is' : 'ies are'} still "to be verified" by a native speaker`);
console.log(`Checked ${fileCount} file(s): ${questionCount} question(s), ${vocabCount} vocabulary entr${vocabCount === 1 ? 'y' : 'ies'}.`);
if (unreviewedFiles > 0) warnings.push(`${unreviewedFiles} file(s) not yet reviewed by a teacher or parent ("reviewed": false)`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const e of errors) console.log(`  ERROR: ${e}`);
if (errors.length > 0) {
  console.log(`\n${errors.length} error(s). Fix them and run "npm run content" again.`);
  process.exit(1);
}
console.log('Content OK.');
