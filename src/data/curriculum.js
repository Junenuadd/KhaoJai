// The KhaoJai curriculum: phases → lessons → steps.
// Phase 1 Reading Foundations · Phase 2 Reading Rules · Phase 3 Vocabulary & Meaning (later)
// Phase 4 Sentences & Grammar (later) · Phase 5 Listening, Speaking & Real-life Thai.
//
// Every lesson has two parts:
//   teach() — Learn → Listen → Recognize → Practice → Recall (practice is tracked but never decides a pass)
//   test()  — the end-of-lesson assessment. Questions are generated fresh each time, so a retake is a new test.
// Every scored step carries a `skill` so results can be tracked per skill, and usually a `key`
// (a letter, vowel or syllable) so missed items can be practised and reviewed later.
//
// Step types: intro · card (letter) · vcard (vowel) · info · recall · choose · listen · match · build · tone · trace · write
import { LETTERS, L, nameOf, SOUNDS, FINALS, LOOKALIKES, SAME_SOUND, VOWELS, vowelSet, CLASS_INFO } from './letters.js';
import { ASSOC, ASSOC_READY, ASSOC_OLD } from './associations.js';
import { PASS } from '../config.js';
import { TOPICS } from './vocab.js';
import { GRAMMAR, CULTURE, CHAT, PRACTICAL } from './courses.js';
import { STATIONS, WORDS as BEYOND_WORDS, TIME_DRILL } from './beyond.js';

/* ---------- skills ---------- */
export const SKILLS = {
  shape:   { label: 'Recognize consonant shapes', short: 'Shapes' },
  name:    { label: 'Know consonant names', short: 'Names' },
  sound:   { label: 'Match sounds to letters', short: 'Sounds' },
  discrim: { label: 'Hear similar sounds apart', short: 'Similar sounds' },
  vowel:   { label: 'Recognize vowels', short: 'Vowels' },
  combo:   { label: 'Combine consonant + vowel', short: 'Combining' },
  final:   { label: 'Read end sounds', short: 'End sounds' },
  read:    { label: 'Read without romanization', short: 'Reading' },
  tone:    { label: 'Work out tones', short: 'Tones' },
  write:   { label: 'Write letters (approximate check)', short: 'Writing' },
  assoc:   { label: 'Link English letters to Thai letters', short: 'English links' },
  meaning: { label: 'Know word meanings', short: 'Meanings' },
  listen:  { label: 'Understand spoken Thai', short: 'Listening' },
  spell:   { label: 'Spell words correctly', short: 'Spelling' },
  grammar: { label: 'Build sentences', short: 'Grammar' },
  convo:   { label: 'Reply in conversations', short: 'Conversation' },
  context: { label: 'Choose words for the situation', short: 'Real Thai' },
  chat:    { label: 'Read chat and slang', short: 'Chat Thai' },
  practical: { label: 'Read real-life Thai', short: 'Real-life reading' }
};
export const PHASE1_SKILLS = ['shape', 'name', 'sound', 'discrim', 'vowel', 'combo', 'final', 'read'];

/* ---------- helpers ---------- */
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);
const uniq = a => a.filter((x, i) => a.indexOf(x) === i);
const ALL = LETTERS.map(x => x.c);
const MODERN = LETTERS.filter(x => !x.old).map(x => x.c);
const V = Object.fromEntries(VOWELS.map(v => [v.v, v]));
export const isVowelKey = k => !!V[k];

// 4-option question. `pool` gives distractors; `keyOf` makes values comparable (e.g. romanization).
function opts(answer, pool, make, n = 4, keyOf = x => x) {
  const ak = keyOf(answer);
  const others = pick(uniq(pool.filter(x => keyOf(x) !== ak)).filter((x, i, a) => a.findIndex(y => keyOf(y) === keyOf(x)) === i), n - 1);
  const list = shuffle([answer, ...others]);
  return { o: list.map(make), a: list.indexOf(answer) };
}
const asChar = c => [c, ''];
const asName = c => [`${L[c].say} ${L[c].word}`, L[c].rom];
const asText = x => [x, ''];
function distractorsFor(c, group = []) {
  // prefer look-alikes and same-sound letters so questions test real recognition
  const near = new Set(group);
  LOOKALIKES.forEach(s => s.includes(c) && s.forEach(x => near.add(x)));
  SAME_SOUND.forEach(s => s.letters.includes(c) && s.letters.forEach(x => near.add(x)));
  const pool = [...near].filter(x => x !== c);
  return pool.length >= 3 ? pool : [...pool, ...pick(MODERN.filter(x => x !== c && !pool.includes(x)), 3 - pool.length)];
}

/* ---------- syllables (consonant + vowel) ---------- */
const onset = c => c === 'อ' ? '' : SOUNDS[L[c].snd].rom;
export function syl(c, v) {
  const vv = V[v];
  return { th: vv.v.replace('อ', c), rom: onset(c) + vv.rom, c, v, len: vv.len };
}
const COMBO_OK = c => c !== 'อ' && !L[c].old;
function comboPool(cons, vows) {
  const out = [];
  cons.filter(COMBO_OK).forEach(c => vows.filter(v => v !== 'ฤ').forEach(v => out.push(syl(c, v))));
  return out;
}

/* ---------- question makers ---------- */
const T = (step, test) => test ? { ...step, test: true, phase: 'Test' } : { ...step, phase: step.phase || 'Practice' };

const qShape = (c, group, test) => T({ t: 'choose', skill: 'shape', key: c, big: true,
  q: 'Which letter is this?', prompt: { th: nameOf(c), rom: L[c].rom, en: L[c].en, pic: L[c].pic },
  ...opts(c, distractorsFor(c, group), asChar),
  why: `${c} is called "${nameOf(c)}" (${L[c].rom}) — ${L[c].word} means ${L[c].en}.` }, test);

const qName = (c, group, test) => T({ t: 'choose', skill: 'name', key: c, thai: true,
  q: 'What is this letter called?', show: c,
  ...opts(c, distractorsFor(c, group), asName),
  why: `${c} = "${nameOf(c)}" (${L[c].rom}). Picture: ${L[c].pic} ${L[c].en}.` }, test);

const qSound = (c, group, test) => T({ t: 'listen', skill: 'sound', key: c, big: true,
  say: nameOf(c), sayRom: L[c].rom,
  ...opts(c, distractorsFor(c, group), asChar),
  why: `You heard "${nameOf(c)}" (${L[c].rom}) — that is ${c}.` }, test);

const qPic = (c, group, test) => T({ t: 'choose', skill: 'shape', key: c, big: true,
  q: 'Which letter goes with this picture word?', prompt: { pic: L[c].pic, th: L[c].word, rom: L[c].rom.split(' ').slice(1).join(' '), en: L[c].en },
  ...opts(c, distractorsFor(c, group), asChar),
  why: `${L[c].word} (${L[c].en}) is the name word for ${c}: "${nameOf(c)}".` }, test);

const qRecall = c => ({ t: 'recall', phase: 'Recall', skill: 'name', key: c, score: false });

const qDiscrim = (a, b, test) => { const c = Math.random() < .5 ? a : b; return T({ t: 'listen', skill: 'discrim', key: c, big: true,
  say: nameOf(c), sayRom: L[c].rom, o: [asChar(a), asChar(b)], a: c === a ? 0 : 1,
  why: `${a} = "${nameOf(a)}" (${L[a].rom}) · ${b} = "${nameOf(b)}" (${L[b].rom}). You heard ${c}.` }, test); };

const vName = v => `${v.v} · ${v.rom} (${v.len})`;
const qVowelSee = (v, pool, test) => T({ t: 'choose', skill: 'vowel', key: v.v, q: 'How does this vowel sound?', show: v.v, showNoSay: true,
  ...opts(v, pool, x => [`${x.rom} · ${x.len}`, ''], 4, x => x.rom + x.len),
  why: `${v.v} = "${v.rom}" (${v.len}). It is written ${v.pos === 'alone' ? 'on its own' : v.pos + ' the consonant'}.${v.note ? ' ' + v.note : ''}` }, test);

const qVowelPick = (v, pool, test) => T({ t: 'choose', skill: 'vowel', key: v.v, big: true, q: `Which vowel says "${v.rom}" (${v.len})?`,
  ...opts(v, pool, x => [x.v, ''], 4, x => x.v),
  why: `${vName(v)}. อ only shows where the consonant goes.` }, test);

function qCombo(s, pool, test, hide = true) {
  return T({ t: 'choose', skill: 'combo', key: s.th, combo: { c: s.c, v: s.v }, q: 'Read it. How does it sound?', show: s.th, hideRom: hide, noSayBefore: true,
    ...opts(s, pool, x => [x.rom, ''], 4, x => x.rom),
    why: `${s.th} = ${s.c} (${onset(s.c) || 'silent'}) + ${s.v} (${V[s.v].rom}, ${s.len}) → "${s.rom}". Say the consonant first, wherever the vowel is written.`, sayAfter: s.th }, test);
}

