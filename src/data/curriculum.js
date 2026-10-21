// The KhaoJai Thai Foundation: one ordered path, five stages.
// 1 Recognize letters → 2 Sounds → 3 Reading → 4 Writing → 5 Foundation check.
// Real-life Thai (conversation, chat, culture) unlocks only after the foundation is passed.
//
// Each lesson's build() returns an ordered list of steps:
//   intro · card (one letter) · vcard (one vowel) · info (a concept with examples)
//   choose · listen · match · build (spell/arrange) · tone · trace · write
// Steps with `score: false` teach; every other step counts toward the lesson score.
import { LETTERS, L, nameOf, SOUNDS, FINALS, LOOKALIKES, SAME_SOUND, VOWELS, CLASS_INFO } from './letters.js';
import { PASS } from '../config.js';

/* ---------- small helpers ---------- */
const rnd = n => Math.floor(Math.random() * n);
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; };
const pick = (a, n) => shuffle(a).slice(0, n);
const ALL = LETTERS.map(x => x.c);
const MODERN = LETTERS.filter(x => !x.old).map(x => x.c);

// Build a 4-option question; returns { o, a } with the answer placed randomly.
function opts(answer, pool, make, n = 4) {
  const others = pick(pool.filter(x => x !== answer), n - 1);
  const list = shuffle([answer, ...others]);
  return { o: list.map(make), a: list.indexOf(answer) };
}
const asChar = c => [c, ''];
const asName = c => [`${L[c].say} ${L[c].word}`, L[c].rom];
const distractorsFor = (c, group) => {
  // prefer look-alikes and same-sound letters so questions test real recognition
  const near = new Set(group);
  LOOKALIKES.forEach(s => s.includes(c) && s.forEach(x => near.add(x)));
  SAME_SOUND.forEach(s => s.letters.includes(c) && s.letters.forEach(x => near.add(x)));
  const pool = [...near].filter(x => x !== c);
  return pool.length >= 3 ? pool : [...pool, ...pick(MODERN.filter(x => x !== c && !pool.includes(x)), 3 - pool.length)];
};

/* ---------- question makers (letters) ---------- */
const qNameToChar = (c, group, phase = 'Practice') => ({ t: 'choose', phase, key: c, big: true,
  q: 'Which letter is this?', prompt: { th: `${L[c].say} ${L[c].word}`, rom: L[c].rom, en: L[c].en, pic: L[c].pic },
  ...opts(c, distractorsFor(c, group), asChar),
  why: `${c} is called "${L[c].say} ${L[c].word}" (${L[c].rom}) — ${L[c].word} means ${L[c].en}.` });

const qCharToName = (c, group, phase = 'Practice') => ({ t: 'choose', phase, key: c, thai: true,
  q: 'What is this letter called?', show: c,
  ...opts(c, distractorsFor(c, group), asName),
  why: `${c} = "${L[c].say} ${L[c].word}" (${L[c].rom}). Picture: ${L[c].pic} ${L[c].en}.` });

const qListen = (c, group, phase = 'Practice') => ({ t: 'listen', phase, key: c, big: true,
  say: nameOf(c), sayRom: L[c].rom,
  ...opts(c, distractorsFor(c, group), asChar),
  why: `You heard "${L[c].say} ${L[c].word}" (${L[c].rom}) — that is ${c}.` });

const qPicToChar = (c, group, phase = 'Practice') => ({ t: 'choose', phase, key: c, big: true,
  q: 'Which letter goes with this picture word?', prompt: { pic: L[c].pic, th: L[c].word, rom: L[c].rom.split(' ').slice(1).join(' '), en: L[c].en },
  ...opts(c, distractorsFor(c, group), asChar),
  why: `${L[c].word} (${L[c].en}) is the name word for ${c}: "${L[c].say} ${L[c].word}".` });

const matchSet = (letters, phase = 'Practice') => ({ t: 'match', phase, keys: letters,
  pairs: letters.map(c => [c, `${L[c].pic} ${L[c].en}`]) });

/* ---------- Stage 1: recognize the 44 consonants ---------- */
const GROUPS = [
  ['ก', 'ข', 'ฃ', 'ค', 'ฅ', 'ฆ'], ['ง', 'จ', 'ฉ', 'ช', 'ซ', 'ฌ'], ['ญ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ'], ['ณ', 'ด', 'ต', 'ถ', 'ท', 'ธ'],
  ['น', 'บ', 'ป', 'ผ', 'ฝ', 'พ'], ['ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล'], ['ว', 'ศ', 'ษ', 'ส', 'ห', 'ฬ', 'อ', 'ฮ']
];

function letterLesson(gi) {
  const g = GROUPS[gi], prev = GROUPS.slice(0, gi).flat();
  return () => {
    const steps = [{ t: 'intro', score: false,
      learn: [`${g.length} letters: ${g.join(' ')}`, 'The name of each letter, e.g. "กอ ไก่" (gor gai)', 'A picture word to help you remember each one'],
      how: ['Look at each letter card and listen', 'Practise: pick the letter, listen, match', `Check: get ${PASS.lesson}% right on the first try to complete the lesson`] }];
    g.forEach(c => steps.push({ t: 'card', c, score: false }));
    shuffle(g).forEach(c => steps.push(qNameToChar(c, g)));
    shuffle(g).forEach(c => steps.push(qListen(c, g)));
    steps.push(matchSet(g.slice(0, 5)));
    shuffle(g).forEach((c, i) => steps.push(i % 2 ? qPicToChar(c, g, 'Check') : qCharToName(c, g, 'Check')));
    if (prev.length) pick(prev, 3).forEach(c => steps.push(qCharToName(c, prev, 'Review')));
    return steps;
  };
}

