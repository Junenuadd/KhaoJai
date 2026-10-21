// The 44 Thai consonants, in traditional order (ก–ฮ).
// Each entry: c = character, say = how the letter is called aloud (consonant + ออ),
// word = the traditional name word, rom = KhaoJai romanization of "letter + word",
// en = meaning, pic = picture cue (placeholder emoji until KhaoJai's own illustrations exist),
// cls = consonant class (mid / high / low), snd = initial-sound group (see SOUNDS), fin = sound at the end of a syllable.
// Romanization follows docs/ROMANIZATION.md.

export const LETTERS = [
  { c: 'ก', say: 'กอ', word: 'ไก่', rom: 'gor gai', en: 'chicken', pic: '🐔', cls: 'mid', snd: 'g', fin: 'k' },
  { c: 'ข', say: 'ขอ', word: 'ไข่', rom: 'kor kai', en: 'egg', pic: '🥚', cls: 'high', snd: 'k', fin: 'k' },
  { c: 'ฃ', say: 'ขอ', word: 'ขวด', rom: 'kor kuat', en: 'bottle', pic: '🍾', cls: 'high', snd: 'k', fin: 'k', old: true },
  { c: 'ค', say: 'คอ', word: 'ควาย', rom: 'kor kwaai', en: 'water buffalo', pic: '🐃', cls: 'low', snd: 'k', fin: 'k' },
  { c: 'ฅ', say: 'คอ', word: 'คน', rom: 'kor kon', en: 'person', pic: '🧑', cls: 'low', snd: 'k', fin: 'k', old: true },
  { c: 'ฆ', say: 'คอ', word: 'ระฆัง', rom: 'kor ra-kang', en: 'temple bell', pic: '🔔', cls: 'low', snd: 'k', fin: 'k' },
  { c: 'ง', say: 'งอ', word: 'งู', rom: 'ngor ngoo', en: 'snake', pic: '🐍', cls: 'low', snd: 'ng', fin: 'ng' },
  { c: 'จ', say: 'จอ', word: 'จาน', rom: 'jor jaan', en: 'plate', pic: '🍽️', cls: 'mid', snd: 'j', fin: 't' },
  { c: 'ฉ', say: 'ฉอ', word: 'ฉิ่ง', rom: 'chor ching', en: 'small cymbals', pic: '🎶', cls: 'high', snd: 'ch', fin: null },
  { c: 'ช', say: 'ชอ', word: 'ช้าง', rom: 'chor chaang', en: 'elephant', pic: '🐘', cls: 'low', snd: 'ch', fin: 't' },
  { c: 'ซ', say: 'ซอ', word: 'โซ่', rom: 'sor soh', en: 'chain', pic: '⛓️', cls: 'low', snd: 's', fin: 't' },
  { c: 'ฌ', say: 'ชอ', word: 'เฌอ', rom: 'chor cher', en: 'tree', pic: '🌳', cls: 'low', snd: 'ch', fin: 't' },
  { c: 'ญ', say: 'ยอ', word: 'หญิง', rom: 'yor ying', en: 'woman', pic: '👩', cls: 'low', snd: 'y', fin: 'n' },
  { c: 'ฎ', say: 'ดอ', word: 'ชฎา', rom: 'dor cha-daa', en: 'dancer\'s headdress', pic: '👑', cls: 'mid', snd: 'd', fin: 't' },
  { c: 'ฏ', say: 'ตอ', word: 'ปฏัก', rom: 'dtor bpa-dtak', en: 'goad (spear)', pic: '🔱', cls: 'mid', snd: 'dt', fin: 't' },
  { c: 'ฐ', say: 'ถอ', word: 'ฐาน', rom: 'tor taan', en: 'pedestal', pic: '🏛️', cls: 'high', snd: 't', fin: 't' },
  { c: 'ฑ', say: 'ทอ', word: 'มณโฑ', rom: 'tor mon-toh', en: 'Montho (a character in the Ramakien)', pic: '👸', cls: 'low', snd: 't', fin: 't', note: 'In a few words ฑ is said as "d", e.g. บัณฑิต (ban-dit, graduate).' },
  { c: 'ฒ', say: 'ทอ', word: 'ผู้เฒ่า', rom: 'tor poo-tao', en: 'old man', pic: '👴', cls: 'low', snd: 't', fin: 't' },
  { c: 'ณ', say: 'นอ', word: 'เณร', rom: 'nor nehn', en: 'novice monk', pic: '🧘', cls: 'low', snd: 'n', fin: 'n' },
  { c: 'ด', say: 'ดอ', word: 'เด็ก', rom: 'dor dek', en: 'child', pic: '🧒', cls: 'mid', snd: 'd', fin: 't' },
  { c: 'ต', say: 'ตอ', word: 'เต่า', rom: 'dtor dtao', en: 'turtle', pic: '🐢', cls: 'mid', snd: 'dt', fin: 't' },
  { c: 'ถ', say: 'ถอ', word: 'ถุง', rom: 'tor tung', en: 'bag', pic: '👜', cls: 'high', snd: 't', fin: 't' },
  { c: 'ท', say: 'ทอ', word: 'ทหาร', rom: 'tor ta-haan', en: 'soldier', pic: '💂', cls: 'low', snd: 't', fin: 't' },
  { c: 'ธ', say: 'ทอ', word: 'ธง', rom: 'tor tong', en: 'flag', pic: '🚩', cls: 'low', snd: 't', fin: 't' },
  { c: 'น', say: 'นอ', word: 'หนู', rom: 'nor noo', en: 'mouse', pic: '🐭', cls: 'low', snd: 'n', fin: 'n' },
  { c: 'บ', say: 'บอ', word: 'ใบไม้', rom: 'bor bai-mai', en: 'leaf', pic: '🍃', cls: 'mid', snd: 'b', fin: 'p' },
  { c: 'ป', say: 'ปอ', word: 'ปลา', rom: 'bpor bplaa', en: 'fish', pic: '🐟', cls: 'mid', snd: 'bp', fin: 'p' },
  { c: 'ผ', say: 'ผอ', word: 'ผึ้ง', rom: 'por pueng', en: 'bee', pic: '🐝', cls: 'high', snd: 'p', fin: null },
  { c: 'ฝ', say: 'ฝอ', word: 'ฝา', rom: 'for faa', en: 'lid', pic: '🫙', cls: 'high', snd: 'f', fin: null },
  { c: 'พ', say: 'พอ', word: 'พาน', rom: 'por paan', en: 'footed offering tray', pic: '🏆', cls: 'low', snd: 'p', fin: 'p' },
  { c: 'ฟ', say: 'ฟอ', word: 'ฟัน', rom: 'for fan', en: 'tooth', pic: '🦷', cls: 'low', snd: 'f', fin: 'p' },
  { c: 'ภ', say: 'พอ', word: 'สำเภา', rom: 'por sam-pao', en: 'Chinese junk (sailing ship)', pic: '⛵', cls: 'low', snd: 'p', fin: 'p' },
  { c: 'ม', say: 'มอ', word: 'ม้า', rom: 'mor maa', en: 'horse', pic: '🐴', cls: 'low', snd: 'm', fin: 'm' },
  { c: 'ย', say: 'ยอ', word: 'ยักษ์', rom: 'yor yak', en: 'giant', pic: '👹', cls: 'low', snd: 'y', fin: 'y' },
  { c: 'ร', say: 'รอ', word: 'เรือ', rom: 'ror ruea', en: 'boat', pic: '🚣', cls: 'low', snd: 'r', fin: 'n' },
  { c: 'ล', say: 'ลอ', word: 'ลิง', rom: 'lor ling', en: 'monkey', pic: '🐒', cls: 'low', snd: 'l', fin: 'n' },
  { c: 'ว', say: 'วอ', word: 'แหวน', rom: 'wor waen', en: 'ring', pic: '💍', cls: 'low', snd: 'w', fin: 'w' },
  { c: 'ศ', say: 'สอ', word: 'ศาลา', rom: 'sor saa-laa', en: 'pavilion', pic: '🛖', cls: 'high', snd: 's', fin: 't' },
  { c: 'ษ', say: 'สอ', word: 'ฤๅษี', rom: 'sor rue-see', en: 'hermit', pic: '🧙', cls: 'high', snd: 's', fin: 't' },
  { c: 'ส', say: 'สอ', word: 'เสือ', rom: 'sor suea', en: 'tiger', pic: '🐯', cls: 'high', snd: 's', fin: 't' },
  { c: 'ห', say: 'หอ', word: 'หีบ', rom: 'hor heep', en: 'chest (box)', pic: '📦', cls: 'high', snd: 'h', fin: null },
  { c: 'ฬ', say: 'ลอ', word: 'จุฬา', rom: 'lor ju-laa', en: 'star-shaped kite', pic: '🪁', cls: 'low', snd: 'l', fin: 'n' },
  { c: 'อ', say: 'ออ', word: 'อ่าง', rom: 'or aang', en: 'basin', pic: '🛁', cls: 'mid', snd: 'silent', fin: null },
  { c: 'ฮ', say: 'ฮอ', word: 'นกฮูก', rom: 'hor nok-hook', en: 'owl', pic: '🦉', cls: 'low', snd: 'h', fin: null }
];

