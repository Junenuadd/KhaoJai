// Lesson C0 — "English letters → Thai letters" (comes before C1).
// Content can be edited by the KhaoJai team (จูน). The lesson, practice and test are built from this list.
//
// Each group:
//   eng     – the English letter(s) the learner already knows (a memory aid, NOT an exact sound)
//   thai    – Thai consonants this English letter helps the learner remember (most common first)
//   compare – (optional) a Thai letter that is easy to mix up with this group, taught side by side
//   start   – roughly how the letters sound at the start of a syllable (KhaoJai romanization)
//   end     – how they sound as a final consonant ('' if they are not used as finals)
//   note    – one short, honest sentence about how the real Thai sound differs
//   status  – 'draft' | 'reviewed' (only reviewed groups are used once ASSOC_READY is true)
//   updated – date this group was last edited
//
// v0.7: first full draft written by น้องเบ้บ so the lesson can run. จูน: please check and edit freely.
// ฃ and ฅ are not used in modern Thai; they are listed for completeness and left out of questions.
export const ASSOC_READY = true;
export const ASSOC_OLD = ['ฃ', 'ฅ'];

const G = (id, eng, thai, start, end, note, compare) => ({ id, eng, thai, start, end, note, compare, status: 'reviewed', updated: '2026-11-07' });

export const ASSOC = [
  G('k', 'K / G', ['ก'], 'g', 'k', 'ก sits between English "g" and "k" — like the k in "skin", with no puff of air.', 'ค'),
  G('kh', 'KH', ['ค', 'ข', 'ฆ'], 'k', 'k', 'A strong k with a puff of air, like "kite". ค is the one you will see most.', 'ก'),
  G('ng', 'NG', ['ง'], 'ng', 'ng', 'The "ng" at the end of "sing" — in Thai it can also START a word, as in งู (ngoo, snake).'),
  G('j', 'J', ['จ'], 'j', 't', 'Like a soft English j. At the end of a syllable it sounds like t.', 'ช'),
  G('ch', 'CH', ['ช', 'ฉ', 'ฌ'], 'ch', 't', 'CH as in "chair". ช is the everyday one.', 'จ'),
  G('s', 'S', ['ส', 'ศ', 'ษ', 'ซ'], 's', 't', 'Four letters, one sound: all start with "s" in modern Thai. At the end of a syllable they sound like t.'),
  G('y', 'Y', ['ย', 'ญ'], 'y', 'n (ญ) · i/y (ย)', 'Y at the start. At the end ญ sounds like n, and ย makes an "i/y" glide.'),
  G('d', 'D', ['ด', 'ฎ'], 'd', 't', 'Like English d. At the end of a syllable it sounds like t.', 'ต'),
  G('t', 'T', ['ต', 'ฏ'], 'dt', 't', 'A soft t with no puff of air, like the t in "stop". KhaoJai writes it "dt".', 'ท'),
  G('th', 'TH', ['ท', 'ถ', 'ธ', 'ฐ', 'ฑ', 'ฒ'], 't', 't', 'A strong t with a puff of air, like "top". Not the "th" of "the" — Thai has no such sound.', 'ต'),
  G('n', 'N', ['น', 'ณ'], 'n', 'n', 'Like English n, at the start and the end.'),
  G('b', 'B', ['บ'], 'b', 'p', 'Like English b. At the end of a syllable it sounds like p.', 'ป'),
  G('p', 'P', ['ป'], 'bp', 'p', 'A soft p with no puff of air, like the p in "spin". KhaoJai writes it "bp".', 'พ'),
  G('ph', 'PH', ['พ', 'ผ', 'ภ'], 'p', 'p', 'A strong p with a puff of air, like "pin". Not an "f" sound!', 'ป'),
  G('f', 'F', ['ฟ', 'ฝ'], 'f', 'p', 'Like English f. At the end of a syllable ฟ sounds like p.'),
  G('m', 'M', ['ม'], 'm', 'm', 'Like English m.'),
  G('r', 'R', ['ร'], 'r', 'n', 'A tapped or rolled r. Many Thais say it like l in casual speech, but it is a different letter.', 'ล'),
  G('l', 'L', ['ล', 'ฬ'], 'l', 'n', 'Like English l. At the end of a syllable it sounds like n.', 'ร'),
  G('w', 'W', ['ว'], 'w', 'o/w', 'Like English w. At the end it makes an "o/w" glide.'),
  G('h', 'H', ['ห', 'ฮ'], 'h', '', 'Like English h. ห also has a special job: a silent "leader" in front of some letters (you learn it in Phase 2).'),
  G('o', 'silent / vowel', ['อ'], '— (silent)', '', 'อ has no sound of its own at the start: it holds a vowel, as in อา (aa). It is also part of some vowels.')
];