function lookalikeLesson() {
  const steps = [{ t: 'intro', score: false,
    learn: ['Letters that are easy to mix up', 'The small detail that tells them apart: the head (loop), a tail, a notch'],
    how: ['Compare each set', 'Pick the right letter from its look-alikes', `Check: ${PASS.lesson}% to complete`] }];
  LOOKALIKES.forEach(set => steps.push({ t: 'info', score: false, title: 'Look closely', compare: set,
    text: set.map(c => `${c} — ${L[c].say} ${L[c].word} (${L[c].rom})`).join(' · ') }));
  shuffle(LOOKALIKES).forEach((set, i) => {
    const c = set[rnd(set.length)];
    const base = { phase: i < 7 ? 'Practice' : 'Check', key: c };
    steps.push(i % 2
      ? { t: 'choose', ...base, big: true, q: 'Which letter is this?', prompt: { th: `${L[c].say} ${L[c].word}`, rom: L[c].rom, en: L[c].en, pic: L[c].pic }, ...opts(c, set.length >= 4 ? set : [...set, ...pick(MODERN.filter(x => !set.includes(x)), 4 - set.length)], asChar), why: `Look-alikes: ${set.join(' ')}. ${c} is "${L[c].say} ${L[c].word}".` }
      : { t: 'choose', ...base, thai: true, q: 'What is this letter called?', show: c, ...opts(c, set.length >= 4 ? set : [...set, ...pick(MODERN.filter(x => !set.includes(x)), 4 - set.length)], asName), why: `${c} is "${L[c].say} ${L[c].word}". Its look-alikes: ${set.filter(x => x !== c).join(' ')}.` });
  });
  return steps;
}

function orderLesson() {
  const steps = [{ t: 'intro', score: false,
    learn: ['The order of the Thai alphabet, ก to ฮ', 'Thai dictionaries use this order, so it helps you look words up'],
    how: ['Sing along in Letters → Sing-along any time', 'Answer "what comes next?" and fill the gaps', `Check: ${PASS.lesson}% to complete`] }];
  for (let k = 0; k < 6; k++) {
    const i = 1 + rnd(ALL.length - 2), c = ALL[i], before = ALL[i - 1];
    steps.push({ t: 'choose', phase: k < 3 ? 'Practice' : 'Check', key: c, big: true, q: `Which letter comes right after ${before}?`,
      ...opts(c, [ALL[i + 1], ALL[i - 1], ...distractorsFor(c, [])], asChar), why: `… ${before} ${c} ${ALL[i + 1] || ''} … (${L[before].say} ${L[before].word}, then ${L[c].say} ${L[c].word})` });
  }
  for (let k = 0; k < 5; k++) {
    const i = 2 + rnd(ALL.length - 4), c = ALL[i];
    steps.push({ t: 'choose', phase: 'Check', key: c, big: true, q: `Fill the gap: ${ALL[i - 2]} ${ALL[i - 1]} _ ${ALL[i + 1]}`,
      ...opts(c, [ALL[i + 2] || ALL[i - 3], ...distractorsFor(c, [])], asChar), why: `${ALL[i - 2]} ${ALL[i - 1]} ${c} ${ALL[i + 1]}` });
  }
  return steps;
}