export const L = Object.fromEntries(LETTERS.map((x, i) => [x.c, { ...x, i }]));
export const nameOf = c => `${L[c].say} ${L[c].word}`;          // what you hear: "กอ ไก่"
export const labelOf = c => `${c} ${L[c].word}`;               // how it is written in books: "ก ไก่"

// Initial-sound groups. English comparisons are approximations — see each note.
export const SOUNDS = {
  g:  { rom: 'g',  ipa: '/k/',  en: 'Like the "k" in "skin" — no puff of air. English speakers often hear it as a soft "g".', vs: 'Not the same as ข / ค, which have a puff of air.' },
  k:  { rom: 'k',  ipa: '/kʰ/', en: 'Like the "k" in "kite" — with a puff of air.', vs: 'Hold a hand in front of your mouth: you should feel air. For ก you should not.' },
  ng: { rom: 'ng', ipa: '/ŋ/',  en: 'Like the "ng" in "sing" — but Thai also uses it at the start of words.', vs: 'Practise by saying "singing" and dropping the "si-".' },
  j:  { rom: 'j',  ipa: '/tɕ/', en: 'Between the "j" in "jam" and the "ch" in "chin", with no puff of air.', vs: 'Different from ฉ / ช, which have a puff of air.' },
  ch: { rom: 'ch', ipa: '/tɕʰ/', en: 'Like the "ch" in "chair" — with a puff of air.', vs: '' },
  s:  { rom: 's',  ipa: '/s/',  en: 'Like the "s" in "sun".', vs: '' },
  y:  { rom: 'y',  ipa: '/j/',  en: 'Like the "y" in "yes".', vs: 'ญ sounds like "y" at the start of a syllable but "n" at the end.' },
  d:  { rom: 'd',  ipa: '/d/',  en: 'Like the "d" in "day".', vs: '' },
  dt: { rom: 'dt', ipa: '/t/',  en: 'Like the "t" in "stop" — no puff of air. English has no letter for it, so learners write "dt".', vs: 'Different from ท / ถ (puff of air) and from ด (voiced "d").' },
  t:  { rom: 't',  ipa: '/tʰ/', en: 'Like the "t" in "top" — with a puff of air. Never like "th" in "the".', vs: '' },
  n:  { rom: 'n',  ipa: '/n/',  en: 'Like the "n" in "no".', vs: '' },
  b:  { rom: 'b',  ipa: '/b/',  en: 'Like the "b" in "boy".', vs: '' },
  bp: { rom: 'bp', ipa: '/p/',  en: 'Like the "p" in "spin" — no puff of air. Learners write "bp".', vs: 'Different from พ / ผ (puff of air) and from บ (voiced "b").' },
  p:  { rom: 'p',  ipa: '/pʰ/', en: 'Like the "p" in "pin" — with a puff of air. Never like "ph" in "phone".', vs: '' },
  f:  { rom: 'f',  ipa: '/f/',  en: 'Like the "f" in "fun".', vs: '' },
  m:  { rom: 'm',  ipa: '/m/',  en: 'Like the "m" in "mother".', vs: '' },
  r:  { rom: 'r',  ipa: '/r/',  en: 'A tapped or lightly rolled "r", as in Spanish "pero".', vs: 'In casual speech many Thai people say it like "l".' },
  l:  { rom: 'l',  ipa: '/l/',  en: 'Like the "l" in "lemon".', vs: '' },
  w:  { rom: 'w',  ipa: '/w/',  en: 'Like the "w" in "water".', vs: '' },
  h:  { rom: 'h',  ipa: '/h/',  en: 'Like the "h" in "hat".', vs: '' },
  silent: { rom: '—', ipa: '/ʔ/', en: 'Silent "carrier": it holds a vowel that starts a word, with a tiny catch in the throat (like the break in "uh-oh").', vs: 'อ is also used as a vowel (ออ, "or").' }
};

