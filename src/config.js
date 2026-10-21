// Passing thresholds (percent of first-try correct answers in a TEST). Change them here — nowhere else.
// Practice questions never decide a pass; only the test at the end of a lesson does.
//
// Why these numbers:
// - LESSON 80: getting 4 of 5 test questions right on the first try shows the learner has the idea.
//   The misses are practised again in targeted review and come back in spaced repetition.
// - SKILL_MIN 60: a lesson also needs at least 60% in EACH skill it tests (when that skill has
//   2 or more questions). A high overall score can't hide one weak skill — e.g. knowing the letter
//   shapes but not their sounds.
// - REVIEW 80: mixed reviews cover older material, so the bar matches a lesson.
// - Phase checks: consonants 85 (everything else builds on them), sounds 80 (the device voice is
//   synthetic and less clear than a native speaker), vowels 80, reading 80 (romanization hidden).
// - TRACE 60: minimum overlap with the grey guide letter when tracing.
// - WRITE 80: free-hand writing is compared with ALL letters; it passes only if the target letter is
//   among the 3 closest matches AND its match score is at least 80. In our tests a neat letter scored
//   90+ and ranked 1st–3rd, while scribbles usually ranked far down. Approximate — see docs/CURRICULUM.md.
export const PASS = {
  lesson: 80,
  skillMin: 60,
  review: 80,
  consonants: 85,
  sounds: 80,
  vowels: 80,
  reading: 80,
  rules: 80,
  trace: 60,
  write: 80
};

// Skill levels on the dashboard (percent right in the most recent tests of that skill).
export const LEVEL = { strong: 85, developing: 60 };

// Spaced-repetition intervals per box (in days) for letter review.
export const SRS_DAYS = [0, 1, 2, 4, 8, 16];

// Daily goal (points) for each "minutes per day" choice in onboarding.
export const GOALS = { 5: 30, 10: 50, 15: 80, 20: 120 };

// Accounts (optional). KhaoJai uses Supabase for sign-in and to save progress to an account.
// Leave these empty and the app runs in guest mode only, and says so on the sign-in screen.
// Setup steps: docs/AUTH_SETUP.md. The "anon public" key is designed to be public; it is safe in
// the website because Row Level Security in the database only lets each learner read their own row.
// The project must be created with KhaoJai's own email (sataporn.yodp@gmail.com).
export const SUPABASE_URL = 'https://pymcvjgdeceocfqychik.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_CvwBO4I2RhzkcHru_OWmiw_5wWO-xf1';