/* ---------- Stage 2: sounds ---------- */
const sndName = s => SOUNDS[s].rom;
function puffLesson() {
  const pairs = [['ก', 'ค'], ['ต', 'ท'], ['ป', 'พ'], ['จ', 'ช']];
  const steps = [{ t: 'intro', score: false,
    learn: ['Thai has sounds with and without a "puff of air"', 'Why KhaoJai writes ก as "g", ต as "dt" and ป as "bp"', 'That romanization is only an approximation of Thai sounds'],
    how: ['Read the sound notes and listen', 'Hold your hand in front of your mouth while you say them', `Check: ${PASS.lesson}% to complete`] },
  { t: 'info', score: false, title: 'No puff vs. puff of air',
    text: 'English "k" in "kite" has a puff of air; in "skin" it doesn\'t. Thai uses this difference to tell words apart. ก ต ป จ have NO puff. ข/ค ท/ถ พ/ผ ช/ฉ HAVE a puff.',
    rows: pairs.map(([a, b]) => [`${a}  ${SOUNDS[L[a].snd].rom}`, `${b}  ${SOUNDS[L[b].snd].rom}`, `${SOUNDS[L[a].snd].ipa} vs ${SOUNDS[L[b].snd].ipa}`]) },
  { t: 'info', score: false, title: 'About romanization',
    text: 'Romanization (Thai written with English letters) helps you start before you can read Thai. It can\'t show every Thai sound or the tone, so always listen too. KhaoJai uses one system everywhere: g / k, dt / t, bp / p, j / ch for no-puff / puff.',
    examples: [['ไก่', 'gai', 'chicken'], ['ไข่', 'kai', 'egg'], ['ตา', 'dtaa', 'eye'], ['ทา', 'taa', 'to paint on'], ['ปา', 'bpaa', 'to throw'], ['พา', 'paa', 'to take someone']] }];
  pairs.forEach(([a, b], i) => {
    steps.push({ t: 'choose', phase: 'Practice', key: a, big: true, q: 'Which letter has NO puff of air?', ...opts(a, [b, ...SAME_SOUND.find(s => s.letters.includes(b))?.letters || [b]], asChar), why: `${a} (${SOUNDS[L[a].snd].rom}) has no puff. ${b} (${SOUNDS[L[b].snd].rom}) has a puff of air.` });
    steps.push({ t: 'choose', phase: i < 2 ? 'Practice' : 'Check', key: b, q: `How does KhaoJai romanize the start of ${b}?`, show: b,
      ...opts(SOUNDS[L[b].snd].rom, [SOUNDS[L[a].snd].rom, 'd', 'b', 'g', 'th', 'ph'].filter((x, k, arr) => arr.indexOf(x) === k), x => [x, '']), why: SOUNDS[L[b].snd].en });
  });
  steps.push({ t: 'listen', phase: 'Check', say: 'ไข่', sayRom: 'kai', thai: true, o: [['ไก่', 'gai · chicken'], ['ไข่', 'kai · egg']], a: 1, why: 'ไข่ (kai, egg) has a puff of air; ไก่ (gai, chicken) does not.' });
  steps.push({ t: 'listen', phase: 'Check', say: 'ตา', sayRom: 'dtaa', thai: true, o: [['ตา', 'dtaa · eye'], ['ทา', 'taa · to paint on']], a: 0, why: 'ตา (dtaa) has no puff of air.' });
  return steps;
}

function sameSoundLesson() {
  const steps = [{ t: 'intro', score: false,
    learn: ['Why several Thai letters make the same sound', 'For example ส, ศ and ษ all start with "s"', 'What the difference is: spelling history and consonant class, not sound'],
    how: ['Read each sound family', 'Find the letter that sounds the same', `Check: ${PASS.lesson}% to complete`] }];
  SAME_SOUND.slice(0, 6).forEach(f => steps.push({ t: 'info', score: false, title: `Same "${sndName(f.snd)}" sound`, compare: f.letters, text: f.why }));
  shuffle(SAME_SOUND).slice(0, 10).forEach((f, i) => {
    const [a, b] = pick(f.letters, 2);
    const others = pick(MODERN.filter(x => L[x].snd !== f.snd), 3);
    const list = shuffle([b, ...others]);
    steps.push({ t: 'choose', phase: i < 5 ? 'Practice' : 'Check', key: b, big: true, q: `Which letter starts with the same sound as ${a}?`,
      o: list.map(asChar), a: list.indexOf(b), why: `${a} and ${b} both start with "${sndName(f.snd)}". ${f.why}` });
  });
  return steps;
}

function newSoundsLesson() {
  const set = ['ง', 'ป', 'ต', 'ร', 'อ'];
  const steps = [{ t: 'intro', score: false, learn: ['Thai sounds that English doesn\'t have — or uses differently', 'ง at the start of a word, ป "bp", ต "dt", the Thai ร, and silent อ'],
    how: ['Read each card and listen', 'Answer sound questions', `Check: ${PASS.lesson}% to complete`] }];
  set.forEach(c => steps.push({ t: 'card', c, score: false, focus: 'sound' }));
  steps.push({ t: 'choose', phase: 'Practice', key: 'ง', q: 'How does งู (snake) start?', show: 'งู', ...opts('ng', ['n', 'g', 'm'], x => [x, '']), why: 'ง is "ng" as in "sing" — Thai uses it at the start too: งู ngoo.' });
  steps.push({ t: 'choose', phase: 'Practice', key: 'อ', big: true, q: 'Which letter is silent at the start of a word and just carries the vowel?', ...opts('อ', ['ห', 'ฮ', 'ง'], asChar), why: SOUNDS.silent.en });
  steps.push({ t: 'choose', phase: 'Practice', key: 'ป', q: 'Which English word has the same "p" as ป?', ...opts('spin', ['pin', 'phone', 'boy'], x => [x, '']), why: SOUNDS.bp.en });
  steps.push({ t: 'choose', phase: 'Check', key: 'ต', q: 'Which English word has the same "t" as ต?', ...opts('stop', ['top', 'the', 'day'], x => [x, '']), why: SOUNDS.dt.en });
  steps.push({ t: 'choose', phase: 'Check', key: 'ร', q: 'How is ร usually pronounced in careful speech?', ...opts('A tapped or rolled r', ['Like English "w"', 'Like English "h"', 'Silent'], x => [x, '']), why: SOUNDS.r.en + ' ' + SOUNDS.r.vs });
  steps.push({ t: 'listen', phase: 'Check', say: 'งู', sayRom: 'ngoo', thai: true, o: [['งู', 'ngoo · snake'], ['หนู', 'noo · mouse'], ['ปู', 'bpoo · crab']], a: 0, why: 'งู starts with ng.' });
  return steps;
}

