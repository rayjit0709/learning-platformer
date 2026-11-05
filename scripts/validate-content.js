// Checks every question file under public/content for mistakes.
// Run with: npm run content   (also runs automatically before every build)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath keeps folder names with spaces working (a plain .pathname would turn a space into %20)
const ROOT = fileURLToPath(new URL('../public/content', import.meta.url));
const REQUIRED_LANGS = ['fr', 'en'];
const SUPPORTED_TYPES = ['multiple-choice']; // more types arrive in later milestones

const errors = [];
const warnings = [];
const seenIds = new Map();
let fileCount = 0;
let questionCount = 0;
let unreviewedFiles = 0;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return name.endsWith('.json') && !name.startsWith('_') && name !== 'index.json' ? [full] : [];
  });
}

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
  if (q.status === 'to be verified') warnings.push(`${label}: marked "to be verified"`);
  questionCount += 1;
}

for (const file of walk(ROOT)) {
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
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push(`${name}: needs a non-empty "questions" list`);
    continue;
  }
  data.questions.forEach((q, i) => checkQuestion(q, i, name));
}

console.log(`Checked ${fileCount} file(s), ${questionCount} question(s).`);
if (unreviewedFiles > 0) warnings.push(`${unreviewedFiles} file(s) not yet reviewed by a teacher or parent ("reviewed": false)`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const e of errors) console.log(`  ERROR: ${e}`);
if (errors.length > 0) {
  console.log(`\n${errors.length} error(s). Fix them and run "npm run content" again.`);
  process.exit(1);
}
console.log('Content OK.');