// Which sound a letter makes at the END of a syllable.
export const FINALS = {
  k: { rom: 'k', en: 'a short, unreleased "k" — your tongue stops without a puff (like "k" in "backpack")' },
  t: { rom: 't', en: 'a short, unreleased "t" (like "t" in "hot dog")' },
  p: { rom: 'p', en: 'a short, unreleased "p" (like "p" in "top hat")' },
  n: { rom: 'n', en: '"n"' }, m: { rom: 'm', en: '"m"' }, ng: { rom: 'ng', en: '"ng" as in "sing"' },
  y: { rom: 'i/y', en: 'a "y" glide, often written i (e.g. นาย naai)' },
  w: { rom: 'o/w', en: 'a "w" glide, often written o (e.g. ดาว daao)' }
};

export const CLASS_INFO = {
  mid:  { th: 'อักษรกลาง', rom: 'ak-son glaang', count: 9, color: 'lav' },
  high: { th: 'อักษรสูง', rom: 'ak-son soong', count: 11, color: 'pink' },
  low:  { th: 'อักษรต่ำ', rom: 'ak-son dtam', count: 24, color: 'mint' }
};

// Letters that look alike — taught side by side.
export const LOOKALIKES = [
  ['ก', 'ถ', 'ภ'], ['ข', 'ช'], ['ค', 'ด', 'ต'], ['บ', 'ป', 'ษ'], ['ผ', 'ฝ', 'พ', 'ฟ'],
  ['ม', 'น'], ['ร', 'ธ'], ['ล', 'ส'], ['ฎ', 'ฏ'], ['ท', 'ฑ'], ['ว', 'จ'], ['ห', 'ฬ'], ['ซ', 'ช']
];