function hearLesson() {
  const steps = [{ t: 'intro', score: false, learn: ['Hear a letter name and find the letter', 'Letters that sound alike are told apart by their name word'],
    how: ['Listen (tap the speaker again any time)', 'Choose the letter', `Check: ${PASS.lesson}% to complete`] }];
  pick(MODERN, 12).forEach((c, i) => steps.push(qListen(c, [], i < 5 ? 'Practice' : 'Check')));
  return steps;
}

function finalsLesson() {
  const steps = [{ t: 'intro', score: false, learn: ['Many letters change sound at the END of a syllable', 'Only 8 end sounds exist: k, t, p, n, m, ng, y/i, w/o'],
    how: ['Read the table', 'Answer "what does it sound like at the end?"', `Check: ${PASS.lesson}% to complete`] },
  { t: 'info', score: false, title: 'End sounds', text: 'Thai end consonants are short and unreleased — your mouth stops without letting the sound out.',
    rows: Object.entries(FINALS).map(([k, f]) => [LETTERS.filter(x => x.fin === k).map(x => x.c).join(' '), f.rom, f.en]) },
  { t: 'info', score: false, title: 'Examples', text: 'Listen and look at the last letter.',
    examples: [['มด', 'mot', 'ant'], ['รถ', 'rot', 'car'], ['บาท', 'baat', 'baht'], ['จาน', 'jaan', 'plate'], ['ลม', 'lom', 'wind'], ['ยาง', 'yaang', 'rubber'], ['ปาก', 'bpaak', 'mouth'], ['ชอบ', 'chorp', 'to like']] }];
  const qs = [['ด', 't'], ['ร', 'n'], ['ล', 'n'], ['ส', 't'], ['บ', 'p'], ['ค', 'k'], ['ญ', 'n'], ['ท', 't'], ['พ', 'p'], ['ง', 'ng']];
  qs.forEach(([c, f], i) => steps.push({ t: 'choose', phase: i < 5 ? 'Practice' : 'Check', key: c, q: `At the END of a syllable, ${c} sounds like…`, show: c,
    ...opts(FINALS[f].rom, ['k', 't', 'p', 'n', 'm', 'ng', 'd', 'r', 'l', 's'].filter(x => x !== FINALS[f].rom), x => [x, '']), why: `${c} at the end = "${FINALS[f].rom}" (${FINALS[f].en}). At the start it is "${SOUNDS[L[c].snd].rom}".` }));
  return steps;
}

/* ---------- Stage 3: reading ---------- */
const W = (th, rom, en, tone) => ({ th, rom, en, tone });
const READ1 = [W('มา', 'maa', 'to come'), W('ตา', 'dtaa', 'eye'), W('ดี', 'dee', 'good'), W('ปู', 'bpoo', 'crab'), W('งู', 'ngoo', 'snake'), W('โต', 'dtoh', 'big'), W('เท', 'teh', 'to pour'), W('ชา', 'chaa', 'tea'), W('นา', 'naa', 'rice field'), W('ยา', 'yaa', 'medicine'), W('แก', 'gae', 'you (informal)'), W('รอ', 'ror', 'to wait')];
const READ2 = [W('ไป', 'bpai', 'to go'), W('ใจ', 'jai', 'heart, mind'), W('เรา', 'rao', 'we'), W('ทำ', 'tam', 'to do, make'), W('จะ', 'ja', 'will'), W('ไฟ', 'fai', 'fire, light'), W('ดุ', 'du', 'fierce')];
const READ3 = [W('กิน', 'gin', 'to eat'), W('นอน', 'norn', 'to sleep'), W('ลม', 'lom', 'wind'), W('มด', 'mot', 'ant'), W('รถ', 'rot', 'car'), W('ปาก', 'bpaak', 'mouth'), W('ดาว', 'daao', 'star'), W('จาน', 'jaan', 'plate'), W('ชอบ', 'chorp', 'to like'), W('บาท', 'baat', 'baht')];
const romOpts = (w, pool) => opts(w.rom, pool.map(x => x.rom), x => [x, '']);
const enOpts = (w, pool) => opts(w.en, pool.map(x => x.en), x => [x, '']);

function vowelLesson(list, words, title) {
  return () => {
    const steps = [{ t: 'intro', score: false, learn: [`Vowels: ${list.map(v => v.v).join(' ')}`, 'Where each vowel sits around the consonant (before, after, above, below)', 'How to read consonant + vowel'],
      how: ['Learn each vowel card', 'Read syllables and pick the romanization', `Check: ${PASS.lesson}% to complete`] },
    { t: 'info', score: false, title: 'Vowels go around the consonant', text: 'In Thai, a vowel can be written before, after, above or below the consonant — but you always SAY the consonant first. อ is used here as a stand-in for "any consonant".',
      examples: [['เก', 'geh', 'เ is written first, but you say ก first'], ['กา', 'gaa', 'า comes after'], ['กี', 'gee', 'ี sits above'], ['กู', 'goo', 'ู sits below']] }];
    list.forEach(v => steps.push({ t: 'vcard', v, score: false }));
    list.forEach((v, i) => steps.push({ t: 'choose', phase: i < list.length / 2 ? 'Practice' : 'Check', q: `Which vowel says "${v.rom}"?`, big: true,
      ...opts(v.v, list.filter(x => x.rom !== v.rom).map(x => x.v).concat(VOWELS.filter(x => x.rom !== v.rom).map(x => x.v)).filter((x, k, a) => a.indexOf(x) === k), x => [x, '']), why: `${v.v} = "${v.rom}" (${v.len}). It sits ${v.pos} the consonant.${v.note ? ' ' + v.note : ''}` }));
    words.forEach((w, i) => steps.push({ t: 'choose', phase: i < words.length / 2 ? 'Practice' : 'Check', q: 'Read it. How does it sound?', show: w.th, sayShow: true, noRom: true,
      ...romOpts(w, words), why: `${w.th} = ${w.rom} (${w.en}).` }));
    return steps;
  };
}

