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
import { ASSOC, ASSOC_READY } from './associations.js';
import { PASS } from '../config.js';

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
  assoc:   { label: 'Link English letters to Thai letters', short: 'English links' }
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
  const engOf = c => G.find(g => g.thai.includes(c))?.eng;
  const allThai = G.flatMap(g => g.thai);
  const engs = G.map(g => g.eng);
  const qThai2Eng = (c, test) => T({ t: 'choose', skill: 'assoc', key: c, q: 'Which English letter helps you remember this Thai letter?', show: c,
    ...opts(engOf(c), engs, asText), why: `${c} "${nameOf(c)}" (${L[c].rom}) — memory aid: ${engOf(c)}.` }, test);
  const qEng2Thai = (g, test) => { const c = g.thai[Math.floor(Math.random() * g.thai.length)];
    return T({ t: 'choose', skill: 'assoc', key: c, big: true, q: `Which Thai letter can English "${g.eng}" help you remember?`,
      ...opts(c, [...allThai.filter(x => !g.thai.includes(x)), ...(g.compare ? [g.compare] : [])], asChar), why: `"${g.eng}" → ${g.thai.join(' ')}. ${g.note}` }, test); };
  const qHear = (c, test) => T({ t: 'listen', skill: 'assoc', key: c, say: nameOf(c), sayRom: L[c].rom,
    ...opts(engOf(c), engs, asText), why: `You heard "${nameOf(c)}" — ${c}, memory aid ${engOf(c)}.` }, test);
  return {
    skills: ['assoc'],
    teach: () => {
      const steps = [intro(['English letters you already know can help you remember Thai letters', 'Each Thai letter\'s name and sound', 'Where the real Thai sound is different'],
        ['Look at each group and listen', 'Practise matching both ways', TEST_HOW()])];
      G.forEach(g => steps.push({ t: 'info', score: false, title: `${g.eng} → ${g.thai.join('  ')}`,
        text: `${g.note} Start of a word: "${g.start}"${g.end ? ` · at the end: "${g.end}"` : ''}. A memory aid only — always listen to the Thai sound.`,
        rows: [...g.thai, ...(g.compare ? [g.compare] : [])].map(c => [c, `${nameOf(c)} · ${L[c].rom}`, g.compare === c ? `Compare: this is not "${g.eng}"` : '']) }));
      shuffle(allThai).forEach(c => steps.push(qThai2Eng(c)));
      shuffle(G).forEach(g => steps.push(qEng2Thai(g)));
      pick(allThai, Math.min(4, allThai.length)).forEach(c => steps.push(qHear(c)));
      return steps;
    },
    test: () => shuffle([...allThai.map(c => qThai2Eng(c, true)), ...G.map(g => qEng2Thai(g, true)), ...pick(allThai, Math.min(3, allThai.length)).map(c => qHear(c, true))]),
    place: () => pick(allThai, 2).map(c => qThai2Eng(c, true))
  };
}
const ASSOC_ON = ASSOC_READY && ASSOC.filter(g => g.status === 'reviewed').length >= 2;

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
  { n: 3, id: 'p3', title: 'Vocabulary & Meaning', th: 'คำศัพท์และความหมาย', color: 'peach', soon: true, can: 'Learn common words, everyday expressions and their meanings', lessons: [] },
  { n: 4, id: 'p4', title: 'Sentences & Grammar', th: 'ประโยคและไวยากรณ์', color: 'sky', soon: true, can: 'Build Thai sentences: word order, particles, questions and negation', lessons: [] },
  { n: 5, id: 'p5', title: 'Listening, Speaking & Real-life Thai', th: 'ฟัง พูด และใช้จริง', color: 'pink', life: true, can: 'Everyday conversations, chat and culture', lessons: [] }
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
  }
  return [];
}

// Spaced-repetition review for letters and vowels that are due.
export function reviewDrill(keys) {
  return shuffle(keys).slice(0, 8).map((k, i) => L[k] ? (i % 2 ? qSound(k, []) : qName(k, [])) : V[k] ? qVowelSee(V[k], VOWELS) : null).filter(Boolean).map(s => ({ ...s, phase: 'Review' }));
}
