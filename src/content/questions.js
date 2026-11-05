import { localized } from '../i18n/index.js';

// True when the loaded JSON looks like a usable question file.
export function isValidQuestionFile(data) {
  return Boolean(data) && Array.isArray(data.questions) && data.questions.length > 0;
}

// Picks one random question per wanted difficulty, e.g. [1, 2, 2, 3].
// If a difficulty has no question left, any unused question is used instead.
export function pickQuestions(questions, difficulties) {
  const used = new Set();
  const picked = [];
  for (const wanted of difficulties) {
    let pool = questions.filter((q) => (q.difficulty ?? 1) === wanted && !used.has(q.id));
    if (pool.length === 0) pool = questions.filter((q) => !used.has(q.id));
    if (pool.length === 0) break;
    const q = pool[Math.floor(Math.random() * pool.length)];
    used.add(q.id);
    picked.push(q);
  }
  return picked;
}

// Turns a raw question into what the game shows: texts in the current language
// and the answer choices in a random order (so the right one is not always first).
export function prepareQuestion(raw) {
  const order = raw.choices.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    id: raw.id,
    prompt: localized(raw.prompt),
    hint: localized(raw.hint),
    choices: order.map((i) => localized(raw.choices[i])),
    answerIndex: order.indexOf(raw.answer),
  };
}