function wordsLesson(words, title, hide = false) {
  return () => {
    const steps = [{ t: 'intro', score: false, learn: [hide ? 'Reading on your own — romanization starts hidden' : 'Reading whole words', 'Each word with its meaning'],
      how: ['Read the word', 'Choose how it sounds, then what it means', `Check: ${PASS.lesson}% to complete`] }];
    words.forEach((w, i) => {
      steps.push({ t: 'choose', phase: i < words.length / 2 ? 'Practice' : 'Check', q: 'How does it sound?', show: w.th, noRom: true, hideRom: hide, ...romOpts(w, words), why: `${w.th} = ${w.rom} (${w.en}).` });
      steps.push({ t: 'choose', phase: 'Check', q: 'What does it mean?', show: w.th, showR: w.rom, hideRom: hide, ...enOpts(w, words), why: `${w.th} (${w.rom}) = ${w.en}.` });
    });
    return steps;
  };
}

function classLesson() {
  const steps = [{ t: 'intro', score: false, learn: ['The three consonant classes: mid (9), high (11), low (24)', 'Why classes matter: together with the tone mark and syllable type, they decide the tone'],
    how: ['See which letters are in each class', 'Sort letters by class', `Check: ${PASS.lesson}% to complete`] }];
  Object.entries(CLASS_INFO).forEach(([k, ci]) => steps.push({ t: 'info', score: false, title: `${k[0].toUpperCase() + k.slice(1)} class · ${ci.th} (${ci.rom})`, compare: LETTERS.filter(x => x.cls === k).map(x => x.c),
    text: k === 'mid' ? 'Tip: Thai children remember 7 of the 9 mid-class letters with ไก่จิกเด็กตายบนปากโอ่ง ("a chicken pecked a child on the rim of a jar"), plus ฎ ฏ.' : k === 'high' ? 'Tip: most high-class letters are in the phrase ผีฝากถุงข้าวสารให้ฉัน ("a ghost left a bag of rice with me"), plus ฃ ฐ ศ ษ.' : 'Every letter that is not mid or high is low class.' }));
  pick(MODERN, 10).forEach((c, i) => steps.push({ t: 'choose', phase: i < 4 ? 'Practice' : 'Check', key: c, q: `Which class is ${c} (${L[c].say} ${L[c].word})?`, show: c,
    o: [['Mid class', 'อักษรกลาง'], ['High class', 'อักษรสูง'], ['Low class', 'อักษรต่ำ']], a: ['mid', 'high', 'low'].indexOf(L[c].cls), why: `${c} is ${L[c].cls} class.` }));
  return steps;
}

function toneIntroLesson() {
  const steps = [{ t: 'intro', score: false, learn: ['The five Thai tones: mid, low, falling, high, rising', 'The four tone marks: ่ ้ ๊ ๋', 'How they work on mid-class letters (the simplest case)'],
    how: ['Listen to the same syllable in five tones', 'Pick the tone you see and hear', `Check: ${PASS.lesson}% to complete`] },
  { t: 'info', score: false, title: 'Tones change meaning', text: 'A tone is the pitch shape of a syllable — level, dipping, rising and falling. It is relative to your own voice, not a fixed note. The same sounds with a different tone are a different word.',
    examples: [['ปา', 'bpaa · mid', 'to throw'], ['ป่า', 'bpaa · low', 'forest'], ['ป้า', 'bpaa · falling', 'aunt (older)'], ['ป๊า', 'bpaa · high', 'dad (informal)'], ['ป๋า', 'bpaa · rising', 'dad, big boss (informal)']] },
  { t: 'info', score: false, title: 'Tone marks on mid-class letters', text: 'Mid class + live syllable (long vowel or ends in n/m/ng/y/w): no mark = mid · ่ ไม้เอก = low · ้ ไม้โท = falling · ๊ ไม้ตรี = high · ๋ ไม้จัตวา = rising. High- and low-class letters follow different rules — next lesson.' }];
  [['ปา', 'Mid'], ['ป่า', 'Low'], ['ป้า', 'Falling'], ['ป๊า', 'High'], ['ป๋า', 'Rising'], ['ก่า', 'Low'], ['ต้ม', 'Falling'], ['จ๋า', 'Rising']].forEach(([s, t], i) =>
    steps.push({ t: 'tone', phase: i < 4 ? 'Practice' : 'Check', syl: s, r: s === 'ต้ม' ? 'dtom' : s === 'จ๋า' ? 'jaa' : s === 'ก่า' ? 'gaa' : 'bpaa', a: t, why: `Mid-class ${s[0]} ${s.match(/[่้๊๋]/) ? 'with ' + s.match(/[่้๊๋]/)[0] : 'with no mark'} → ${t.toLowerCase()} tone.` }));
  return steps;
}