// Groups of letters with the same initial sound.
export const SAME_SOUND = [
  { snd: 's', letters: ['ซ', 'ศ', 'ษ', 'ส'], why: 'ศ and ษ come from Sanskrit spellings; ส is the everyday letter. ซ is low class, the others high class — the class changes the tone, not the "s".' },
  { snd: 't', letters: ['ฐ', 'ฑ', 'ฒ', 'ถ', 'ท', 'ธ'], why: 'ฐ ฑ ฒ ธ mostly appear in words from Pali and Sanskrit. ถ is high class, ท and the rest are low class.' },
  { snd: 'k', letters: ['ข', 'ค', 'ฆ'], why: 'ข is high class, ค and ฆ low class. ฆ appears in borrowed words like ระฆัง. (ฃ and ฅ are no longer used.)' },
  { snd: 'p', letters: ['ผ', 'พ', 'ภ'], why: 'ผ is high class, พ and ภ low class. ภ appears in Pali/Sanskrit words like ภาษา (language).' },
  { snd: 'ch', letters: ['ฉ', 'ช', 'ฌ'], why: 'ฉ is high class, ช and ฌ low class. ฌ is rare.' },
  { snd: 'n', letters: ['ณ', 'น'], why: 'ณ appears in Pali/Sanskrit words (e.g. คุณ). น is the everyday letter.' },
  { snd: 'l', letters: ['ล', 'ฬ'], why: 'ฬ is rare (e.g. จุฬา, กีฬา sport).' },
  { snd: 'y', letters: ['ญ', 'ย'], why: 'ญ sounds like "y" at the start but "n" at the end of a syllable.' },
  { snd: 'f', letters: ['ฝ', 'ฟ'], why: 'ฝ is high class, ฟ low class.' },
  { snd: 'h', letters: ['ห', 'ฮ'], why: 'ห is high class and very common; ฮ is low class and mostly used in sound words and loanwords.' },
  { snd: 'd', letters: ['ฎ', 'ด'], why: 'ฎ appears in Pali/Sanskrit words (e.g. กฎ rule).' },
  { snd: 'dt', letters: ['ฏ', 'ต'], why: 'ฏ is rare (e.g. ปฏิบัติ practise).' }
];

