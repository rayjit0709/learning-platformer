// Builds quiz questions from a vocabulary list. Adding words to a vocabulary file
// automatically adds questions: no code change needed.

function pick(list, count) {
  const copy = [...list];
  const out = [];
  while (out.length < count && copy.length > 0) out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  return out;
}

// Wrong answers: other words, preferably from the same category.
function distractors(entry, entries, same) {
  const others = entries.filter((o) => o.id !== entry.id && o.fr.toLowerCase() !== entry.fr.toLowerCase() && same(o, entry));
  return pick(others, 2);
}

const sameCategory = (a, b) => a.category === b.category;
const anyWord = () => true;

function withWrongAnswers(entry, entries, same) {
  let wrong = distractors(entry, entries, same);
  if (wrong.length < 2) wrong = distractors(entry, entries, anyWord);
  return wrong;
}

function firstLetter(entry) {
  return entry['ta-Latn'].trim().charAt(0).toLowerCase();
}

// categoryLabels: { animals: { fr: 'un animal', en: 'an animal' }, ... }
// audio: { wordId: url } for the recordings that exist
export function buildVocabQuestions(entries, categoryLabels, audio = {}) {
  const questions = [];
  for (const entry of entries) {
    const label = categoryLabels[entry.category];
    const tamil = entry['ta-Taml'] ? `${entry["ta-Taml"]} (${entry["ta-Latn"]})` : entry['ta-Latn'];
    const audioUrl = audio[entry.id];

    // 1) Tamil -> meaning (easy): shows the Tamil word, choose what it means
    const wrongMeanings = withWrongAnswers(entry, entries, sameCategory);
    if (wrongMeanings.length === 2) {
      const meaningChoices = [entry, ...wrongMeanings].map((m) => ({ fr: m.fr, en: m.en }));
      const hint = label
        ? { fr: `C'est ${label.fr}.`, en: `It is ${label.en}.` }
        : { fr: 'Lis le mot à voix haute.', en: 'Say the word out loud.' };
      questions.push({
        id: `ta2fr:${entry.id}`, group: entry.id, type: 'multiple-choice', difficulty: 1,
        prompt: { fr: `Que veut dire « ${tamil} » ?`, en: `What does “${tamil}” mean?` },
        choices: meaningChoices, answer: 0, hint, audio: audioUrl,
      });

      // 2) Listen -> meaning (harder): the word is not shown, only played. Needs a recording.
      if (audioUrl) {
        questions.push({
          id: `listen:${entry.id}`, group: entry.id, type: 'multiple-choice', difficulty: 3, hideText: true,
          prompt: { fr: 'Écoute, puis choisis le sens', en: 'Listen, then choose the meaning' },
          choices: meaningChoices, answer: 0, hint, audio: audioUrl,
        });
      }
    }

    // 3) Meaning -> Tamil (medium): choose how to say it, among transliterations
    const wrongWords = withWrongAnswers(entry, entries, sameCategory);
    if (wrongWords.length === 2) {
      questions.push({
        id: `fr2ta:${entry.id}`, group: entry.id, type: 'multiple-choice', difficulty: 2,
        prompt: { fr: `Comment dit-on « ${entry.fr} » en tamoul ?`, en: `How do you say “${entry.en}” in Tamil?` },
        choices: [entry, ...wrongWords].map((w) => w['ta-Latn']), answer: 0,
        hint: { fr: `Ça commence par « ${firstLetter(entry)} ».`, en: `It starts with “${firstLetter(entry)}”.` },
        audio: audioUrl,
      });
    }
  }
  return questions;
}