function toneRulesLesson() {
  const steps = [{ t: 'intro', score: false, learn: ['Tones for high- and low-class letters', 'Live vs. dead syllables'],
    how: ['Study the rule table', 'Pick the tone', `Check: ${PASS.lesson}% to complete`] },
  { t: 'info', score: false, title: 'Live and dead syllables', text: 'Live: ends in a long vowel, or in n, m, ng, y, w. Dead: ends in a short vowel, or in k, t, p.' },
  { t: 'info', score: false, title: 'The rule table (no tone mark)', rows: [['Mid class', 'live → mid', 'dead → low'], ['High class', 'live → rising', 'dead → low'], ['Low class', 'live → mid', 'dead short → high · dead long → falling']],
    text: 'With ่ : mid/high class → low, low class → falling. With ้ : mid/high class → falling, low class → high.' }];
  [['ขา', 'kaa', 'Rising', 'High class, live, no mark → rising (leg)'], ['สี', 'see', 'Rising', 'High class, live → rising (colour)'], ['มา', 'maa', 'Mid', 'Low class, live → mid (to come)'], ['นา', 'naa', 'Mid', 'Low class, live → mid (rice field)'],
   ['ไก่', 'gai', 'Low', 'Mid class + ่ → low (chicken)'], ['ปาก', 'bpaak', 'Low', 'Mid class, dead → low (mouth)'], ['รถ', 'rot', 'High', 'Low class, dead short → high (car)'], ['มาก', 'maak', 'Falling', 'Low class, dead long → falling (very)'],
   ['ค่า', 'kaa', 'Falling', 'Low class + ่ → falling (value)'], ['ค้า', 'kaa', 'High', 'Low class + ้ → high (to trade)']]
    .forEach(([s, r, t, why], i) => steps.push({ t: 'tone', phase: i < 4 ? 'Practice' : 'Check', syl: s, r, a: t, why }));
  return steps;
}

function clusterLesson() {
  const words = [W('หมา', 'maa', 'dog'), W('หนู', 'noo', 'mouse'), W('ปลา', 'bplaa', 'fish'), W('ครู', 'kroo', 'teacher'), W('กลาง', 'glaang', 'middle'), W('ขวา', 'kwaa', 'right (side)')];
  return [{ t: 'intro', score: false, learn: ['Silent ห in front of a low-class letter (ห นำ)', 'Two-consonant clusters: กร กล กว ปร ปล พร ครู…'],
    how: ['Read the examples', 'Read each word', `Check: ${PASS.lesson}% to complete`] },
  { t: 'info', score: false, title: 'Silent ห (leading ห)', text: 'ห in front of ง ญ น ม ย ร ล ว is not pronounced. It makes the next letter follow high-class tone rules.', examples: [['หมา', 'maa (rising)', 'dog'], ['หนู', 'noo (rising)', 'mouse']] },
  { t: 'info', score: false, title: 'Clusters', text: 'Some pairs are said together as one sound: ก ข ค ต ป พ + ร ล ว.', examples: [['ปลา', 'bplaa', 'fish'], ['ครู', 'kroo', 'teacher'], ['กลาง', 'glaang', 'middle'], ['ขวา', 'kwaa', 'right side']] },
  ...words.map((w, i) => ({ t: 'choose', phase: i < 3 ? 'Practice' : 'Check', q: 'How does it sound?', show: w.th, noRom: true, ...romOpts(w, words), why: `${w.th} = ${w.rom} (${w.en}).` }))];
}

/* ---------- Stage 4: writing ---------- */
function writeLesson(letters, memoryCount, introExtra) {
  return () => {
    const steps = [{ t: 'intro', score: false, learn: [`Write: ${letters.join(' ')}`, 'Trace first, then write from memory'],
      how: ['Trace over the grey letter — start at the head (the small loop) when there is one', 'Tap Check; the shape check is approximate and does not judge stroke order', `Check: ${PASS.lesson}% to complete`] }];
    if (introExtra) steps.push(introExtra);
    letters.forEach(c => steps.push({ t: 'trace', phase: 'Practice', key: c, c }));
    pick(letters, memoryCount).forEach(c => steps.push({ t: 'write', phase: 'Check', key: c, c, mode: 'memory' }));
    return steps;
  };
}
const WRITING_RULES = { t: 'info', score: false, title: 'How Thai letters are written',
  text: 'Most Thai letters start at the head — the small loop — and are written in one continuous stroke without lifting the pen. Write from top to bottom and left to right. Keep the loops round and the same size; letters sit on one line and are about as tall as they are wide.',
  compare: ['ก', 'ข', 'ค', 'ง', 'บ'] };

