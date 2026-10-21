// Guest progress lives on this device only (localStorage). No account needed.
// When accounts arrive, this module is the one place that will sync to the server.
const KEY = 'khaojai.v1';

const DEFAULTS = {
  done: {},            // stationId -> { best: accuracy %, at: ISO date }
  points: 0,           // Jai points (earned in lessons)
  today: { day: '', points: 0 },
  streak: 0, lastDay: '',
  words: [],           // collected Thai words
  speaker: 'man',      // which polite ending the learner uses: man → ครับ, woman → ค่ะ
  explainLang: 'English',
  adult: false,
  sound: true,
  plan: 'free',
  credits: 0,
  homework: []
};

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }; }
  catch (e) { return { ...DEFAULTS }; }
}

export const S = load();

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* private mode: keep going in memory */ }
}

export function resetAll() {
  Object.keys(S).forEach(k => delete S[k]);
  Object.assign(S, JSON.parse(JSON.stringify(DEFAULTS)));
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
