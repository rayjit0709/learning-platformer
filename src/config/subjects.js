// The subjects a player can choose. "difficulties" lists, for each question station
// of a level, how hard the question should be (1 easy to 3 harder).
export const SUBJECTS = {
  tamil: { id: 'tamil', labelKey: 'subject.tamil', difficulties: [1, 1, 2, 2] },
  math: { id: 'math', labelKey: 'subject.math', difficulties: [1, 2, 2, 3] },
};
export const DEFAULT_SUBJECT = 'tamil';