// English-letter helpers (Phase 1). A familiar English letter is a MEMORY AID, not an exact sound.
// eng = the helper letter; tip = what to watch out for (shown on the letter card).
const ENG = {
  'ก': ['K', 'Start by linking ก with K. The real Thai sound is softer — between g and k, with no puff of air.'],
  'ข': ['K', 'Also a K letter, but this one is a strong k with a puff of air, like "kite".'],
  'ฃ': ['K', 'An old K letter that is no longer used.'],
  'ค': ['K', 'The most common strong-k letter (puff of air), as in ควาย.'],
  'ฅ': ['K', 'An old K letter that is no longer used.'],
  'ฆ': ['K', 'A rare K letter, mostly in borrowed words.'],
  'ง': ['NG', 'Like "ng" at the end of "sing" — Thai also puts it at the START of words.'],
  'จ': ['J', 'J is a good start. Thai จ is a little softer than English j.'],
  'ฉ': ['CH', 'CH as in "chair".'],
  'ช': ['CH', 'The everyday CH letter, as in ช้าง (elephant).'],
  'ซ': ['S', 'An S letter. ส is the more common one.'],
  'ฌ': ['CH', 'A rare CH letter.'],
  'ญ': ['Y', 'Y at the start of a syllable, but N at the end.'],
  'ฎ': ['D', 'A rare D letter.'],
  'ฏ': ['T', 'A rare T letter, said like ต (no puff of air).'],
  'ฐ': ['T', 'A rare T letter, said with a puff of air.'],
  'ฑ': ['T', 'A rare T letter. In a few words it sounds like d.'],
  'ฒ': ['T', 'A rare T letter.'],
  'ณ': ['N', 'An N letter from Pali/Sanskrit words, as in คุณ.'],
  'ด': ['D', 'The everyday D letter.'],
  'ต': ['T', 'Think T — but ต has no puff of air (between d and t). ท is the other common T.'],
  'ถ': ['T', 'A T letter with a puff of air.'],
  'ท': ['T', 'The most common strong-T letter (puff of air). Compare it with ต.'],
  'ธ': ['T', 'A T letter with a puff of air, as in ธง (flag).'],
  'น': ['N', 'The everyday N letter.'],
  'บ': ['B', 'The B letter.'],
  'ป': ['P', 'Think P — but ป has no puff of air, like the p in "spin". Learners often write it "bp".'],
  'ผ': ['P', 'A P letter with a puff of air.'],
  'ฝ': ['F', 'An F letter.'],
  'พ': ['P', 'The most common strong-P letter (puff of air).'],
  'ฟ': ['F', 'The everyday F letter.'],
  'ภ': ['P', 'A P letter used in Pali/Sanskrit words, as in ภาษา (language).'],
  'ม': ['M', 'The M letter.'],
  'ย': ['Y', 'The everyday Y letter.'],
  'ร': ['R', 'R — a light tap of the tongue. Don\'t mix it up with ล (L).'],
  'ล': ['L', 'The everyday L letter. Its partner to learn separately is ร (R).'],
  'ว': ['W', 'The W letter.'],
  'ศ': ['S', 'An S letter from Sanskrit words, as in ศาลา. Same sound as ส.'],
  'ษ': ['S', 'An S letter from Sanskrit words. Same sound as ส.'],
  'ส': ['S', 'The everyday S letter, as in เสือ (tiger). ศ and ษ make the same sound.'],
  'ห': ['H', 'The everyday H letter. It also helps other letters, which you will learn later.'],
  'ฬ': ['L', 'A rare L letter, as in จุฬา.'],
  'อ': ['—', 'No English letter: อ is a silent holder for a vowel at the start of a word. It is also part of some vowels.'],
  'ฮ': ['H', 'A less common H letter.']
};
[...LETTERS, ...Object.values(L)].forEach(x => { x.eng = ENG[x.c][0]; x.tip = ENG[x.c][1]; });