function qWord(w, pool, test, skill = 'read', hide = true) {
  return T({ t: 'choose', skill, key: w.th, q: 'Read it. How does it sound?', show: w.th, hideRom: hide, noSayBefore: true,
    ...opts(w, pool, x => [x.rom, ''], 4, x => x.rom),
    why: `${w.th} = "${w.rom}"${w.en ? ` — it means "${w.en}" (you don't need to learn the meaning yet)` : ''}.`, sayAfter: w.th }, test);
}

const matchSet = letters => ({ t: 'match', phase: 'Practice', skill: 'name', keys: letters, pairs: letters.map(c => [c, `${L[c].pic} ${L[c].en}`]) });

const intro = (learn, how) => ({ t: 'intro', score: false, learn, how });
const TEST_HOW = (mark = PASS.lesson) => `Test: at least ${mark}% right on the first try (and ${PASS.skillMin}% in each skill) to pass`;

/* =========================================================
   PHASE 1 — READING FOUNDATIONS
   ========================================================= */
export const GROUPS = [
  ['ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ'], ['ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ'], ['ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ'], ['ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ'],
  ['น', 'บ', 'ป', 'ผ', 'ฝ', 'พ'], ['ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล'], ['ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ']
];
const known = gi => GROUPS.slice(0, gi + 1).flat();

function consonantLesson(gi) {
  const g = GROUPS[gi], prev = GROUPS.slice(0, gi).flat();
  return {
    skills: ['shape', 'name', 'sound'],
    teach: () => {
      const steps = [intro(
        [`${g.length} consonants: ${g.join(' ')}`, 'The Thai name of each letter, e.g. "ก ไก่" (gor gai)', 'An English letter that helps you remember each one', 'A picture word and the sound of each letter'],
        ['Learn each letter card and listen', 'Practise: find the letter, listen, match, recall', TEST_HOW()])];
      g.forEach(c => steps.push({ t: 'card', c, score: false, key: c }));
      steps.push({ t: 'info', score: false, title: 'English helpers for these letters', text: 'These English letters are memory aids, not exact sounds. Listen to the Thai audio to learn the real sound.',
        rows: g.map(c => [c, `${L[c].eng}`, L[c].tip]) });
      shuffle(g).forEach(c => steps.push(qShape(c, g)));
      shuffle(g).forEach(c => steps.push(qSound(c, g)));
      steps.push(matchSet(pick(g, Math.min(5, g.length))));
      pick(g, 3).forEach(c => steps.push(qRecall(c)));
      return steps;
    },
    test: () => {
      const steps = [];
      shuffle(g).forEach((c, i) => steps.push(i % 2 ? qName(c, g, true) : qPic(c, g, true)));
      pick(g, Math.min(4, g.length)).forEach(c => steps.push(qSound(c, g, true)));
      if (prev.length) pick(prev, 2).forEach(c => steps.push(qName(c, prev, true)));
      return shuffle(steps);
    },
    place: () => pick(g.filter(c => !L[c].old), 2).map((c, i) => i ? qName(c, g, true) : qShape(c, g, true))
  };
}

function vowelLesson(set, gi, extraInfo) {
  const vs = vowelSet(set), cons = known(gi).filter(COMBO_OK);
  const pool = VOWELS.filter(v => v.set <= Math.max(set, 2));
  return {
    skills: ['vowel', 'combo'],
    teach: () => {
      const steps = [intro(
        [`Vowels: ${vs.map(v => v.v).join('  ')}`, 'Where each vowel is written around the consonant', 'How to read a consonant + vowel together'],
        ['Learn each vowel and listen to the examples', 'Practise reading syllables made from letters you already know', TEST_HOW()])];
      if (extraInfo) steps.push(extraInfo);
      vs.forEach(v => steps.push({ t: 'vcard', v, score: false, key: v.v, cons: pick(cons, 3) }));
      vs.forEach(v => steps.push(qVowelPick(v, pool)));
      pick(comboPool(cons, vs.map(v => v.v)), 5).forEach(s => steps.push(qCombo(s, comboPool(cons, pool.map(v => v.v)), false, false)));
      return steps;
    },
    test: () => {
      const steps = vs.map(v => qVowelSee(v, pool, true));
      const all = comboPool(cons, pool.map(v => v.v));
      pick(comboPool(cons, vs.map(v => v.v)), Math.max(4, Math.min(6, vs.length + 2))).forEach(s => steps.push(qCombo(s, all, true)));
      return shuffle(steps);
    },
    place: () => [qVowelSee(vs[rnd(vs.length)], pool, true)]
  };
}

const POSITIONS_INFO = { t: 'info', score: false, title: 'Vowels go around the consonant',
  text: 'A Thai vowel can be written after, above, below or before the consonant — but you always SAY the consonant first. อ is used here only to show where the consonant goes.',
  examples: [['กา', 'gaa', 'า after'], ['กี', 'gee', 'ี above'], ['กู', 'goo', 'ู below'], ['เก', 'geh', 'เ before — still say ก first']] };
const LENGTH_INFO = { t: 'info', score: false, title: 'Short and long vowels',
  text: 'Many vowels come in pairs: a short one and a long one. Length changes the meaning of a word, so hold long vowels a little longer. KhaoJai writes long vowels with a doubled letter where it can: a / aa, i / ee, u / oo.',
  rows: [['อะ  ·  อา', 'a  ·  aa', 'short · long'], ['อิ  ·  อี', 'i  ·  ee', 'short · long'], ['อุ  ·  อู', 'u  ·  oo', 'short · long']] };
const BEFORE_INFO = { t: 'info', score: false, title: 'Vowels written before the consonant',
  text: 'เ แ โ are written BEFORE the consonant but said AFTER it. The short versions add ะ at the end.',
  examples: [['เท', 'teh', 'long'], ['เตะ', 'dte', 'short'], ['แม', 'mae', 'long'], ['โต', 'dtoh', 'long']] };
const PARTS_INFO = { t: 'info', score: false, title: 'Vowels with several parts',
  text: 'Some vowels are made of two or three marks around the consonant. Read them as ONE vowel sound.',
  examples: [['เมีย', 'mia', 'เ + ี + ย'], ['เสือ', 'suea', 'เ + ื + อ'], ['ตัว', 'dtua', 'ั + ว']] };

function reviewLesson(gi, sets) {
  const cons = known(gi), vs = VOWELS.filter(v => sets.includes(v.set));
  return {
    skills: ['shape', 'name', 'sound', ...(vs.length ? ['vowel', 'combo'] : [])], review: true,
    teach: () => [intro(['A mixed review of everything so far', 'No new material — it shows what you remember'], ['Answer each question', 'Missed items get targeted practice', TEST_HOW(PASS.review)])],
    test: () => {
      const cs = pick(cons.filter(c => !L[c].old), 10);
      const steps = cs.map((c, i) => [qName, qShape, qSound][i % 3](c, [], true));
      if (vs.length) {
        pick(vs, 4).forEach(v => steps.push(qVowelSee(v, vs, true)));
        const pool = comboPool(cons, vs.map(v => v.v));
        pick(pool, 4).forEach(s => steps.push(qCombo(s, pool, true)));
      }
      return shuffle(steps);
    }
  };
}

function lookalikeLesson() {
  const fill = set => set.length >= 4 ? set : [...set, ...pick(MODERN.filter(x => !set.includes(x)), 4 - set.length)];
  return {
    skills: ['shape', 'name'],
    teach: () => {
      const steps = [intro(['Letters that are easy to mix up', 'The small detail that tells them apart: the head (loop), a tail, a notch'], ['Compare each set', 'Pick the right letter from its look-alikes', TEST_HOW()])];
      LOOKALIKES.forEach(set => steps.push({ t: 'info', score: false, title: 'Look closely', compare: set, text: set.map(c => `${c} — ${nameOf(c)} (${L[c].rom})`).join(' · ') }));
      pick(LOOKALIKES, 5).forEach(set => { const c = set[rnd(set.length)]; steps.push({ ...qShape(c, set), ...opts(c, fill(set), asChar) }); });
      return steps;
    },
    test: () => shuffle(LOOKALIKES).slice(0, 10).map((set, i) => { const c = set[rnd(set.length)]; const q = i % 2 ? qShape(c, set, true) : qName(c, set, true); return { ...q, ...opts(c, fill(set), i % 2 ? asChar : asName) }; }),
    place: () => { const set = LOOKALIKES[rnd(LOOKALIKES.length)], c = set[rnd(set.length)]; return [{ ...qShape(c, set, true), ...opts(c, fill(set), asChar) }]; }
  };
}

const PAIRS = [['ก', 'ค'], ['ต', 'ท'], ['ป', 'พ'], ['จ', 'ช'], ['ร', 'ล'], ['บ', 'ป'], ['ด', 'ต']];
function englishTrapsLesson() {
  return {
    skills: ['discrim', 'sound'],
    teach: () => [
      intro(['One English letter can stand for more than one Thai letter', 'How to hear the difference — for example ต and ท', 'Why ส ศ ษ ซ all start with "s"'], ['Read the comparisons and listen', 'Practise hearing the pairs apart', TEST_HOW()]),
      { t: 'info', score: false, title: 'One English letter, several Thai letters', text: 'English letters helped you start. Now notice that some of them match more than one Thai letter. Listen for the difference — your ear matters more than the English spelling.',
        rows: [['ก · ค ข', 'K', 'ก is soft (between g and k). ค ข are strong k with a puff of air.'], ['ต · ท ถ', 'T', 'ต is soft (between d and t). ท ถ are strong t with a puff of air.'], ['ป · พ ผ', 'P', 'ป is soft (between b and p). พ ผ are strong p with a puff of air.'], ['จ · ช ฉ', 'J / CH', 'จ is soft. ช ฉ are a strong "ch".'], ['ร · ล', 'R · L', 'Two different letters and sounds — learn them separately.']] },
      { t: 'info', score: false, title: 'Try the "puff of air" test', text: 'Hold your hand in front of your mouth. Say ค, ท, พ — you feel a little puff of air. Say ก, ต, ป — almost no air. That small puff is the difference Thai listeners hear.',
        compare: ['ก', 'ค', 'ต', 'ท', 'ป', 'พ'] },
      { t: 'info', score: false, title: 'Same sound, different letters', compare: ['ส', 'ศ', 'ษ', 'ซ'], text: SAME_SOUND[0].why + ' In modern standard Thai they all start with "s". ส is the one you will see most.' },
      ...PAIRS.slice(0, 5).map(([a, b]) => qDiscrim(a, b)),
      ...pick(SAME_SOUND.slice(0, 6), 3).map(f => { const [a, b] = pick(f.letters, 2); const list = shuffle([b, ...pick(MODERN.filter(x => L[x].snd !== f.snd), 3)]); return { t: 'choose', phase: 'Practice', skill: 'sound', key: b, big: true, q: `Which letter starts with the same sound as ${a}?`, o: list.map(asChar), a: list.indexOf(b), why: `${a} and ${b} both start with "${SOUNDS[f.snd].rom}". ${f.why}` }; })
    ],
    test: () => shuffle([...shuffle(PAIRS).slice(0, 6).map(([a, b]) => qDiscrim(a, b, true)),
      ...pick(SAME_SOUND.slice(0, 8), 4).map(f => { const [a, b] = pick(f.letters, 2); const list = shuffle([b, ...pick(MODERN.filter(x => L[x].snd !== f.snd), 3)]); return T({ t: 'choose', skill: 'sound', key: b, big: true, q: `Which letter starts with the same sound as ${a}?`, o: list.map(asChar), a: list.indexOf(b), why: `${a} and ${b} both start with "${SOUNDS[f.snd].rom}". ${f.why}` }, true); })]),
    place: () => { const [a, b] = PAIRS[rnd(4)]; return [qDiscrim(a, b, true)]; }
  };
}

/* ---------- reading ---------- */
const W = (th, rom, en) => ({ th, rom, en });
export const READ_WORDS = [W('มา', 'maa', 'to come'), W('ตา', 'dtaa', 'eye'), W('ดี', 'dee', 'good'), W('ปู', 'bpoo', 'crab'), W('งู', 'ngoo', 'snake'), W('โต', 'dtoh', 'big'),
  W('ชา', 'chaa', 'tea'), W('นา', 'naa', 'rice field'), W('ยา', 'yaa', 'medicine'), W('รอ', 'ror', 'to wait'), W('ไป', 'bpai', 'to go'), W('ใจ', 'jai', 'heart, mind'),
  W('เรา', 'rao', 'we'), W('ทำ', 'tam', 'to do'), W('ไฟ', 'fai', 'fire, light'), W('มือ', 'muue', 'hand'), W('เสือ', 'suea', 'tiger'), W('ตัว', 'dtua', 'body'),
  W('เมีย', 'mia', 'wife (informal)'), W('เธอ', 'ter', 'you, she'), W('แพะ', 'pae', 'goat'), W('เกาะ', 'gor', 'island'), W('ถือ', 'tuue', 'to hold'), W('วัว', 'wua', 'cow')];
export const CVC_WORDS = [W('กิน', 'gin', 'to eat'), W('นอน', 'norn', 'to sleep'), W('ลม', 'lom', 'wind'), W('มด', 'mot', 'ant'), W('รถ', 'rot', 'car'), W('ปาก', 'bpaak', 'mouth'),
  W('ดาว', 'daao', 'star'), W('จาน', 'jaan', 'plate'), W('ชอบ', 'chorp', 'to like'), W('บาท', 'baat', 'baht'), W('กัน', 'gan', 'together'), W('ฟัน', 'fan', 'tooth'), W('คน', 'kon', 'person'), W('นก', 'nok', 'bird')];

function readSyllablesLesson() {
  const cons = MODERN.filter(COMBO_OK), vows = VOWELS.filter(v => v.set <= 6 && v.v !== 'ฤ').map(v => v.v);
  const pool = comboPool(cons, vows);
  return {
    skills: ['combo'],
    teach: () => [intro(['Read consonant + vowel syllables you have never seen', 'Use what you know instead of memorising'], ['Find the consonant, then the vowel around it', 'Practise with romanization you can show or hide', TEST_HOW()]),
      { t: 'info', score: false, title: 'How to read a syllable', text: '1) Find the consonant. 2) Find the vowel marks around it — before, above, below, after. 3) Say the consonant, then the vowel. These syllables don\'t need to be real words: the goal is reading.', examples: [['เก', 'geh', 'ก + เอ'], ['โม', 'moh', 'ม + โอ'], ['เสีย', 'sia', 'ส + เอีย'], ['ถัว', 'tua', 'ถ + อัว']] },
      ...pick(pool, 6).map(s => qCombo(s, pool, false, false))],
    test: () => pick(pool, 10).map(s => qCombo(s, pool, true)),
    place: () => pick(pool, 2).map(s => qCombo(s, pool, true))
  };
}

function finalsLesson() {
  const qs = [['ด', 't'], ['ร', 'n'], ['ล', 'n'], ['ส', 't'], ['บ', 'p'], ['ค', 'k'], ['ญ', 'n'], ['ท', 't'], ['พ', 'p'], ['ง', 'ng'], ['ม', 'm'], ['ก', 'k']];
  const fq = ([c, f], test) => T({ t: 'choose', skill: 'final', key: c, q: `At the END of a syllable, ${c} sounds like…`, show: c, showNoSay: true,
    ...opts(FINALS[f].rom, ['k', 't', 'p', 'n', 'm', 'ng', 'd', 'r', 'l', 's'], asText), why: `${c} at the end = "${FINALS[f].rom}" (${FINALS[f].en}). At the start it is "${SOUNDS[L[c].snd].rom}".` }, test);
  return {
    skills: ['final', 'read'],
    teach: () => [intro(['Letters at the END of a syllable', 'Only 8 end sounds exist: k, t, p, n, m, ng, i/y, o/w', 'The short-a mark ั in words like กัน'], ['Read the table and listen', 'Practise end sounds and short words', TEST_HOW()]),
      { t: 'info', score: false, title: 'End sounds', text: 'Thai end consonants are short and unreleased — your mouth stops without letting the sound out. Many letters share the same end sound.',
        rows: Object.entries(FINALS).map(([k, f]) => [LETTERS.filter(x => x.fin === k).map(x => x.c).join(' '), f.rom, f.en]) },
      { t: 'info', score: false, title: 'Short a in a closed syllable: ั', text: 'When short "a" has an end consonant, ะ changes to ั above the first letter: ก + ะ + น → กัน (gan). A consonant with no vowel mark between two letters often has a hidden short "o": คน (kon).',
        examples: [['กัน', 'gan', 'together'], ['ฟัน', 'fan', 'tooth'], ['คน', 'kon', 'person'], ['นก', 'nok', 'bird']] },
      ...shuffle(qs).slice(0, 5).map(x => fq(x)), ...pick(CVC_WORDS, 4).map(w => qWord(w, CVC_WORDS, false, 'read', false))],
    test: () => shuffle([...shuffle(qs).slice(0, 4).map(x => fq(x, true)), ...pick(CVC_WORDS, 6).map(w => qWord(w, CVC_WORDS, true))]),
    place: () => pick(CVC_WORDS, 2).map(w => qWord(w, CVC_WORDS, true))
  };
}

function readOwnLesson() {
  const pool = [...READ_WORDS, ...CVC_WORDS];
  return {
    skills: ['read'],
    teach: () => [intro(['Read real Thai words on your own', 'Romanization starts hidden — show it only if you need to'], ['Read the word first, then check', 'Meanings are shown after you answer, as extra help', TEST_HOW()]),
      ...pick(pool, 6).map(w => qWord(w, pool, false, 'read', true))],
    test: () => pick(pool, 10).map(w => qWord(w, pool, true)),
    place: () => pick(pool, 2).map(w => qWord(w, pool, true))
  };
}

/* ---------- Phase 1 checks (each skill on its own) ---------- */
const checkIntro = (what, mark) => [intro([`A check of ${what}`, 'Questions are new each time you take it'], ['Answer on your own — romanization is hidden where reading is tested', `Pass mark: ${mark}%. If you miss it, you practise only what you missed, then retake.`])];
function checkConsonants() {
  return { skills: ['shape', 'name'], check: true, mark: () => PASS.consonants,
    teach: () => checkIntro('all 44 consonants', PASS.consonants),
    test: () => pick(MODERN, 20).map((c, i) => i % 2 ? qName(c, [], true) : qShape(c, [], true)) };
}
function checkSounds() {
  return { skills: ['sound', 'discrim'], check: true, mark: () => PASS.sounds,
    teach: () => checkIntro('matching sounds to letters', PASS.sounds),
    test: () => shuffle([...pick(MODERN, 10).map(c => qSound(c, [], true)), ...shuffle(PAIRS).slice(0, 4).map(([a, b]) => qDiscrim(a, b, true))]) };
}
function checkVowels() {
  const vs = VOWELS.filter(v => v.v !== 'ฤ');
  return { skills: ['vowel', 'combo'], check: true, mark: () => PASS.vowels,
    teach: () => checkIntro('the Thai vowels', PASS.vowels),
    test: () => { const pool = comboPool(MODERN.filter(COMBO_OK), vs.map(v => v.v)); return shuffle([...pick(vs, 12).map(v => qVowelSee(v, vs, true)), ...pick(pool, 4).map(s => qCombo(s, pool, true))]); } };
}
function checkReading() {
  const words = [...READ_WORDS, ...CVC_WORDS], pool = comboPool(MODERN.filter(COMBO_OK), VOWELS.filter(v => v.v !== 'ฤ').map(v => v.v));
  return { skills: ['combo', 'read'], check: true, mark: () => PASS.reading,
    teach: () => checkIntro('reading Thai without romanization', PASS.reading),
    test: () => shuffle([...pick(pool, 6).map(s => qCombo(s, pool, true)), ...pick(words, 8).map(w => qWord(w, words, true))]) };
}

/* =========================================================
   PHASE 2 — READING RULES (existing lessons, split into teach + test)
   ========================================================= */
function classLesson() {
  const q = (c, test) => T({ t: 'choose', skill: 'tone', key: c, q: `Which class is ${c} (${nameOf(c)})?`, show: c, showNoSay: true,
    o: [['Mid class', 'อักษรกลาง'], ['High class', 'อักษรสูง'], ['Low class', 'อักษรต่ำ']], a: ['mid', 'high', 'low'].indexOf(L[c].cls), why: `${c} is ${L[c].cls} class.` }, test);
  return { skills: ['tone'],
    teach: () => [intro(['The three consonant classes: mid (9), high (11), low (24)', 'Why classes matter: with the syllable type and tone mark, they decide the tone'], ['See which letters are in each class', 'Sort letters by class', TEST_HOW(PASS.rules)]),
      ...Object.entries(CLASS_INFO).map(([k, ci]) => ({ t: 'info', score: false, title: `${k[0].toUpperCase() + k.slice(1)} class · ${ci.th} (${ci.rom})`, compare: LETTERS.filter(x => x.cls === k).map(x => x.c),
        text: k === 'mid' ? 'Tip: Thai children remember 7 of the 9 mid-class letters with ไก่จิกเด็กตายบนปากโอ่ง ("a chicken pecked a child on the rim of a jar"), plus ฎ ฏ.' : k === 'high' ? 'Tip: most high-class letters are in the phrase ผีฝากถุงข้าวสารให้ฉัน ("a ghost left a bag of rice with me"), plus ฃ ฐ ศ ษ.' : 'Every letter that is not mid or high is low class.' })),
      ...pick(MODERN, 4).map(c => q(c))],
    test: () => pick(MODERN, 8).map(c => q(c, true)) };
}
function liveDeadLesson() {
  const items = [['มา', 'live', 'long vowel'], ['กิน', 'live', 'ends in n'], ['ดาว', 'live', 'ends in w/o'], ['จะ', 'dead', 'short vowel'], ['มด', 'dead', 'ends in t'], ['ปาก', 'dead', 'ends in k'], ['ชอบ', 'dead', 'ends in p'], ['ลม', 'live', 'ends in m'], ['นก', 'dead', 'ends in k'], ['ทำ', 'live', 'อำ counts as live']];
  const q = ([w, a, why], test) => T({ t: 'choose', skill: 'tone', key: w, q: 'Is this syllable live or dead?', show: w, o: [['Live', 'long vowel, or ends in n m ng y w'], ['Dead', 'short vowel, or ends in k t p']], a: a === 'live' ? 0 : 1, why: `${w} is ${a}: ${why}.` }, test);
  return { skills: ['tone'],
    teach: () => [intro(['Live and dead syllables', 'You need this to work out tones'], ['Learn the rule', 'Sort syllables', TEST_HOW(PASS.rules)]),
      { t: 'info', score: false, title: 'Live and dead', text: 'Live: ends in a long vowel, or in n, m, ng, y, w (also อำ ไ ใ เา). Dead: ends in a short vowel, or in k, t, p.', examples: [['มา', 'maa', 'live'], ['กิน', 'gin', 'live'], ['จะ', 'ja', 'dead'], ['มด', 'mot', 'dead']] },
      ...pick(items, 4).map(x => q(x))],
    test: () => pick(items, 8).map(x => q(x, true)) };
}
function toneIntroLesson() {
  const set = [['ปา', 'Mid'], ['ป่า', 'Low'], ['ป้า', 'Falling'], ['ป๊า', 'High'], ['ป๋า', 'Rising'], ['ก่า', 'Low'], ['ต้ม', 'Falling'], ['จ๋า', 'Rising'], ['ดี', 'Mid'], ['บ้าน', 'Falling']];
  const r = s => ({ 'ต้ม': 'dtom', 'จ๋า': 'jaa', 'ก่า': 'gaa', 'ดี': 'dee', 'บ้าน': 'baan' }[s] || 'bpaa');
  const q = ([s, t], test) => T({ t: 'tone', skill: 'tone', key: s, syl: s, r: r(s), a: t, why: `Mid-class ${s[0]} ${s.match(/[่้๊๋]/) ? 'with ' + s.match(/[่้๊๋]/)[0] : 'with no mark, live syllable'} → ${t.toLowerCase()} tone.` }, test);
  return { skills: ['tone'],
    teach: () => [intro(['The five Thai tones: mid, low, falling, high, rising', 'The four tone marks: ่ ้ ๊ ๋', 'How they work on mid-class letters (the simplest case)'], ['Listen to the same syllable in five tones', 'Pick the tone', TEST_HOW(PASS.rules)]),
      { t: 'info', score: false, title: 'Tones change meaning', text: 'A tone is the pitch shape of a syllable. It is relative to your own voice, not a fixed note. The same sounds with a different tone are a different word.',
        examples: [['ปา', 'bpaa · mid', 'to throw'], ['ป่า', 'bpaa · low', 'forest'], ['ป้า', 'bpaa · falling', 'aunt (older)'], ['ป๊า', 'bpaa · high', 'dad (informal)'], ['ป๋า', 'bpaa · rising', 'dad, big boss (informal)']] },
      { t: 'info', score: false, title: 'A tone mark is not the tone', text: 'The mark does not tell you the tone by itself. The result depends on the consonant class, the syllable type (live/dead) and the vowel length. On MID-class letters the marks are simplest: no mark = mid (live) · ่ = low · ้ = falling · ๊ = high · ๋ = rising.' },
      ...set.slice(0, 4).map(x => q(x))],
    test: () => pick(set, 8).map(x => q(x, true)) };
}
function toneRulesLesson() {
  const set = [['ขา', 'kaa', 'Rising', 'High class, live, no mark → rising (leg)'], ['สี', 'see', 'Rising', 'High class, live → rising (colour)'], ['มา', 'maa', 'Mid', 'Low class, live → mid (to come)'], ['นา', 'naa', 'Mid', 'Low class, live → mid (rice field)'],
    ['ไก่', 'gai', 'Low', 'Mid class + ่ → low (chicken)'], ['ปาก', 'bpaak', 'Low', 'Mid class, dead → low (mouth)'], ['รถ', 'rot', 'High', 'Low class, dead short → high (car)'], ['มาก', 'maak', 'Falling', 'Low class, dead long → falling (very)'],
    ['ค่า', 'kaa', 'Falling', 'Low class + ่ → falling (value)'], ['ค้า', 'kaa', 'High', 'Low class + ้ → high (to trade)'], ['ข่าว', 'kaao', 'Low', 'High class + ่ → low (news)'], ['สุข', 'suk', 'Low', 'High class, dead → low (happy)']];
  const q = ([s, r, t, why], test) => T({ t: 'tone', skill: 'tone', key: s, syl: s, r, a: t, why }, test);
  return { skills: ['tone'],
    teach: () => [intro(['Tones for high- and low-class letters', 'Using class + live/dead + vowel length + tone mark'], ['Study the rule table', 'Work out the tone', TEST_HOW(PASS.rules)]),
      { t: 'info', score: false, title: 'The rule table (no tone mark)', rows: [['Mid class', 'live → mid', 'dead → low'], ['High class', 'live → rising', 'dead → low'], ['Low class', 'live → mid', 'dead short → high · dead long → falling']],
        text: 'With ่ : mid/high class → low, low class → falling. With ้ : mid/high class → falling, low class → high. ๊ and ๋ are used almost only with mid-class letters.' },
      ...set.slice(0, 4).map(x => q(x))],
    test: () => pick(set, 8).map(x => q(x, true)) };
}
function clusterLesson() {
  const words = [W('หมา', 'maa', 'dog'), W('หนู', 'noo', 'mouse'), W('ปลา', 'bplaa', 'fish'), W('ครู', 'kroo', 'teacher'), W('กลาง', 'glaang', 'middle'), W('ขวา', 'kwaa', 'right (side)'), W('หลาย', 'laai', 'many'), W('อยู่', 'yoo', 'to be at')];
  return { skills: ['read'],
    teach: () => [intro(['Silent ห in front of a low-class letter (leading ห)', 'Two-consonant clusters: กร กล กว ปร ปล พร…'], ['Read the examples', 'Read each word', TEST_HOW(PASS.rules)]),
      { t: 'info', score: false, title: 'Leading ห and อ', text: 'ห in front of ง ญ น ม ย ร ล ว is not pronounced; it makes the next letter follow high-class tone rules. อ leads ย in four words (อยู่ อย่า อย่าง อยาก).', examples: [['หมา', 'maa (rising)', 'dog'], ['หนู', 'noo (rising)', 'mouse'], ['อยู่', 'yoo (low)', 'to be at']] },
      { t: 'info', score: false, title: 'Clusters', text: 'Some pairs are said together as one sound: ก ข ค ต ป พ + ร ล ว.', examples: [['ปลา', 'bplaa', 'fish'], ['ครู', 'kroo', 'teacher'], ['กลาง', 'glaang', 'middle'], ['ขวา', 'kwaa', 'right side']] },
      ...pick(words, 3).map(w => qWord(w, words, false, 'read', false))],
    test: () => pick(words, 6).map(w => qWord(w, words, true)) };
}
function silentLesson() {
  const words = [W('ยักษ์', 'yak', 'giant'), W('จันทร์', 'jan', 'moon, Monday'), W('ศิลป์', 'sin', 'art'), W('เบอร์', 'ber', 'number'), W('ฟิล์ม', 'fim', 'film'), W('การ์ตูน', 'gaa-dtoon', 'cartoon'), W('สัตว์', 'sat', 'animal')];
  return { skills: ['read'],
    teach: () => [intro(['The silent mark ์ (thanthakhat / การันต์)', 'Letters you see but don\'t say'], ['See which letters are silenced', 'Read each word', TEST_HOW(PASS.rules)]),
      { t: 'info', score: false, title: 'The mark ์ silences a letter', text: 'A letter with ์ above it is not pronounced. Sometimes the letter before it is silent too (จันทร์ → jan). These spellings mostly come from Sanskrit, Pali and English loanwords.', examples: [['ยักษ์', 'yak', 'ษ is silent'], ['เบอร์', 'ber', 'ร is silent'], ['จันทร์', 'jan', 'ท and ร are silent']] },
      ...pick(words, 3).map(w => qWord(w, words, false, 'read', false))],
    test: () => pick(words, 6).map(w => qWord(w, words, true)) };
}
function checkRules() {
  return { skills: ['tone', 'read'], check: true, mark: () => PASS.rules,
    teach: () => checkIntro('the reading rules', PASS.rules),
    test: () => [...toneRulesLesson().test().slice(0, 6), ...toneIntroLesson().test().slice(0, 4), ...clusterLesson().test().slice(0, 3), ...silentLesson().test().slice(0, 3)].map(s => ({ ...s, test: true, phase: 'Test' })) };
}

/* =========================================================
   WRITING TRACK (optional practice alongside Phase 1)
   ========================================================= */
function writeLesson(letters, memoryCount, extra) {
  return { skills: ['write'], optional: true,
    teach: () => { const steps = [intro([`Write: ${letters.join(' ')}`, 'Trace first, then write from memory'], ['Trace over the grey letter — start at the head (the small loop) when there is one', 'The shape check is approximate and does not judge stroke order', TEST_HOW()])];
      if (extra) steps.push(extra); letters.forEach(c => steps.push({ t: 'trace', phase: 'Practice', skill: 'write', key: c, c })); return steps; },
    test: () => pick(letters, memoryCount).map(c => ({ t: 'write', phase: 'Test', test: true, skill: 'write', key: c, c, mode: 'memory' })) };
}
const WRITING_RULES = { t: 'info', score: false, title: 'How Thai letters are written',
  text: 'Most Thai letters start at the head — the small loop — and are written in one continuous stroke without lifting the pen. Write from top to bottom and left to right. Keep the loops round and the same size. Animated stroke order for each letter is not available yet.',
  compare: ['ก', 'ข', 'ค', 'ง', 'บ'] };
const SPELL = [
  { th: 'ไก่', rom: 'gai', en: 'chicken', tiles: ['ไ', 'ก', '่'], extra: ['ข', '้'] }, { th: 'ปลา', rom: 'bplaa', en: 'fish', tiles: ['ป', 'ล', 'า'], extra: ['บ', 'ะ'] },
  { th: 'ดี', rom: 'dee', en: 'good', tiles: ['ด', 'ี'], extra: ['ต', 'ิ'] }, { th: 'มา', rom: 'maa', en: 'to come', tiles: ['ม', 'า'], extra: ['น', 'ะ'] },
  { th: 'ใจ', rom: 'jai', en: 'heart', tiles: ['ใ', 'จ'], extra: ['ไ', 'ว'] }, { th: 'รถ', rom: 'rot', en: 'car', tiles: ['ร', 'ถ'], extra: ['ธ', 'ภ'] },
  { th: 'แมว', rom: 'maew', en: 'cat', tiles: ['แ', 'ม', 'ว'], extra: ['เ', 'น'] }, { th: 'งู', rom: 'ngoo', en: 'snake', tiles: ['ง', 'ู'], extra: ['ุ', 'ด'] },
  { th: 'ตา', rom: 'dtaa', en: 'eye', tiles: ['ต', 'า'], extra: ['ด', 'ท'] }
];
const tile = t => [t, '', /[ัิ-ฺ็-๎]/.test(t) ? '◌' + t : t];
const qSpell = (s, test) => T({ t: 'build', skill: 'write', key: s.th, q: `Spell "${s.rom}" (${s.en})`, sayWord: s.th, ans: s.tiles.map(tile), extra: s.extra.map(tile),
  why: `${s.th} = ${s.tiles.join(' + ')}. A vowel like เ แ โ ไ ใ is written before the consonant.` }, test);
function writeFromSound() {
  return { skills: ['write'], optional: true,
    teach: () => [intro(['Hear a letter name and write the letter'], ['Listen', 'Write the letter in the box', TEST_HOW()]), ...pick(MODERN, 3).map(c => ({ t: 'write', phase: 'Practice', skill: 'write', key: c, c, mode: 'sound' }))],
    test: () => pick(MODERN, 5).map(c => ({ t: 'write', phase: 'Test', test: true, skill: 'write', key: c, c, mode: 'sound' })) };
}
function spellLesson() {
  return { skills: ['write'], optional: true,
    teach: () => [intro(['Spell short words letter by letter', 'Where vowels and tone marks go'], ['Listen to the word', 'Tap the pieces in writing order', TEST_HOW()]), ...pick(SPELL, 3).map(s => qSpell(s))],
    test: () => pick(SPELL, 6).map(s => qSpell(s, true)) };
}

/* =========================================================
   THE PATH
   ========================================================= */
const L_ = (id, title, th, def, extra = {}) => ({ id, title, th, ...def, ...extra });

/* ---------- C0: English letters → Thai letters (content in data/associations.js) ---------- */
function assocLesson() {
  const G = ASSOC.filter(g => g.status === 'reviewed');
  const live = c => !ASSOC_OLD.includes(c) && L[c];
  const engOf = c => G.find(g => g.thai.includes(c))?.eng;
  const allThai = G.flatMap(g => g.thai).filter(live);
  const engs = G.map(g => g.eng);
  const qThai2Eng = (c, test) => T({ t: 'choose', skill: 'assoc', key: c, q: 'Which English letter helps you remember this Thai letter?', show: c,
    ...opts(engOf(c), engs, asText), why: `${c} "${nameOf(c)}" (${L[c].rom}) — memory aid: ${engOf(c)}.` }, test);
  const qEng2Thai = (g, test) => { const c = g.thai.filter(live)[0];
    return T({ t: 'choose', skill: 'assoc', key: c, big: true, q: `Which Thai letter can English "${g.eng}" help you remember?`,
      ...opts(c, [...allThai.filter(x => !g.thai.includes(x)), ...(g.compare ? [g.compare] : [])], asChar), why: `"${g.eng}" → ${g.thai.join(' ')}. ${g.note}` }, test); };
  const qHear = (c, test) => T({ t: 'listen', skill: 'assoc', key: c, say: nameOf(c), sayRom: L[c].rom,
    ...opts(engOf(c), engs, asText), why: `You heard "${nameOf(c)}" — ${c}, memory aid ${engOf(c)}.` }, test);
  const chunks = []; for (let i = 0; i < G.length; i += 3) chunks.push(G.slice(i, i + 3));
  const main = G.map(g => g.thai.filter(live)[0]).filter(Boolean);   // the most common letter of each group
  return {
    skills: ['assoc'],
    teach: () => {
      const steps = [intro(['English letters you already know can help you remember Thai letters', 'Each Thai letter\'s name and sound', 'Where the real Thai sound is different'],
        ['Look at each group and listen', 'Practise matching both ways', TEST_HOW()]),
        { t: 'info', score: false, title: 'A bridge, not a copy', text: 'Many Thai letters sound a bit like an English letter. Use that link to remember them at first. Some Thai sounds have no exact English match, so always listen to the Thai audio — and later you can drop the English link altogether.' }];
      chunks.forEach((ch, i) => steps.push({ t: 'info', score: false, title: `English → Thai (${i + 1} of ${chunks.length})`,
        text: ch.map(g => `<b>${g.eng}</b>: ${g.note}`).join('<br>'),
        rows: ch.flatMap(g => g.thai.filter(live).map((c, j) => [c, j ? '' : `<b>${g.eng}</b>`, `${nameOf(c)} · ${L[c].rom} · start "${g.start}"${g.end ? ` · end "${g.end}"` : ''}`])) }));
      steps.push({ t: 'info', score: false, title: 'Not used any more', text: 'ฃ and ฅ are still in the alphabet but no modern word uses them. You only need to recognise them.', compare: ['ฃ', 'ฅ'] });
      pick(main, 10).forEach(c => steps.push(qThai2Eng(c)));
      pick(G.filter(g => g.thai.some(live)), 6).forEach(g => steps.push(qEng2Thai(g)));
      pick(main, 3).forEach(c => steps.push(qHear(c)));
      return steps;
    },
    test: () => shuffle([...pick(allThai, 10).map(c => qThai2Eng(c, true)), ...pick(G.filter(g => g.thai.some(live)), 6).map(g => qEng2Thai(g, true)), ...pick(main, 3).map(c => qHear(c, true))]),
    place: () => pick(main, 2).map(c => qThai2Eng(c, true))
  };
}
const ASSOC_ON = ASSOC_READY && ASSOC.filter(g => g.status === 'reviewed').length >= 2;


/* =========================================================
   WORDS — shared helpers for Phases 3–8 (vocabulary, spelling, word review)
   ========================================================= */
const toW = ([th, rom, en, reg]) => ({ th, rom, en, reg });
export const ALL_WORDS = TOPICS.flatMap(t => t.words.map(w => ({ ...toW(w), topic: t.id })));
export const ALL_PHRASES = TOPICS.flatMap(t => t.phrases.map(w => ({ ...toW(w), topic: t.id })));
export const WORD = Object.fromEntries([...ALL_WORDS, ...ALL_PHRASES].map(w => [w.th, w]));
const MARK_NAMES = { '่': 'tone mark ไม้เอก (mai ek)', '้': 'tone mark ไม้โท (mai toh)', '๊': 'tone mark ไม้ตรี (mai dtree)', '๋': 'tone mark ไม้จัตวา (mai jat-dta-waa)',
  '์': 'silent mark ์ (the letter under it is not said)', '็': 'short mark ็ (makes the vowel short)', 'ๆ': 'repeat mark ๆ (say the word twice)' };
// What a written word is made of, piece by piece (for the word card and feedback).
export function partsOf(th) {
  return [...th].filter(ch => ch !== ' ').map(ch => L[ch] ? { ch, kind: 'consonant', label: nameOf(ch) } : MARK_NAMES[ch] ? { ch, kind: 'mark', label: MARK_NAMES[ch] } : /[ะ-ฺเ-ๅ]/.test(ch) ? { ch, kind: 'vowel', label: 'vowel part' } : { ch, kind: 'other', label: ch });
}
const ROMAN_KEY = w => w.en;
const SWAPS = [['ส', 'ศ', 'ษ', 'ซ'], ['ท', 'ธ', 'ถ', 'ฐ'], ['ค', 'ข', 'ฆ'], ['พ', 'ผ', 'ภ'], ['น', 'ณ'], ['ล', 'ฬ', 'ร'], ['ต', 'ฏ'], ['ด', 'ฎ'], ['ช', 'ฉ', 'ฌ'], ['ย', 'ญ'], ['ฟ', 'ฝ'], ['บ', 'ป'], ['ใ', 'ไ'], ['ะ', 'า'], ['ิ', 'ี'], ['ุ', 'ู'], ['ึ', 'ื'], ['่', '้', '๊', '๋']];
// Wrong spellings that a learner could believe: same-sound letters, tone marks, short/long vowels.
export function misspellings(th, n = 3) {
  const out = new Set(), cs = [...th];
  cs.forEach((ch, i) => SWAPS.forEach(g => { if (g.includes(ch)) g.filter(x => x !== ch).forEach(x => { const c = cs.slice(); c[i] = x; out.add(c.join('')); }); }));
  cs.forEach((ch, i) => { if ('่้๊๋'.includes(ch)) out.add(cs.filter((_, j) => j !== i).join('')); });
  if (!/[่้๊๋]/.test(th)) { const i = cs.findIndex(c => L[c]); if (i >= 0) { const c = cs.slice(); c.splice(i + 1, 0, '่'); out.add(c.join('')); } }
  out.delete(th);
  return pick([...out].filter(x => !WORD[x]), n);
}
const spellTile = t => [t, '', /[ัิ-ฺ็-๎]/.test(t) ? '◌' + t : t];
function spellExtras(th) {
  const cs = [...th], ex = new Set();
  cs.forEach(ch => SWAPS.forEach(g => { if (g.includes(ch)) g.filter(x => x !== ch).forEach(x => ex.add(x)); }));
  cs.forEach(c => ex.delete(c));
  const list = pick([...ex], 2);
  return list.length >= 2 ? list : [...list, ...pick(['า', 'ี', 'น', 'ม', 'ก'].filter(x => !cs.includes(x)), 2 - list.length)];
}
const canSpell = w => !/\s/.test(w.th) && [...w.th].length >= 2 && [...w.th].length <= 7;

const wordWhy = w => `${w.th} (${w.rom}) = ${w.en}. Written: ${partsOf(w.th).map(p => p.ch + (p.kind === 'consonant' ? '' : '')).join(' + ')}.`;
const qMeaning = (w, pool, test) => T({ t: 'choose', skill: 'meaning', key: w.th, word: w.th, q: 'What does this mean?', show: w.th, showR: w.rom, hideRom: !!test,
  ...opts(w, pool, x => [x.en, ''], 4, ROMAN_KEY), why: wordWhy(w), sayAfter: w.th }, test);
const qThaiFor = (w, pool, test) => T({ t: 'choose', skill: 'meaning', key: w.th, word: w.th, thai: true, q: `Which one means "${w.en}"?`,
  ...opts(w, pool, x => [x.th, x.rom], 4, x => x.th), why: wordWhy(w), sayAfter: w.th }, test);
const qHearW = (w, pool, test) => T({ t: 'listen', skill: 'listen', key: w.th, word: w.th, say: w.th, sayRom: w.rom,
  ...opts(w, pool, x => [x.en, ''], 4, ROMAN_KEY), why: `You heard ${w.th} (${w.rom}) — ${w.en}.` }, test);
const qSpellW = (w, test) => T({ t: 'build', skill: 'spell', key: w.th, word: w.th, q: `Spell "${w.en}" (${w.rom})`, sayWord: w.th,
  ans: [...w.th].map(spellTile), extra: spellExtras(w.th).map(spellTile), why: `${w.th} = ${[...w.th].join(' + ')}. Vowels เ แ โ ใ ไ are written before the consonant; tone marks sit above it.` }, test);
const qMisspell = (w, test) => { const wrong = misspellings(w.th); if (wrong.length < 2) return qSpellW(w, test);
  const list = shuffle([w.th, ...wrong]);
  return T({ t: 'choose', skill: 'spell', key: w.th, word: w.th, big: true, q: `Which is the correct spelling of "${w.en}" (${w.rom})?`, o: list.map(x => [x, '']), a: list.indexOf(w.th),
    why: `The correct spelling is ${w.th}. The others swap a same-sound letter, a tone mark or a vowel length — they would be read differently or simply be wrong.`, sayAfter: w.th }, test); };
const qDictation = (w, test) => ({ ...qSpellW(w, test), q: 'Listen and spell the word you hear', dictation: true });
const matchWords = ws => ({ t: 'match', phase: 'Practice', skill: 'meaning', title: 'Match each word to its meaning', pairs: ws.map(w => [w.th, w.en]) });
const wcard = (w, phase) => ({ t: 'wcard', w, score: false, key: w.th, ...(phase ? { phase } : {}) });
const spellQ = (w, test, i = 0) => canSpell(w) ? (i % 3 === 2 ? qDictation(w, test) : i % 2 ? qMisspell(w, test) : qSpellW(w, test)) : qMisspell(w, test);

/* ---------- Phase 3: a topic lesson ---------- */
function topicLesson(topic) {
  const ws = topic.words.map(w => ({ ...toW(w), topic: topic.id })), ps = topic.phrases.map(toW);
  const pool = ws.length >= 6 ? ws : [...ws, ...ALL_WORDS];
  return {
    skills: ['meaning', 'listen', 'spell'], words: ws.map(w => w.th),
    teach: () => {
      const steps = [intro([`${ws.length} everyday words: ${ws.slice(0, 5).map(w => w.th).join(' · ')} …`, 'What each word means and how it is spelled', `${ps.length} useful phrases`],
        ['Learn each word card — listen, see how it is written', 'Practise meaning, listening and spelling', TEST_HOW()]),
        { t: 'info', score: false, title: `${topic.icon} Good to know`, text: topic.tip }];
      for (let i = 0; i < ws.length; i += 4) {
        const chunk = ws.slice(i, i + 4);
        chunk.forEach(w => steps.push(wcard(w)));
        chunk.slice(0, 2).forEach(w => steps.push(qMeaning(w, pool)));
      }
      steps.push(matchWords(pick(ws, Math.min(5, ws.length))));
      pick(ws, 3).forEach(w => steps.push(qThaiFor(w, pool)));
      pick(ws, 3).forEach(w => steps.push(qHearW(w, pool)));
      pick(ws.filter(canSpell), 2).forEach((w, i) => steps.push(spellQ(w, false, i)));
      steps.push({ t: 'info', score: false, title: 'Useful phrases', text: 'Listen and repeat each phrase out loud. You will meet them again in conversations.', examples: ps.map(p => [p.th, p.rom, p.en]) });
      pick(ps, Math.min(2, ps.length)).forEach(p => steps.push(qMeaning(p, [...ps, ...pool])));
      return steps;
    },
    test: () => {
      const s = [...pick(ws, 4).map(w => qMeaning(w, pool, true)), ...pick(ws, 3).map(w => qThaiFor(w, pool, true)), ...pick(ws, 3).map(w => qHearW(w, pool, true)),
        ...pick(ws, 3).map((w, i) => spellQ(w, true, i)), ...pick(ps, 1).map(p => qMeaning(p, [...ps, ...pool], true))];
      return shuffle(s);
    },
    place: () => pick(ws, 1).map(w => qMeaning(w, pool, true))
  };
}

/* ---------- Phase 4: grammar ---------- */
const sentTile = t => [t[0], t[1], t[0]];
const qOrder = (o, test) => T({ t: 'build', skill: 'grammar', key: o.ans.map(a => a[0]).join(''), q: `Put the words in order: "${o.en}"`, sayWord: o.ans.map(a => a[0]).join(''),
  ans: o.ans.map(sentTile), extra: (o.extra || []).map(sentTile), why: `${o.ans.map(a => a[0]).join(' ')} (${o.ans.map(a => a[1]).join(' ')}) = ${o.en}` }, test);
const qPickSentence = (p, test) => { const list = shuffle(p.o.map((x, i) => ({ x, i })));
  return T({ t: 'choose', skill: 'grammar', key: p.o[p.a][0], thai: true, q: p.q, o: list.map(({ x }) => [x[0], x[1]]), a: list.findIndex(y => y.i === p.a), why: p.why, sayAfter: p.o[p.a][0] }, test); };
const GRAMMAR_EGS = () => GRAMMAR.flatMap(g => g.examples.map(([th, rom, en]) => ({ th, rom, en })));
const qSentMeaning = (e, test) => T({ t: 'choose', skill: 'grammar', key: e.th, q: 'What does this sentence mean?', show: e.th, showR: e.rom, hideRom: !!test,
  ...opts(e, GRAMMAR_EGS(), x => [x.en, ''], 4, x => x.en), why: `${e.th} (${e.rom}) = ${e.en}`, sayAfter: e.th }, test);
function grammarLesson(g) {
  const egs = g.examples.map(([th, rom, en]) => ({ th, rom, en }));
  return {
    skills: ['grammar'],
    teach: () => [intro([g.title, 'Short rules with real examples'], ['Read the rule and listen to the examples', 'Build sentences from word tiles', TEST_HOW()]),
      ...g.explain.map(([title, text], i) => ({ t: 'info', score: false, title, text, ...(i === 0 ? { examples: g.examples } : {}) })),
      ...g.order.map(o => qOrder(o)), ...g.pick.map(p => qPickSentence(p)), ...pick(egs, 2).map(e => qSentMeaning(e))],
    test: () => shuffle([...pick(g.order, 3).map(o => qOrder(o, true)), ...g.pick.map(p => qPickSentence(p, true)), ...pick(egs, 2).map(e => qSentMeaning(e, true))]),
    place: () => [qOrder(g.order[0], true)]
  };
}

/* ---------- Phase 5–7: conversations reused from beyond.js ---------- */
// beyond.js uses a phonetic romanization with tone accents; convert it to KhaoJai's simpler system.
export function toKJ(s) {
  if (!s || typeof s !== 'string') return s;
  let r = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  [['ʉa', 'uea'], ['ʉʉ', 'uue'], ['ʉ', 'ue'], ['ɔɔ', 'or'], ['ɔ', 'o'], ['ɛɛ', 'ae'], ['ɛ', 'ae'], ['əə', 'er'], ['ə', 'er'], ['oo', 'oh'], ['uu', 'oo'], ['ee', 'eh'], ['ii', 'ee'], ['ph', 'p'], ['th', 't'], ['kh', 'k']]
    .forEach(([a, b]) => { r = r.split(a).join(b); });
  return r;
}
const kjPair = o => Array.isArray(o) ? o.map((x, i) => i === 1 ? toKJ(x) : x) : o;
function kjStep(e, skill) {
  return { ...e, skill: e.skill || skill(e), o: e.o?.map(kjPair), ans: e.ans?.map(kjPair), extra: e.extra?.map(kjPair), showR: toKJ(e.showR), msgR: toKJ(e.msgR),
    key: e.key || e.say || e.show || e.msg || (e.ans && e.ans.map(a => a[0]).join('')) || e.q };
}
const convoSkill = e => e.t === 'listen' ? 'listen' : 'convo';
function stationLesson(id, skill = convoSkill) {
  const st = STATIONS[id];
  const words = (st.words || []).filter(w => BEYOND_WORDS[w]).map(w => ({ th: w, rom: toKJ(BEYOND_WORDS[w][0]), en: BEYOND_WORDS[w][1] }));
  const wq = (w, test) => T({ t: 'choose', skill: skill({ t: 'choose' }), key: w.th, q: 'What does this mean?', show: w.th, showR: w.rom, hideRom: !!test,
    ...opts(w, words.length >= 4 ? words : [...words, ...ALL_WORDS], x => [x.en, ''], 4, x => x.en), why: `${w.th} (${w.rom}) = ${w.en}`, sayAfter: w.th }, test);
  const steps = st.ex.map(e => kjStep(e, skill));
  return {
    skills: [...new Set(steps.map(s => s.skill))],
    teach: () => [intro([st.en, ...(words.length ? [`Words: ${words.map(w => w.th).join(' · ')}`] : [])], ['Listen to every line and say it out loud', 'Pick the reply that fits', TEST_HOW()]),
      ...(words.length ? [{ t: 'info', score: false, title: 'Words for this lesson', text: 'Tap each word to hear it. Say it out loud after the audio.', examples: words.map(w => [w.th, w.rom, w.en]) }] : []),
      ...steps.map(s => ({ ...s, phase: 'Practice' }))],
    test: () => shuffle([...steps.map(s => ({ ...s, test: true, phase: 'Test' })), ...pick(words, Math.min(3, words.length)).map(w => wq(w, true))]),
    place: () => [{ ...steps[0], test: true }]
  };
}
// Listening lesson built from Phase 3 words and phrases: hear it, pick the meaning; speak it back.
function listeningLesson(topicIds, title) {
  const ws = ALL_WORDS.filter(w => topicIds.includes(w.topic)), ps = ALL_PHRASES.filter(w => topicIds.includes(w.topic)), all = [...ws, ...ps];
  return { skills: ['listen'],
    teach: () => [intro([title, 'Understand words and phrases by ear, without reading'], ['Listen first, then choose', 'Use "slowly" when you need it', TEST_HOW()]),
      { t: 'info', score: false, title: 'Speak it back', text: 'Shadowing: play a phrase, then say it out loud at the same time as the audio. It trains your ear and your mouth together. (KhaoJai does not score pronunciation automatically.)', examples: ps.map(p => [p.th, p.rom, p.en]) },
      ...pick(all, 8).map(w => qHearW(w, all))],
    test: () => pick(all, 10).map(w => qHearW(w, all, true)) };
}

/* ---------- Phase 6: culture ---------- */
function cultureLesson(c) {
  const q = (it, test) => { const list = shuffle(it.o.map((x, i) => ({ x, i })));
    return T({ t: 'choose', skill: 'context', key: it.scene, q: it.scene, thai: true,
      o: list.map(({ x }) => test ? [x[0], x[1]] : [x[0], [x[1], x[2]].filter(Boolean).join(' — ')]), a: list.findIndex(y => y.i === it.a), why: it.why }, test); };
  return { skills: ['context'],
    teach: () => [intro([c.title, 'What Thais say — and why'], ['Read the explanation', 'Choose what fits each situation', TEST_HOW()]),
      ...c.explain.map(([title, text]) => ({ t: 'info', score: false, title, text })), ...c.items.map(it => q(it))],
    test: () => shuffle(c.items.map(it => q(it, true))) };
}

/* ---------- Phase 7: chat & slang ---------- */
function chatLesson(c) {
  const es = c.entries.map(([th, rom, en, reg]) => ({ th, rom, en, reg }));
  const qm = (e, test) => T({ t: 'choose', skill: 'chat', key: e.th, q: 'In a chat, what does this mean?', show: e.th, showR: e.rom, showNoSay: true, hideRom: !!test,
    ...opts(e, es, x => [x.en, ''], 4, x => x.en), why: `${e.th} (${e.rom}) = ${e.en}. Register: ${e.reg}.` }, test);
  const qr = (e, test) => T({ t: 'choose', skill: 'chat', key: e.th + ':reg', q: `Where would you use ${e.th}?`, show: e.th, showNoSay: true,
    o: [['With friends and online', ''], ['In a formal email to a company', ''], ['When meeting a monk', '']], a: 0, why: `${e.th} is ${e.reg} — keep it for friends and social media.` }, test);
  return { skills: ['chat'],
    teach: () => [intro([c.title, `Last checked: ${c.reviewed}. Slang changes — KhaoJai keeps this list updated.`], ['Read what each one means and when to use it', 'Practise reading them', TEST_HOW()]),
      ...c.explain.map(([title, text]) => ({ t: 'info', score: false, title, text })),
      { t: 'info', score: false, title: 'The list', rows: es.map(e => [e.th, `${e.rom} — ${e.en}`, e.reg]) },
      { t: 'match', phase: 'Practice', skill: 'chat', title: 'Match each one to its meaning', pairs: pick(es, 5).map(e => [e.th, e.en]) },
      ...pick(es, 4).map(e => qm(e))],
    test: () => shuffle([...pick(es, 6).map(e => qm(e, true)), ...pick(es, 2).map(e => qr(e, true))]) };
}

/* ---------- Phase 8: practical reading ---------- */
function practicalLesson(p) {
  const q = (it, test) => { const list = shuffle(it.o.map((x, i) => ({ x, i })));
    return T({ t: 'choose', skill: 'practical', key: it.show, q: it.q, show: it.show, showR: it.rom, hideRom: !!test, noSayBefore: !!test,
      o: list.map(({ x }) => [x, '']), a: list.findIndex(y => y.i === it.a), why: `${it.show} (${it.rom}) — ${it.why}`, sayAfter: it.show }, test); };
  return { skills: ['practical'],
    teach: () => [intro([p.title, p.intro], ['Read the Thai first — show romanization only if you need it', 'Check the meaning', TEST_HOW()]), ...pick(p.items, Math.ceil(p.items.length / 2)).map(it => q(it))],
    test: () => shuffle(p.items.map(it => q(it, true))) };
}

/* ---------- phase checks and the final course assessment ---------- */
function checkOf(lessonDefs, what, mark, per = 3) {
  return { skills: [...new Set(lessonDefs.flatMap(l => l.skills))], check: true, mark: () => mark,
    teach: () => checkIntro(what, mark),
    test: () => shuffle(lessonDefs.flatMap(l => pick(l.test(), per))).map(s => ({ ...s, test: true, phase: 'Test' })) };
}

function finalCheck() {
  const parts = [[checkConsonants(), 3], [checkVowels(), 2], [checkReading(), 3], [toneRulesLesson(), 2], ...TOPICS.slice(0, 6).map(t => [topicLesson(t), 1]),
    ...GRAMMAR.slice(0, 4).map(g => [grammarLesson(g), 1]), [listeningLesson(['T1', 'T2', 'T4'], ''), 2], ...CULTURE.map(c => [cultureLesson(c), 1]), ...CHAT.map(c => [chatLesson(c), 1]), ...PRACTICAL.map(p => [practicalLesson(p), 1])];
  return { skills: [...new Set(parts.flatMap(([l]) => l.skills))], check: true, final: true, mark: () => PASS.final,
    teach: () => [intro(['Everything from Phases 1–8: reading, rules, words, sentences, listening, real-life Thai, chat and practical reading', '30 questions, new each time'],
      ['Romanization is hidden where reading is tested', `Pass mark ${PASS.final}%, and at least ${PASS.skillMin}% in each skill`, 'Pass to receive your KhaoJai course-completion certificate'])],
    test: () => shuffle(parts.flatMap(([l, n]) => pick(l.test(), n))).map(s => ({ ...s, test: true, phase: 'Test' })) };
}

export const PHASES = [
  { n: 1, id: 'p1', title: 'Reading Foundations', th: 'พื้นฐานการอ่าน', color: 'lav',
    can: 'Recognize all 44 consonants and the vowels, combine them, and read simple Thai without romanization',
    lessons: [
      ...(ASSOC_ON ? [L_('C0', 'English letters → Thai letters', 'K → ก · T → ต ท · S → ส', assocLesson())] : []),
      L_('C1', 'Consonants ก–ฆ', 'ก ข ฃ ค ฅ ฆ', consonantLesson(0)),
      L_('C2', 'Consonants ง–ฌ', 'ง จ ฉ ช ซ ฌ', consonantLesson(1)),
      L_('V1', 'First vowels: อา อี อู ออ', 'กา  ดี  งู  ขอ', vowelLesson(1, 1, POSITIONS_INFO)),
      L_('C3', 'Consonants ญ–ฒ', 'ญ ฎ ฏ ฐ ฑ ฒ', consonantLesson(2)),
      L_('C4', 'Consonants ณ–ธ', 'ณ ด ต ถ ท ธ', consonantLesson(3)),
      L_('V2', 'Short vowels: อะ อิ อุ', 'จะ  ติ  ดุ', vowelLesson(2, 3, LENGTH_INFO)),
      L_('X1', 'Review 1', 'ก–ธ · first vowels', reviewLesson(3, [1, 2]), { review: true }),
      L_('C5', 'Consonants น–พ', 'น บ ป ผ ฝ พ', consonantLesson(4)),
      L_('C6', 'Consonants ฟ–ล', 'ฟ ภ ม ย ร ล', consonantLesson(5)),
      L_('V3', 'Vowels before: เอ แอ โอ', 'เท  แม  โต', vowelLesson(3, 5, BEFORE_INFO)),
      L_('C7', 'Consonants ว–ฮ', 'ว ศ ษ ส ห ฬ อ ฮ', consonantLesson(6)),
      L_('X2', 'Review 2: all 44 consonants', 'ก → ฮ', reviewLesson(6, [3]), { review: true }),
      L_('C8', 'Look-alike letters', 'ก ถ ภ · บ ป ษ', lookalikeLesson()),
      L_('C9', 'English letters with two Thai letters', 'ต ท · ก ค · ร ล', englishTrapsLesson()),
      L_('V4', 'Vowels: อึ อือ เออ เอาะ', 'มือ  เธอ  เกาะ', vowelLesson(4, 6)),
      L_('V5', 'Vowels with several parts', 'เอีย  เอือ  อัว', vowelLesson(5, 6, PARTS_INFO)),
      L_('V6', 'Special vowels: ไอ ใอ เอา อำ ฤ', 'ไป  ใจ  เรา  ทำ', vowelLesson(6, 6)),
      L_('X3', 'Review 3: all vowels', 'อา อี อู … เอีย อัว', reviewLesson(6, [1, 2, 3, 4, 5, 6]), { review: true }),
      L_('R1', 'Read new syllables', 'เก  โม  เสีย', readSyllablesLesson()),
      L_('R2', 'End sounds', 'มด  รถ  กัน', finalsLesson()),
      L_('R3', 'Read on your own', 'no romanization', readOwnLesson()),
      L_('F1', 'Phase check: consonants', '20 questions', checkConsonants()),
      L_('F2', 'Phase check: sounds', '14 questions', checkSounds()),
      L_('F3', 'Phase check: vowels', '16 questions', checkVowels()),
      L_('F4', 'Phase check: reading', '14 questions · no romanization', checkReading())
    ] },
  { n: 2, id: 'p2', title: 'Reading Rules', th: 'กฎการอ่าน', color: 'mint',
    can: 'Work out tones from the spelling and read harder words',
    lessons: [
      L_('G1', 'Mid, high and low class', 'กลาง · สูง · ต่ำ', classLesson()),
      L_('G2', 'Live and dead syllables', 'มา · มด', liveDeadLesson()),
      L_('G3', 'The five tones', 'ปา ป่า ป้า ป๊า ป๋า', toneIntroLesson()),
      L_('G4', 'Tone rules', 'ขา · มา · รถ · มาก', toneRulesLesson()),
      L_('G5', 'Leading ห and clusters', 'หมา · ปลา · ครู', clusterLesson()),
      L_('G6', 'Silent letters ์', 'ยักษ์ · จันทร์', silentLesson()),
      L_('G7', 'Phase check: reading rules', '16 questions', checkRules())
    ] },
  { n: 3, id: 'p3', title: 'Vocabulary & Meaning', th: 'คำศัพท์และความหมาย', color: 'peach',
    can: 'Understand, say and spell about 100 everyday words and phrases',
    lessons: [...TOPICS.map(t => L_(t.id, t.title, t.th, topicLesson(t))),
      L_('P3', 'Phase check: words', '16 questions', checkOf(TOPICS.map(topicLesson), 'the words from Phase 3', PASS.lesson, 2))] },
  { n: 4, id: 'p4', title: 'Sentences & Grammar', th: 'ประโยคและไวยากรณ์', color: 'sky',
    can: 'Build simple Thai sentences: word order, questions, no, time words, counting and politeness',
    lessons: [...GRAMMAR.map(g => L_(g.id, g.title, g.th, grammarLesson(g))),
      L_('P4', 'Phase check: sentences', '18 questions', checkOf(GRAMMAR.map(grammarLesson), 'Thai sentences and grammar', PASS.lesson, 3))] },
  { n: 5, id: 'p5', title: 'Listening & Speaking', th: 'ฟังและพูด', color: 'pink',
    can: 'Follow short everyday conversations and reply',
    lessons: [
      L_('L1', 'Say hello', 'สวัสดี · ขอบคุณ', stationLesson('s1')),
      L_('L2', 'What\'s your name?', 'คุณชื่ออะไร', stationLesson('s2')),
      L_('L3', 'At the café', 'ชาเย็น หวานน้อย', stationLesson('s3')),
      L_('L4', 'Not spicy, please', 'ไม่เผ็ด', stationLesson('s4')),
      L_('L5', 'Listening: numbers & time', 'ฟังตัวเลข เวลา', listeningLesson(['T2', 'T3'], 'Numbers, days and times by ear')),
      L_('L6', 'Listening: out and about', 'ฟังเวลาเดินทาง ซื้อของ', listeningLesson(['T4', 'T5', 'T6'], 'Food, shopping and directions by ear')),
      L_('P5', 'Phase check: listening', '15 questions', checkOf(['s1', 's2', 's3', 's4'].map(x => stationLesson(x)).concat([listeningLesson(['T2', 'T3', 'T4', 'T5', 'T6'], 'Listening')]), 'listening and replying', PASS.lesson, 3))] },
  { n: 6, id: 'p6', title: 'Real Thai & Culture', th: 'ภาษาไทยในชีวิตจริง', color: 'lemon',
    can: 'Choose the right words for the person and the situation',
    lessons: [
      L_('K1', 'Meet a Thai family', 'ไหว้ · กินข้าวยัง', stationLesson('m1', () => 'context')),
      ...CULTURE.map(c => L_(c.id, c.title, c.th, cultureLesson(c))),
      L_('P6', 'Phase check: real Thai', '12 questions', checkOf([stationLesson('m1', () => 'context'), ...CULTURE.map(cultureLesson)], 'choosing words for the situation', PASS.lesson, 3))] },
  { n: 7, id: 'p7', title: 'Chat, Slang & Internet Thai', th: 'ภาษาแชตและสแลง', color: 'lav',
    can: 'Read Thai chat messages, laughs, short forms and popular slang',
    lessons: [
      L_('H1', 'Chat like a Thai', '555 · พน · จ้า', stationLesson('s5', () => 'chat')),
      L_('H2', 'Sulking & teasing', 'งอน · เขิน · แซว', stationLesson('s6', () => 'chat')),
      ...CHAT.map(c => L_(c.id, c.title, c.th, chatLesson(c))),
      L_('P7', 'Phase check: chat Thai', '12 questions', checkOf([stationLesson('s5', () => 'chat'), stationLesson('s6', () => 'chat'), ...CHAT.map(chatLesson)], 'chat and internet Thai', PASS.lesson, 3))] },
  { n: 8, id: 'p8', title: 'Practical Thai', th: 'ใช้ภาษาไทยได้จริง', color: 'mint',
    can: 'Read signs, menus, messages and travel information on your own',
    lessons: [...PRACTICAL.map(p => L_(p.id, p.title, p.th, practicalLesson(p))),
      L_('FINAL', 'Final course assessment', '30 questions · all phases', finalCheck())] }
];

export const WRITING = { id: 'wr', title: 'Writing track', th: 'ฝึกเขียน', color: 'peach', optional: true,
  lessons: [
    L_('W1', 'How Thai is written', 'ก ข ค ง จ', writeLesson(['ก', 'ข', 'ค', 'ง', 'จ'], 2, WRITING_RULES)),
    L_('W2', 'Write mid-class letters', 'ก จ ฎ ฏ ด ต บ ป อ', writeLesson(LETTERS.filter(x => x.cls === 'mid').map(x => x.c), 3)),
    L_('W3', 'Write high-class letters', 'ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห', writeLesson(LETTERS.filter(x => x.cls === 'high').map(x => x.c), 3)),
    L_('W4', 'Write low-class letters (1)', 'ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท', writeLesson(LETTERS.filter(x => x.cls === 'low').slice(0, 12).map(x => x.c), 3)),
    L_('W5', 'Write low-class letters (2)', 'ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ', writeLesson(LETTERS.filter(x => x.cls === 'low').slice(12).map(x => x.c), 3)),
    L_('W6', 'Write from sound', '🔊 → ✍️', writeFromSound()),
    L_('W7', 'Spell words', 'ไก่ · ปลา · แมว', spellLesson())
  ] };

export const ALL_LESSONS = [...PHASES.flatMap(p => p.lessons.map((l, i) => ({ ...l, phase: p.n, idx: i }))), ...WRITING.lessons.map((l, i) => ({ ...l, phase: 'W', idx: i, optional: true }))];
export const LESSON = Object.fromEntries(ALL_LESSONS.map(l => [l.id, l]));
export const passMark = l => l.mark ? l.mark() : l.review ? PASS.review : PASS.lesson;
export const phaseOf = id => LESSON[id].phase === 'W' ? WRITING : PHASES[LESSON[id].phase - 1];

/* ---------- placement check (for learners who already know some Thai) ---------- */
export function placementSteps() {
  const steps = [];
  PHASES[0].lessons.forEach(l => { if (l.place) l.place().forEach(s => steps.push({ ...s, place: l.id, phase: 'Placement' })); });
  return steps;
}
// Reviews count as placed when every lesson they cover was placed.
export const REVIEW_COVERS = { X1: ['C1', 'C2', 'V1', 'C3', 'C4', 'V2'], X2: ['C5', 'C6', 'V3', 'C7'], X3: ['V4', 'V5', 'V6'] };

/* ---------- targeted practice ---------- */
// Builds a short practice set for the items a learner missed: re-teach, then ask again in a new way.
export function remedialSteps(missed) {
  const steps = [];
  const seen = new Set();
  missed.forEach(m => {
    if (!m.key || seen.has(m.skill + m.key)) return; seen.add(m.skill + m.key);
    const k = m.key;
    if (L[k]) {
      steps.push({ t: 'card', c: k, score: false, key: k, phase: 'Review' });
      if (m.skill === 'sound' || m.skill === 'discrim') { const pair = PAIRS.find(p => p.includes(k)); steps.push(pair ? qDiscrim(pair[0], pair[1]) : qSound(k, [])); }
      else if (m.skill === 'final') steps.push({ t: 'info', score: false, title: `${k} at the end of a syllable`, text: `${k} sounds like "${FINALS[L[k].fin]?.rom || '—'}" at the end. At the start it is "${SOUNDS[L[k].snd].rom}".` });
      else if (m.skill === 'write') steps.push({ t: 'trace', phase: 'Review', skill: 'write', key: k, c: k });
      else { steps.push(qName(k, [])); steps.push(qShape(k, [])); }
    } else if (V[k]) {
      steps.push({ t: 'vcard', v: V[k], score: false, key: k, phase: 'Review', cons: pick(MODERN.filter(COMBO_OK), 3) });
      steps.push(qVowelPick(V[k], VOWELS));
    } else if (m.combo) {
      const s = syl(m.combo.c, m.combo.v);
      steps.push({ t: 'info', score: false, phase: 'Review', title: `Reading ${s.th}`, text: `Consonant ${s.c} ("${onset(s.c) || 'silent'}") + vowel ${s.v} ("${V[s.v].rom}", ${s.len}) → "${s.rom}".`, examples: [[s.th, s.rom, 'listen']] });
      const pool = comboPool([s.c, ...pick(MODERN.filter(COMBO_OK), 3)], VOWELS.filter(v => v.set <= 6 && v.v !== 'ฤ').map(v => v.v));
      steps.push(qCombo(pick(pool.filter(x => x.v === s.v || x.c === s.c), 1)[0] || s, pool, false, true));
    } else {
      const w = [...READ_WORDS, ...CVC_WORDS].find(x => x.th === k);
      if (w) steps.push({ t: 'info', score: false, phase: 'Review', title: `Reading ${w.th}`, text: `${w.th} is read "${w.rom}". Look at each part: find the first consonant, the vowel around it, then any end consonant.`, examples: [[w.th, w.rom, w.en]] });
      else steps.push({ t: 'info', score: false, phase: 'Review', title: `Look again: ${k}`, text: m.why || '' });
    }
  });
  return steps;
}

// Practice for one skill using things the learner has already met (dashboard "Practise this skill").
export function skillDrill(skill, keys) {
  const letters = keys.filter(k => L[k] && !L[k].old), vows = keys.filter(k => V[k]).map(k => V[k]);
  const lp = letters.length >= 4 ? letters : MODERN.slice(0, 12);
  const vp = vows.length >= 4 ? vows : vowelSet(1).concat(vowelSet(2));
  const comboP = comboPool(lp.filter(COMBO_OK), vp.map(v => v.v));
  switch (skill) {
    case 'shape': return pick(lp, 8).map(c => qShape(c, []));
    case 'name': return pick(lp, 8).map(c => qName(c, []));
    case 'sound': return pick(lp, 8).map(c => qSound(c, []));
    case 'discrim': return shuffle(PAIRS).slice(0, 6).map(([a, b]) => qDiscrim(a, b));
    case 'vowel': return pick(vp, 8).map(v => qVowelSee(v, VOWELS));
    case 'combo': return pick(comboP, 8).map(s => qCombo(s, comboP, false, true));
    case 'final': return finalsLesson().test().map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'read': { const w = [...READ_WORDS, ...CVC_WORDS]; return pick(w, 8).map(x => qWord(x, w, false, 'read', true)); }
    case 'tone': return toneRulesLesson().test().map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'write': return pick(lp, 4).map(c => ({ t: 'trace', phase: 'Practice', skill: 'write', key: c, c }));
    case 'meaning': case 'listen': return wordDrill(keys.filter(k => WORD[k]), skill === 'listen' ? 'listen' : 'review');
    case 'spell': return wordDrill(keys.filter(k => WORD[k]), 'spell');
    case 'grammar': return shuffle(GRAMMAR).slice(0, 3).flatMap(g => grammarLesson(g).test().slice(0, 3)).map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'context': return shuffle(CULTURE).flatMap(c => cultureLesson(c).test().slice(0, 3)).map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'chat': return CHAT.flatMap(c => chatLesson(c).test().slice(0, 4)).map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'practical': return shuffle(PRACTICAL).flatMap(p => practicalLesson(p).test().slice(0, 2)).map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'convo': return ['s1', 's2', 's3', 's4'].flatMap(id => stationLesson(id).test().slice(0, 2)).map(s => ({ ...s, test: false, phase: 'Practice' }));
    case 'assoc': return LESSON.C0 ? LESSON.C0.test().slice(0, 8).map(s => ({ ...s, test: false, phase: 'Practice' })) : [];
  }
  return [];
}

// Spaced-repetition review for letters and vowels that are due.
export function reviewDrill(keys) {
  return shuffle(keys).slice(0, 8).map((k, i) => L[k] ? (i % 2 ? qSound(k, []) : qName(k, [])) : V[k] ? qVowelSee(V[k], VOWELS) : null).filter(Boolean).map(s => ({ ...s, phase: 'Review' }));
}

// Word review (Practice tab): the words a learner has met, mixed question types. Missed words come first.
export function wordDrill(ths, mode = 'review') {
  let ws = uniq(ths).map(t => WORD[t]).filter(Boolean);
  if (ws.length < 4) ws = [...ws, ...pick(ALL_WORDS.filter(w => !ws.includes(w)), 4 - ws.length)];
  const pool = ws.length >= 4 ? ws : ALL_WORDS, list = ws.slice(0, 10);
  if (mode === 'spell') return list.slice(0, 8).map((w, i) => ({ ...spellQ(w, false, i), phase: 'Review' }));
  if (mode === 'listen') return list.slice(0, 8).map(w => ({ ...qHearW(w, pool), phase: 'Review' }));
  return list.slice(0, 8).map((w, i) => ({ ...[qMeaning, qThaiFor, qHearW][i % 3](w, pool), phase: 'Review' }));
}
