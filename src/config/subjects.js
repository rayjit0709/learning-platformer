// The subjects a player can choose.
// (How hard each level is lives in game/levelData.js.)
export const SUBJECTS = {
  tamil: { id: 'tamil', labelKey: 'subject.tamil' },
  math: { id: 'math', labelKey: 'subject.math' },
};
export const DEFAULT_SUBJECT = 'tamil';

// How advanced each vocabulary category is (1 easy, 3 hardest). Early levels use the easiest words only.
// A category not listed here counts as tier 2.
export const WORD_TIERS = {
  numbers: 1, colors: 1, animals: 1, family: 1, food: 1, greetings: 1,
  phrases: 2, commands: 2, pronouns: 2, questions: 2, possessives: 2,
  sentences: 3,
};
