// Passing thresholds (percent of first-try correct answers). Change them here — nowhere else.
//
// Why these numbers:
// - LESSON 80: a learner who gets 4 of 5 right on the first try has the idea; the misses come back
//   in review and in spaced repetition, so 100% is not required to move on.
// - RECOGNITION 85: knowing the letters is the base for everything after it. Mistakes here multiply
//   in reading, so the bar is a little higher.
// - LISTENING 80: the current voice is the device's synthetic Thai voice, which is less clear than a
//   native speaker; the bar allows for that until recorded audio is added.
// - READING 80: reading is new and harder; 80% shows the learner can decode most syllables alone.
// - WRITING 75: spelling is checked exactly, but handwriting is checked only approximately (shape
//   overlap), so the writing bar is slightly lower.
// - TRACE 60 / WRITE 50: minimum shape-overlap score for one traced / free-hand character.
//   These are approximate checks — see docs/CURRICULUM.md ("Handwriting check").
export const PASS = {
  lesson: 80,
  recognition: 85,
  listening: 80,
  reading: 80,
  writing: 75,
  trace: 60,
  write: 50
};

// Spaced-repetition intervals per box (in days) for letter review.
export const SRS_DAYS = [0, 1, 2, 4, 8, 16];
