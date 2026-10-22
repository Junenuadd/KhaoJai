// Lesson C0 — "English letters → Thai letters" (comes before C1).
// Content is prepared by the KhaoJai team (จูน). Add or edit groups here; the lesson, practice and test are built from this list.
//
// Each group:
//   eng     – the English letter(s) the learner already knows (a memory aid, NOT an exact sound)
//   thai    – Thai consonants this English letter helps the learner remember
//   compare – (optional) a Thai letter that is easy to mix up with this group, taught side by side
//   start   – roughly how the letters sound at the start of a syllable (romanization)
//   end     – how they sound as a final consonant ('' if they are not used as finals)
//   note    – one short, honest sentence about how the real Thai sound differs
//   status  – 'draft' | 'reviewed' (only reviewed groups are used once ASSOC_READY is true)
//
// Switch ASSOC_READY to true when the content has been checked. Until then lesson C0 stays hidden.
export const ASSOC_READY = false;

export const ASSOC = [
  { id: 'k', eng: 'K', thai: ['ก'], start: 'g', end: 'k', status: 'draft',
    note: 'ก sits between English "g" and "k" — like the k in "skin", with no puff of air.' },
  { id: 't', eng: 'T', thai: ['ต', 'ท'], start: 'dt / t', end: 't', status: 'draft',
    note: 'ต is a soft t with no puff of air (like "stop"); ท has a puff of air (like "top").' },
  { id: 'l', eng: 'L', thai: ['ล'], compare: 'ร', start: 'l', end: 'n', status: 'draft',
    note: 'ล is like English "l". ร is a different letter — a tapped "r" — even though many Thais say it like "l" in casual speech.' },
  { id: 's', eng: 'S', thai: ['ส', 'ศ', 'ษ'], start: 's', end: 't', status: 'draft',
    note: 'ส ศ ษ all sound "s" at the start of a syllable in modern Thai; they are three ways of writing the same sound.' }
];
