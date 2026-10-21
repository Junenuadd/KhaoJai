// Small sample dictionary for the Thai Decoder. The real version will use AI + a dictionary,
// and always show how confident it is.
export const DICT = {
  'พรุ่งนี้': { std: 'พรุ่งนี้', rom: 'phrûng-níi', mean: 'tomorrow', reg: 'Standard', note: '' },
  'พน': { std: 'พรุ่งนี้', rom: 'phrûng-níi', mean: 'tomorrow', reg: 'Chat shorthand', note: 'Chat abbreviation, not a typo. Don\'t use it in emails or with elders.' },
  'ว่าง': { std: 'ว่าง', rom: 'wâang', mean: 'free / not busy', reg: 'Standard', note: '' },
  'ป่าว': { std: 'เปล่า', rom: 'bplàao', mean: '"…or not?" question tag; also "no / nothing"', reg: 'Spoken & chat', note: 'Spelled the way it sounds in fast speech. ว่างป่าว = "Are you free (or not)?"' },
  'เปล่า': { std: 'เปล่า', rom: 'bplàao', mean: 'no / nothing / empty', reg: 'Standard', note: '' },
  'ก็ได้': { std: 'ก็ได้', rom: 'gɔ̂ɔ-dâai', mean: 'OK / fine / I guess so', reg: 'Everyday', note: 'Can be a happy "sure" or a reluctant "fine…". Tone, emoji and the conversation decide which. Ask if you\'re unsure.', conf: 'Depends on context' },
  'นะ': { std: 'นะ', rom: 'ná', mean: 'softening particle', reg: 'Spoken & chat', note: 'Makes a sentence softer or more persuasive, like "okay?" or "please".' },
  'ทำไร': { std: 'ทำอะไร', rom: 'tham a-rai', mean: 'What are you doing?', reg: 'Chat shorthand', note: 'อะ is dropped in casual chat. Not a typo.' },
  'ทำอะไร': { std: 'ทำอะไร', rom: 'tham a-rai', mean: 'What are you doing?', reg: 'Standard', note: '' },
  'อยู่': { std: 'อยู่', rom: 'yùu', mean: 'to be (somewhere) / -ing', reg: 'Standard', note: 'After a verb it means "right now": ทำอะไรอยู่ = "what are you doing right now?"' },
  'เดว': { std: 'เดี๋ยว', rom: 'dǐao', mean: 'in a moment / wait', reg: 'Chat shorthand', note: 'Tone mark and vowel dropped for speed.' },
  'เดี๋ยว': { std: 'เดี๋ยว', rom: 'dǐao', mean: 'in a moment / wait', reg: 'Standard', note: '' },
  'ไปหา': { std: 'ไปหา', rom: 'bpai hǎa', mean: 'go to see (someone)', reg: 'Standard', note: '' },
  'ไม่เป็นไร': { std: 'ไม่เป็นไร', rom: 'mâi bpen rai', mean: 'it\'s okay / never mind / you\'re welcome', reg: 'Everyday', note: 'Very flexible. It can close a topic politely even when someone is a little upset.' },
  'งอน': { std: 'งอน', rom: 'ngɔɔn', mean: 'to sulk (often playfully)', reg: 'Close relationships', note: 'Usually wants a little attention, not a big apology.' },
  'กินข้าวยัง': { std: 'กินข้าวหรือยัง', rom: 'gin khâao rʉ̌ʉ yang', mean: 'Have you eaten yet?', reg: 'Everyday', note: 'Often a caring greeting, not a dinner invitation.' },
  'เกรงใจ': { std: 'เกรงใจ', rom: 'greeng-jai', mean: 'reluctant to impose on someone', reg: 'Everyday', note: 'Key cultural idea; no single English word.' },
  'ค่ะ': { std: 'ค่ะ', rom: 'khâ', mean: 'polite ending (woman speaking)', reg: 'Polite', note: '' },
  'ครับ': { std: 'ครับ', rom: 'khráp', mean: 'polite ending (man speaking)', reg: 'Polite', note: '' },
  'จ้า': { std: 'จ้า', rom: 'jâa', mean: 'friendly "yes / okay"', reg: 'Friendly', note: 'Warmer and cuter than ค่ะ/ครับ.' },
  'มาก': { std: 'มาก', rom: 'mâak', mean: 'very / a lot', reg: 'Standard', note: '' },
  'อร่อย': { std: 'อร่อย', rom: 'a-rɔ̀i', mean: 'delicious', reg: 'Standard', note: '' },
  'สวัสดี': { std: 'สวัสดี', rom: 'sà-wàt-dii', mean: 'hello / goodbye', reg: 'Standard', note: '' },
  'หวัดดี': { std: 'สวัสดี', rom: 'wàt-dii', mean: 'hi (casual)', reg: 'Casual', note: 'Short, friendly form. Too casual for elders or your boss.' },
  'ขอบคุณ': { std: 'ขอบคุณ', rom: 'khɔ̀ɔp-khun', mean: 'thank you', reg: 'Standard', note: '' }
};

export const DECODE_EXAMPLES = ['พนว่างป่าว 55555 ก็ได้นะ', 'ทำไรอยู่', 'เดวไปหา จ้า', 'กินข้าวยัง', 'อร่อยมากกก'];

// Splits Thai text into known chunks (longest match first), laughter, and unknown pieces.
export function decode(text) {
  const out = []; let i = 0;
  const keys = Object.keys(DICT).sort((a, b) => b.length - a.length);
  const s = text.trim();
  while (i < s.length) {
    if (/\s/.test(s[i])) { i++; continue; }
    const laugh = s.slice(i).match(/^5{3,}/);
    if (laugh) { out.push({ src: laugh[0], laugh: true }); i += laugh[0].length; continue; }
    let hit = null;
    for (const k of keys) { if (s.startsWith(k, i)) { hit = k; break; } }
    if (hit) {
      let j = i + hit.length, st = '';
      while (j < s.length && s[j] === hit[hit.length - 1]) { st += s[j]; j++; }
      out.push({ src: hit + st, key: hit, stretch: st.length > 0 }); i = j; continue;
    }
    let j = i + 1;
    while (j < s.length && !/\s/.test(s[j]) && !keys.some(k => s.startsWith(k, j)) && !/^5{3,}/.test(s.slice(j))) j++;
    out.push({ src: s.slice(i, j), unknown: true }); i = j;
  }
  return out;
}