function writeFromSoundLesson() {
  const set = pick(MODERN, 8);
  return [{ t: 'intro', score: false, learn: ['Hear a letter name and write the letter'], how: ['Listen', 'Write the letter in the box', `Check: ${PASS.lesson}% to complete`] },
    ...set.map((c, i) => ({ t: 'write', phase: i < 3 ? 'Practice' : 'Check', key: c, c, mode: 'sound' }))];
}

const SPELL = [
  { th: 'ไก่', rom: 'gai', en: 'chicken', tiles: ['ไ', 'ก', '่'], extra: ['ข', '้'] },
  { th: 'ปลา', rom: 'bplaa', en: 'fish', tiles: ['ป', 'ล', 'า'], extra: ['บ', 'ะ'] },
  { th: 'ดี', rom: 'dee', en: 'good', tiles: ['ด', 'ี'], extra: ['ต', 'ิ'] },
  { th: 'มา', rom: 'maa', en: 'to come', tiles: ['ม', 'า'], extra: ['น', 'ะ'] },
  { th: 'ใจ', rom: 'jai', en: 'heart', tiles: ['ใ', 'จ'], extra: ['ไ', 'ว'] },
  { th: 'รถ', rom: 'rot', en: 'car', tiles: ['ร', 'ถ'], extra: ['ธ', 'ภ'] },
  { th: 'แมว', rom: 'maew', en: 'cat', tiles: ['แ', 'ม', 'ว'], extra: ['เ', 'น'] },
  { th: 'งู', rom: 'ngoo', en: 'snake', tiles: ['ง', 'ู'], extra: ['ุ', 'ด'] },
  { th: 'ตา', rom: 'dtaa', en: 'eye', tiles: ['ต', 'า'], extra: ['ด', 'ท'] }
];
const tile = t => [t, '', /[ัิ-ฺ็-๎]/.test(t) ? '◌' + t : t];
const qSpell = (s, phase) => ({ t: 'build', phase, q: `Spell "${s.rom}" (${s.en})`, sayWord: s.th, ans: s.tiles.map(tile), extra: s.extra.map(tile),
  why: `${s.th} = ${s.tiles.join(' + ')}. Remember: a vowel like เ แ โ ไ ใ is written before the consonant.` });
function spellLesson() {
  return [{ t: 'intro', score: false, learn: ['Spell short words letter by letter', 'Where vowels and tone marks go'], how: ['Listen to the word', 'Tap the pieces in writing order', `Check: ${PASS.lesson}% to complete`] },
    ...SPELL.map((s, i) => qSpell(s, i < 4 ? 'Practice' : 'Check'))];
}

/* ---------- Stage 5: the foundation check ---------- */
function testRecognition() {
  const set = pick(MODERN, 20);
  return set.map((c, i) => i % 2 ? qCharToName(c, [], 'Test') : qNameToChar(c, [], 'Test'));
}
function testListening() { return pick(MODERN, 15).map(c => qListen(c, [], 'Test')); }
function testReading() {
  const pool = [...READ1, ...READ2, ...READ3];
  return pick(pool, 12).map(w => ({ t: 'choose', phase: 'Test', q: 'Read it. What does it mean?', show: w.th, noRom: true, hideRom: true, ...enOpts(w, pool), why: `${w.th} = ${w.rom} (${w.en}).` }));
}
function testWriting() {
  return [...pick(SPELL, 6).map(s => qSpell(s, 'Test')), ...pick(MODERN, 4).map(c => ({ t: 'write', phase: 'Test', key: c, c, mode: 'sound' }))];
}