// Thai vowels. "อ" stands in for any consonant to show where the vowel sits.
// len: long/short · pos: where it is written · rom: KhaoJai romanization (approximate).
// Short and long partners may share a romanization; the length label tells them apart.
export const VOWELS = [
  // V1 — long vowels written after, above or below
  { v: 'อา', rom: 'aa', len: 'long', pos: 'after', set: 1, eg: ['กา', 'gaa', 'crow'] },
  { v: 'อี', rom: 'ee', len: 'long', pos: 'above', set: 1, eg: ['ดี', 'dee', 'good'] },
  { v: 'อู', rom: 'oo', len: 'long', pos: 'below', set: 1, eg: ['งู', 'ngoo', 'snake'] },
  { v: 'ออ', rom: 'or', len: 'long', pos: 'after', set: 1, eg: ['ขอ', 'kor', 'to ask for'], note: 'This vowel is written with the letter อ itself.' },
  // V2 — short partners
  { v: 'อะ', rom: 'a', len: 'short', pos: 'after', set: 2, pair: 'อา', eg: ['จะ', 'ja', 'will'] },
  { v: 'อิ', rom: 'i', len: 'short', pos: 'above', set: 2, pair: 'อี', eg: ['ติ', 'dti', 'to criticise'] },
  { v: 'อุ', rom: 'u', len: 'short', pos: 'below', set: 2, pair: 'อู', eg: ['ดุ', 'du', 'fierce'] },
  // V3 — written BEFORE the consonant
  { v: 'เอ', rom: 'eh', len: 'long', pos: 'before', set: 3, eg: ['เท', 'teh', 'to pour'] },
  { v: 'แอ', rom: 'ae', len: 'long', pos: 'before', set: 3, eg: ['แม่', 'mae', 'mother'] },
  { v: 'โอ', rom: 'oh', len: 'long', pos: 'before', set: 3, eg: ['โต', 'dtoh', 'big'] },
  { v: 'เอะ', rom: 'e', len: 'short', pos: 'around', set: 3, pair: 'เอ', eg: ['เตะ', 'dte', 'to kick'] },
  { v: 'แอะ', rom: 'ae', len: 'short', pos: 'around', set: 3, pair: 'แอ', eg: ['แพะ', 'pae', 'goat'] },
  { v: 'โอะ', rom: 'o', len: 'short', pos: 'around', set: 3, pair: 'โอ', eg: ['โต๊ะ', 'dto', 'table'] },
  // V4 — ue / er / short or
  { v: 'อึ', rom: 'ue', len: 'short', pos: 'above', set: 4, eg: ['ผึ้ง', 'pueng', 'bee'], note: 'Say "ee" while keeping your lips flat and relaxed.' },
  { v: 'อือ', rom: 'uue', len: 'long', pos: 'above', set: 4, pair: 'อึ', eg: ['มือ', 'muue', 'hand'], note: 'With no final consonant this vowel is written with an extra อ.' },
  { v: 'เออ', rom: 'er', len: 'long', pos: 'around', set: 4, eg: ['เธอ', 'ter', 'you / she'], note: 'Like "er" in "her", without the r.' },
  { v: 'เออะ', rom: 'er', len: 'short', pos: 'around', set: 4, pair: 'เออ', eg: ['เลอะ', 'ler', 'messy'] },
  { v: 'เอาะ', rom: 'or', len: 'short', pos: 'around', set: 4, pair: 'ออ', eg: ['เกาะ', 'gor', 'island'] },
  // V5 — vowels made of several parts (diphthongs)
  { v: 'เอีย', rom: 'ia', len: 'long', pos: 'around', set: 5, eg: ['เมีย', 'mia', 'wife (informal)'], note: 'Three parts: เ before, ี above and ย after.' },
  { v: 'เอือ', rom: 'uea', len: 'long', pos: 'around', set: 5, eg: ['เสือ', 'suea', 'tiger'], note: 'Three parts: เ before, ื above and อ after.' },
  { v: 'อัว', rom: 'ua', len: 'long', pos: 'around', set: 5, eg: ['ตัว', 'dtua', 'body / animal'], note: 'Two parts: ั above and ว after.' },
  // V6 — special vowels
  { v: 'ไอ', rom: 'ai', len: 'short', pos: 'before', set: 6, eg: ['ไป', 'bpai', 'to go'], note: 'ไ (mai malai) is used in most "ai" words.' },
  { v: 'ใอ', rom: 'ai', len: 'short', pos: 'before', set: 6, eg: ['ใจ', 'jai', 'heart'], note: 'ใ (mai muan) is used in only about 20 words, such as ใจ, ใช่, ใหม่.' },
  { v: 'เอา', rom: 'ao', len: 'short', pos: 'around', set: 6, eg: ['เรา', 'rao', 'we'] },
  { v: 'อำ', rom: 'am', len: 'short', pos: 'after', set: 6, eg: ['ทำ', 'tam', 'to do'] },
  { v: 'ฤ', rom: 'rue / ri', len: 'short', pos: 'alone', set: 6, eg: ['ฤดู', 'rue-doo', 'season'], note: 'A rare vowel-letter from Sanskrit words. It can be read "rue" or "ri".' }
];
export const vowelSet = n => VOWELS.filter(v => v.set === n);

export const TONES = ['Mid', 'Low', 'Falling', 'High', 'Rising'];
