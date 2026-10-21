// Guest progress lives on this device only (localStorage). No account needed.
// When accounts arrive, this module is the one place that will sync to the server.
import { SRS_DAYS } from './config.js';

const KEY = 'khaojai.v2';

const DEFAULTS = {
  lessons: {},         // lessonId -> { status: 'in_progress'|'needs_practice'|'completed', best, last, attempts, missed: [] }
  cards: {},           // letter -> { box: 0-5, due: epoch ms, wrong: n, right: n }
  recite: { groups: {}, weak: [] },   // groupIndex -> { attempts, last, recorded }
  done: {},            // stationId -> { best } — Real-life Thai stations (unlocked after the foundation)
  points: 0,
  today: { day: '', points: 0 },
  streak: 0, lastDay: '',
  words: [],
  rom: true,           // show romanization by default in beginner lessons
  explainLang: 'English',
  adult: false,
  sound: true,
  unlockAll: false,    // testing helper
  plan: 'free',
  credits: 0,
  homework: []
};

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : structuredClone(DEFAULTS); }
  catch (e) { return structuredClone(DEFAULTS); }
}

export const S = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ }
}

export function resetAll() {
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, structuredClone(DEFAULTS));
  save();
}

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
export const DAILY_GOAL = 50;

/* ---------- lesson status ---------- */
export const lessonState = id => S.lessons[id]?.status || 'not_started';
export function markStarted(id) {
  if (!id) return;
  const l = S.lessons[id] || (S.lessons[id] = { attempts: 0, best: 0, missed: [] });
  if (!l.status) l.status = 'in_progress';
  save();
}
export function recordResult(id, score, pass, missed) {
  if (!id) return;
  const l = S.lessons[id] || (S.lessons[id] = { attempts: 0, best: 0, missed: [] });
  l.attempts++; l.last = score; l.best = Math.max(l.best || 0, score); l.missed = missed;
  if (score >= pass) l.status = 'completed';
  else if (l.status !== 'completed') l.status = 'needs_practice';
  save();
}

/* ---------- letter memory (spaced repetition, Leitner boxes) ---------- */
export function seeLetter(c, right) {
  const k = S.cards[c] || (S.cards[c] = { box: 0, due: 0, wrong: 0, right: 0 });
  if (right) { k.right++; k.box = Math.min(5, k.box + 1); }
  else { k.wrong++; k.box = Math.max(0, k.box - 2); }
  k.due = Date.now() + SRS_DAYS[k.box] * 864e5;
}
export const dueLetters = () => Object.entries(S.cards).filter(([, k]) => k.due <= Date.now()).map(([c]) => c);
export const troubleLetters = () => Object.entries(S.cards).filter(([, k]) => k.wrong > 0).sort((a, b) => (b[1].wrong - b[1].right / 3) - (a[1].wrong - a[1].right / 3)).slice(0, 8).map(([c]) => c);
export const knownLetters = () => Object.values(S.cards).filter(k => k.box >= 3).length;