/* ---------- the path ---------- */
export const STAGES = [
  { n: 1, id: 'st1', title: 'Recognize Thai letters', th: 'รู้จักพยัญชนะ ก–ฮ', color: 'lav',
    can: 'Recognize all 44 consonants and say their names, like "กอ ไก่"',
    lessons: [
      { id: 'L1', title: 'Letters ก–ฆ', th: 'ก ข ฃ ค ฅ ฆ', build: letterLesson(0) },
      { id: 'L2', title: 'Letters ง–ฌ', th: 'ง จ ฉ ช ซ ฌ', build: letterLesson(1) },
      { id: 'L3', title: 'Letters ญ–ฒ', th: 'ญ ฎ ฏ ฐ ฑ ฒ', build: letterLesson(2) },
      { id: 'L4', title: 'Letters ณ–ธ', th: 'ณ ด ต ถ ท ธ', build: letterLesson(3) },
      { id: 'L5', title: 'Letters น–พ', th: 'น บ ป ผ ฝ พ', build: letterLesson(4) },
      { id: 'L6', title: 'Letters ฟ–ล', th: 'ฟ ภ ม ย ร ล', build: letterLesson(5) },
      { id: 'L7', title: 'Letters ว–ฮ', th: 'ว ศ ษ ส ห ฬ อ ฮ', build: letterLesson(6) },
      { id: 'L8', title: 'Look-alike letters', th: 'ก ถ ภ · บ ป ษ', build: lookalikeLesson },
      { id: 'L9', title: 'The alphabet in order', th: 'ก → ฮ', build: orderLesson }
    ] },
  { n: 2, id: 'st2', title: 'Learn the sounds', th: 'เสียงพยัญชนะ', color: 'sky',
    can: 'Connect each letter to its sound and hear the differences English doesn\'t have',
    lessons: [
      { id: 'S1', title: 'Puff of air: g/k, dt/t, bp/p', th: 'ก ข · ต ท · ป พ', build: puffLesson },
      { id: 'S2', title: 'Same sound, different letters', th: 'ซ ศ ษ ส', build: sameSoundLesson },
      { id: 'S3', title: 'Sounds new to English', th: 'ง ป ต ร อ', build: newSoundsLesson },
      { id: 'S4', title: 'Hear the letter', th: '🔊 → ก', build: hearLesson },
      { id: 'S5', title: 'Sounds at the end', th: 'มด · รถ · ลม', build: finalsLesson },
      { id: 'S6', title: 'Recite ก–ฮ out loud', th: '🎙️ ก → ฮ', kind: 'recite' }
    ] },
  { n: 3, id: 'st3', title: 'Read Thai', th: 'อ่านภาษาไทย', color: 'mint',
    can: 'Read syllables and simple words, then work out the tone',
    lessons: [
      { id: 'R1', title: 'Long vowels', th: 'า ี ู เ แ โ อ', build: vowelLesson(VOWELS.filter(v => v.len === 'long'), READ1) },
      { id: 'R2', title: 'Short and special vowels', th: 'ะ ิ ุ ไ ใ เา ำ', build: vowelLesson(VOWELS.filter(v => v.len === 'short'), READ2) },
      { id: 'R3', title: 'Read your first words', th: 'มา ดี ปู ไป ใจ', build: wordsLesson([...READ1.slice(0, 6), ...READ2.slice(0, 4)]) },
      { id: 'R4', title: 'Words with end sounds', th: 'กิน นอน มด รถ', build: wordsLesson(READ3) },
      { id: 'R5', title: 'Mid, high and low class', th: 'กลาง · สูง · ต่ำ', build: classLesson },
      { id: 'R6', title: 'The five tones', th: 'ปา ป่า ป้า ป๊า ป๋า', build: toneIntroLesson },
      { id: 'R7', title: 'Tone rules', th: 'ขา · มา · รถ · มาก', build: toneRulesLesson },
      { id: 'R8', title: 'Silent ห and clusters', th: 'หมา · ปลา · ครู', build: clusterLesson },
      { id: 'R9', title: 'Read on your own', th: 'no romanization', build: wordsLesson(pick([...READ1, ...READ2, ...READ3], 8), '', true) }
    ] },
  { n: 4, id: 'st4', title: 'Write Thai', th: 'เขียนภาษาไทย', color: 'peach',
    can: 'Write every consonant, write from sound, and spell short words',
    lessons: [
      { id: 'W1', title: 'How Thai is written', th: 'ก ข ค ง จ', build: writeLesson(['ก', 'ข', 'ค', 'ง', 'จ'], 2, WRITING_RULES) },
      { id: 'W2', title: 'Write mid-class letters', th: 'ก จ ฎ ฏ ด ต บ ป อ', build: writeLesson(LETTERS.filter(x => x.cls === 'mid').map(x => x.c), 3) },
      { id: 'W3', title: 'Write high-class letters', th: 'ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห', build: writeLesson(LETTERS.filter(x => x.cls === 'high').map(x => x.c), 3) },
      { id: 'W4', title: 'Write low-class letters (1)', th: 'ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท', build: writeLesson(LETTERS.filter(x => x.cls === 'low').slice(0, 12).map(x => x.c), 3) },
      { id: 'W5', title: 'Write low-class letters (2)', th: 'ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ', build: writeLesson(LETTERS.filter(x => x.cls === 'low').slice(12).map(x => x.c), 3) },
      { id: 'W6', title: 'Write from sound', th: '🔊 → ✍️', build: writeFromSoundLesson },
      { id: 'W7', title: 'Spell words', th: 'ไก่ · ปลา · แมว', build: spellLesson }
    ] },
  { n: 5, id: 'st5', title: 'Foundation check', th: 'ทดสอบพื้นฐาน', color: 'lemon',
    can: 'Prove each skill separately: recognize, listen, read, write',
    lessons: [
      { id: 'T1', title: 'Recognition test', th: '20 questions', skill: 'recognition', build: testRecognition, test: true },
      { id: 'T2', title: 'Listening test', th: '15 questions', skill: 'listening', build: testListening, test: true },
      { id: 'T3', title: 'Reading test', th: '12 questions · no romanization', skill: 'reading', build: testReading, test: true },
      { id: 'T4', title: 'Writing test', th: '6 spellings + 4 handwritten letters', skill: 'writing', build: testWriting, test: true }
    ] }
];

export const ALL_LESSONS = STAGES.flatMap(s => s.lessons.map(l => ({ ...l, stage: s.n })));
export const LESSON = Object.fromEntries(ALL_LESSONS.map(l => [l.id, l]));
export const passMark = l => l.test ? PASS[l.skill] : PASS.lesson;

// Letter review (spaced repetition) — builds a short mixed drill for given letters.
export function reviewDrill(letters) {
  return shuffle(letters).slice(0, 8).flatMap((c, i) => [i % 2 ? qListen(c, [], 'Review') : qCharToName(c, [], 'Review')]);
}
