// Learner progress. Saved on this device (localStorage) and — when the learner is signed in —
// also saved to their account by auth.js, which listens to save().
import { SRS_DAYS, GOALS, PASS } from './config.js';

const KEY = 'khaojai.v3';

const DEFAULTS = {
  entered: '',          // '' (first visit) | 'guest' | 'account'
  noticeSeen: false,    // the "How KhaoJai teaches" notice
  profile: null,        // onboarding answers
  placed: false,        // took the placement check
  lessons: {},          // id -> { status, viewed, practiced, attempts, testBest, testLast, skills: {skill: [right, total]}, missed: [], via, passedAt }
  history: [],          // last assessments: { id, score, passed, at }
  cards: {},            // letter or vowel -> { box: 0-5, due, wrong, right }
  recite: { groups: {}, weak: [] },
  done: {},             // Real-life Thai stations
  points: 0, today: { day: '', points: 0 }, streak: 0, lastDay: '',
  words: [],
  rom: true, explainLang: 'English', adult: false, sound: true, unlockAll: false,
  plan: 'free', credits: 0, homework: [],
  updatedAt: 0
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...structuredClone(DEFAULTS), ...JSON.parse(raw) };
    // carry over settings and letter memory from v0.4 (lesson ids changed, so lesson progress starts fresh)
    const old = JSON.parse(localStorage.getItem('khaojai.v2') || 'null');
    const s = structuredClone(DEFAULTS);
    if (old) ['cards', 'recite', 'done', 'points', 'streak', 'lastDay', 'words', 'rom', 'sound', 'adult', 'plan', 'credits', 'homework'].forEach(k => { if (old[k] !== undefined) s[k] = old[k]; });
    return s;
  } catch (e) { return structuredClone(DEFAULTS); }
}

export const S = load();
const listeners = [];
export const onSave = fn => listeners.push(fn);

export function save(silent) {
  S.updatedAt = Date.now();
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ }
  if (!silent) listeners.forEach(fn => { try { fn(); } catch (e) {} });
}
// Replace everything (used when an account's saved progress is loaded).
export function replaceAll(data) {
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, structuredClone(DEFAULTS), data || {});
  save(true);
}
export function resetAll(keep = {}) { replaceAll({ ...keep }); save(); }
export const snapshot = () => JSON.parse(JSON.stringify(S));

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
export function addPoints(n) {
  const k = dayKey();
  if (S.today.day !== k) S.today = { day: k, points: 0 };
  S.today.points += n; S.points += n;
  if (S.lastDay !== k) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    S.streak = S.lastDay === dayKey(y) ? S.streak + 1 : 1;
    S.lastDay = k;
  }
  save();
}
export function todayPoints() { return S.today.day === dayKey() ? S.today.points : 0; }
export const dailyGoal = () => GOALS[S.profile?.minutes] || 50;

/* ---------- lesson status ----------
   not_started → viewed (opened the lesson) → practiced (finished the practice part)
   → passed (passed the test)  or  needs_review (took the test and did not pass yet) */
const rec = id => S.lessons[id] || (S.lessons[id] = { attempts: 0, testBest: 0, skills: {}, missed: [] });
export const lessonState = id => S.lessons[id]?.status || 'not_started';
export const isPassed = id => lessonState(id) === 'passed';
export function markViewed(id) { if (!id) return; const l = rec(id); l.viewed = true; if (!l.status) l.status = 'viewed'; save(); }
export function markPracticed(id) { if (!id) return; const l = rec(id); l.viewed = l.practiced = true; if (!l.status || l.status === 'viewed') l.status = 'practiced'; save(); }
export function recordTest(id, r) {
  if (!id) return;
  const l = rec(id);
  l.viewed = true; l.attempts++; l.testLast = r.score; l.testBest = Math.max(l.testBest || 0, r.score);
  l.skills = r.skills; l.missed = r.missed;
  if (r.passed) { l.status = 'passed'; l.passedAt = l.passedAt || Date.now(); }
  else if (l.status !== 'passed') l.status = 'needs_review';
  S.history.unshift({ id, score: r.score, passed: r.passed, at: Date.now() }); S.history = S.history.slice(0, 30);
  save();
}
export function markPlaced(id) { const l = rec(id); l.status = 'passed'; l.via = 'placement'; l.viewed = true; l.passedAt = Date.now(); }

// Did a test pass? Overall mark AND a minimum in every skill that had 2+ questions.
export function judge(skills, score, mark) {
  const weak = Object.entries(skills).filter(([, [r, t]]) => t >= 2 && r / t * 100 < PASS.skillMin).map(([k]) => k);
  return { passed: score >= mark && !weak.length, weak };
}

// Skill picture across all lessons: the most recent test of each lesson counts.
export function skillSummary() {
  const out = {};
  Object.values(S.lessons).forEach(l => Object.entries(l.skills || {}).forEach(([k, [r, t]]) => { const o = out[k] || (out[k] = { r: 0, t: 0 }); o.r += r; o.t += t; }));
  Object.values(out).forEach(o => o.pct = o.t ? Math.round(o.r / o.t * 100) : null);
  return out;
}

/* ---------- letter & vowel memory (spaced repetition, Leitner boxes) ---------- */
export function seeLetter(c, right) {
  const k = S.cards[c] || (S.cards[c] = { box: 0, due: 0, wrong: 0, right: 0 });
  if (right) { k.right++; k.box = Math.min(5, k.box + 1); }
  else { k.wrong++; k.box = Math.max(0, k.box - 2); }
  k.due = Date.now() + SRS_DAYS[k.box] * 864e5;
}
export const dueLetters = () => Object.entries(S.cards).filter(([, k]) => k.due <= Date.now()).map(([c]) => c);
export const troubleLetters = () => Object.entries(S.cards).filter(([, k]) => k.wrong > 0).sort((a, b) => (b[1].wrong - b[1].right / 3) - (a[1].wrong - a[1].right / 3)).slice(0, 8).map(([c]) => c);
export const knownLetters = isLetter => Object.entries(S.cards).filter(([c, k]) => k.box >= 3 && isLetter(c)).length;
