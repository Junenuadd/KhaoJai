// Real-life Thai (after the foundation): conversation "lines" with stations.
// These unlock only after the learner passes the Thai Foundation check (Stage 5).
// The learning map is a set of "lines" (like a city train map). Each line has stations; each station is a lesson.
// Exercise types: choose · listen · match · build · chat · tone
// Thai text is always paired with romanization so beginners can follow.

export const LINES = [
  { id: 'hello', n: 1, th: 'สายสวัสดี', en: 'Hello Line', color: 'lav',   stations: ['s1', 's2', 'm1'] },
  { id: 'cafe',  n: 2, th: 'สายคาเฟ่',  en: 'Café Line',  color: 'mint',  stations: ['s3', 's4'] },
  { id: 'chat',  n: 3, th: 'สายแชต',    en: 'Chat Line',  color: 'pink',  stations: ['s5', 's6'] }
];

// Order in which stations unlock.
export const ORDER = ['s1', 's2', 'm1', 's3', 's4', 's5', 's6'];

export const STATIONS = {
  s1: {
    th: 'สถานีสวัสดี', en: 'Say hello', words: ['สวัสดี', 'ขอบคุณ', 'ครับ', 'ค่ะ', 'ไม่เป็นไร'],
    ex: [
      { t: 'choose', q: 'Which one means "hello"?', thai: true,
        o: [['สวัสดี', 'sà-wàt-dii'], ['ขอบคุณ', 'khɔ̀ɔp-khun'], ['ไม่เป็นไร', 'mâi bpen rai']], a: 0,
        why: 'สวัสดี (sà-wàt-dii) works morning, noon and night — and also means goodbye.' },
      { t: 'listen', say: 'ขอบคุณ', thai: true,
        o: [['สวัสดี', 'sà-wàt-dii'], ['ขอบคุณ', 'khɔ̀ɔp-khun'], ['ครับ', 'khráp']], a: 1,
        why: 'ขอบคุณ (khɔ̀ɔp-khun) = thank you.' },
      { t: 'match', pairs: [['สวัสดี', 'hello'], ['ขอบคุณ', 'thank you'], ['ครับ', 'polite ending (man)'], ['ค่ะ', 'polite ending (woman)'], ['ไม่เป็นไร', 'it\'s okay']] },
      { t: 'build', q: 'Thank you (said by a woman)',
        ans: [['ขอบคุณ', 'khɔ̀ɔp-khun'], ['ค่ะ', 'khâ']], extra: [['ครับ', 'khráp'], ['สวัสดี', 'sà-wàt-dii']],
        why: 'Women end polite sentences with ค่ะ (khâ), men with ครับ (khráp).' },
      { t: 'chat', who: 'Friend', msg: 'ขอบคุณมากนะ', msgR: 'khɔ̀ɔp-khun mâak ná', msgE: 'Thanks a lot!',
        o: [['ไม่เป็นไร', 'mâi bpen rai', 'No worries'], ['สวัสดี', 'sà-wàt-dii', 'Hello'], ['ขอบคุณ', 'khɔ̀ɔp-khun', 'Thank you']], a: 0,
        why: 'ไม่เป็นไร is the natural reply to thanks — like "no worries".' },
      { t: 'choose', q: 'You are a man greeting your boss. Which is most polite?', thai: true,
        o: [['สวัสดีครับ', 'sà-wàt-dii khráp'], ['สวัสดีค่ะ', 'sà-wàt-dii khâ'], ['หวัดดี', 'wàt-dii']], a: 0,
        why: 'Men add ครับ. หวัดดี is the casual version — fine with friends, too casual for a boss.' }
    ]
  },
  s2: {
    th: 'สถานีชื่ออะไร', en: 'What\'s your name?', words: ['ผม', 'ฉัน', 'ชื่อ', 'คุณ', 'อะไร', 'ยินดีที่ได้รู้จัก'],
    ex: [
      { t: 'match', pairs: [['ผม', 'I (man speaking)'], ['ฉัน', 'I (often a woman)'], ['ชื่อ', 'name'], ['คุณ', 'you'], ['อะไร', 'what']] },
      { t: 'choose', q: 'What does this mean?', show: 'คุณชื่ออะไร', showR: 'khun chʉ̂ʉ a-rai',
        o: [['What\'s your name?'], ['Where are you going?'], ['Have you eaten yet?']], a: 0,
        why: 'คุณ (you) + ชื่อ (name) + อะไร (what). Thai puts the question word at the end.' },
      { t: 'build', q: 'My name is Alex (a man speaking)',
        ans: [['ผม', 'phǒm'], ['ชื่อ', 'chʉ̂ʉ'], ['อเล็กซ์', 'a-lék'], ['ครับ', 'khráp']], extra: [['ฉัน', 'chǎn'], ['ค่ะ', 'khâ']],
        why: 'ผม + ชื่อ + your name + ครับ. A woman would say ฉันชื่อ… ค่ะ.' },
      { t: 'listen', say: 'ยินดีที่ได้รู้จัก', thai: true,
        o: [['ยินดีที่ได้รู้จัก', 'yin-dii thîi dâai rúu-jàk'], ['ไม่เป็นไร', 'mâi bpen rai'], ['ขอบคุณ', 'khɔ̀ɔp-khun']], a: 0,
        why: 'ยินดีที่ได้รู้จัก = nice to meet you.' },
      { t: 'chat', who: 'New friend', msg: 'คุณชื่ออะไรคะ', msgR: 'khun chʉ̂ʉ a-rai khá', msgE: 'What\'s your name?',
        o: [['ผมชื่ออเล็กซ์ครับ', 'phǒm chʉ̂ʉ a-lék khráp', 'My name is Alex'], ['คุณชื่ออเล็กซ์', 'khun chʉ̂ʉ a-lék', 'Your name is Alex'], ['ไม่เป็นไรครับ', 'mâi bpen rai khráp', 'Never mind']], a: 0,
        why: 'Use ผม (I) not คุณ (you) when talking about yourself.' }
    ]
  },
  m1: {
    th: 'ภารกิจ: ทักทายครอบครัว', en: 'Mission: meet a Thai family', mission: true, words: ['กินข้าวยัง', 'ไหว้'],
    ex: [
      { t: 'chat', who: 'Your partner\'s mom', msg: 'สวัสดีจ้ะ', msgR: 'sà-wàt-dii jâ', msgE: 'Hello, dear!',
        o: [['สวัสดีครับคุณแม่', 'sà-wàt-dii khráp khun-mɛ̂ɛ', 'Hello, Mom (polite)'], ['หวัดดี', 'wàt-dii', 'Hi'], ['555', 'hâa hâa hâa', '(laughing)']], a: 0,
        why: 'With elders use the full สวัสดี + ครับ/ค่ะ. Calling her คุณแม่ (mother) sounds warm and respectful.' },
      { t: 'choose', q: 'What should you do with your hands when greeting an elder?',
        o: [['A wai: palms together, a small bow'], ['A firm handshake'], ['A high five']], a: 0,
        why: 'The ไหว้ (wâi) shows respect. The younger person usually wais first.' },
      { t: 'chat', who: 'Your partner\'s mom', msg: 'กินข้าวยัง', msgR: 'gin khâao yang', msgE: 'Have you eaten yet?',
        o: [['กินแล้วครับ', 'gin lɛ́ɛo khráp', 'Yes, I have'], ['ไม่เป็นไรครับ', 'mâi bpen rai khráp', 'Never mind'], ['ผมชื่ออเล็กซ์ครับ', 'phǒm chʉ̂ʉ a-lék khráp', 'My name is Alex']], a: 0,
        why: 'กินข้าวยัง is a caring greeting. Answer กินแล้ว (already ate) or ยังเลย (not yet).' },
      { t: 'build', q: 'Nice to meet you (a man speaking)',
        ans: [['ยินดี', 'yin-dii'], ['ที่ได้', 'thîi dâai'], ['รู้จัก', 'rúu-jàk'], ['ครับ', 'khráp']], extra: [['ค่ะ', 'khâ'], ['ขอบคุณ', 'khɔ̀ɔp-khun']],
        why: 'ยินดีที่ได้รู้จักครับ — a perfect first line with a new family.' }
    ]
  },
  s3: {
    th: 'สถานีชาเย็น', en: 'Iced tea, less sweet', words: ['ชาเย็น', 'กาแฟ', 'น้ำ', 'หวานน้อย', 'ร้อน', 'เอา'],
    ex: [
      { t: 'match', pairs: [['ชาเย็น', 'Thai iced tea'], ['กาแฟ', 'coffee'], ['น้ำ', 'water'], ['หวานน้อย', 'less sweet'], ['ร้อน', 'hot']] },
      { t: 'listen', say: 'หวานน้อย', thai: true,
        o: [['หวานมาก', 'wǎan mâak'], ['หวานน้อย', 'wǎan nɔ́ɔi'], ['ไม่หวาน', 'mâi wǎan']], a: 1,
        why: 'หวานน้อย = less sweet. Thai drinks are sweet by default, so this one is useful!' },
      { t: 'build', q: 'One Thai iced tea, less sweet, please (a woman ordering)',
        ans: [['เอา', 'ao'], ['ชาเย็น', 'chaa-yen'], ['หวานน้อย', 'wǎan nɔ́ɔi'], ['ค่ะ', 'khâ']], extra: [['กาแฟ', 'gaa-fɛɛ'], ['ครับ', 'khráp']],
        why: 'เอา (ao, "I\'ll take") + the drink + how sweet + ค่ะ/ครับ.' },
      { t: 'choose', q: 'What does this mean?', show: 'ไม่หวาน', showR: 'mâi wǎan',
        o: [['Not sweet'], ['Very sweet'], ['Less sweet']], a: 0,
        why: 'ไม่ (mâi) = not. ไม่หวาน = no sugar.' },
      { t: 'chat', who: 'Café staff', msg: 'รับอะไรดีคะ', msgR: 'ráp a-rai dii khá', msgE: 'What would you like?',
        o: [['เอากาแฟเย็นค่ะ', 'ao gaa-fɛɛ yen khâ', 'An iced coffee, please'], ['ไม่เป็นไรค่ะ', 'mâi bpen rai khâ', 'Never mind'], ['คุณชื่ออะไรคะ', 'khun chʉ̂ʉ a-rai khá', 'What\'s your name?']], a: 0,
        why: 'ไม่เป็นไร here would sound like you changed your mind and don\'t want anything.' }
    ]
  },
  s4: {
    th: 'สถานีไม่เผ็ด', en: 'Not spicy, please', words: ['เผ็ด', 'ไม่เผ็ด', 'นิดหน่อย', 'อร่อย'],
    ex: [
      { t: 'choose', q: 'What does this mean?', show: 'ไม่เผ็ด', showR: 'mâi phèt',
        o: [['Not spicy'], ['Very spicy'], ['Delicious']], a: 0, why: 'เผ็ด (phèt) = spicy. ไม่เผ็ด = not spicy.' },
      { t: 'match', pairs: [['เผ็ด', 'spicy'], ['ไม่เผ็ด', 'not spicy'], ['นิดหน่อย', 'a little'], ['อร่อย', 'delicious']] },
      { t: 'build', q: 'Can you make it not spicy?',
        ans: [['ไม่', 'mâi'], ['เผ็ด', 'phèt'], ['ได้', 'dâai'], ['ไหม', 'mái']], extra: [['มาก', 'mâak'], ['อร่อย', 'a-rɔ̀i']],
        why: '…ได้ไหม (dâai mái) at the end turns it into "can you…?"' },
      { t: 'chat', who: 'Street-food cook', msg: 'กินเผ็ดได้ไหมคะ', msgR: 'gin phèt dâai mái khá', msgE: 'Can you eat spicy food?',
        o: [['นิดหน่อยครับ', 'nít-nɔ̀i khráp', 'A little'], ['อร่อยครับ', 'a-rɔ̀i khráp', 'It\'s delicious'], ['ร้อนครับ', 'rɔ́ɔn khráp', 'It\'s hot (temperature)']], a: 0,
        why: 'Answer the question first. ร้อน means hot like temperature, not spicy.' },
      { t: 'listen', say: 'อร่อย', thai: true,
        o: [['อร่อย', 'a-rɔ̀i'], ['ร้อน', 'rɔ́ɔn'], ['น้ำ', 'náam']], a: 0, why: 'อร่อย = delicious. Say it to the cook and watch them smile.' }
    ]
  },
  s5: {
    th: 'สถานี 555', en: 'Chat like a Thai', words: ['555', 'พน', 'ทำไร', 'เดว', 'จ้า', 'ก็ได้'],
    ex: [
      { t: 'choose', q: 'In a Thai chat, what does "555" mean?',
        o: [['Laughing — 5 is "hâa" in Thai'], ['The number five hundred fifty-five'], ['"I\'m busy"']], a: 0,
        why: 'ห้า (hâa) = five, so 555 sounds like "ha ha ha". More 5s usually means a bigger laugh.' },
      { t: 'match', pairs: [['พน', 'tomorrow (chat)'], ['ทำไร', 'what are you doing? (chat)'], ['เดว', 'in a moment (chat)'], ['จ้า', 'friendly "okay"']] },
      { t: 'chat', who: 'Friend', msg: 'พนว่างป่าว', msgR: 'phrûng-níi wâang bplàao', msgE: 'Free tomorrow?',
        o: [['ว่างจ้า', 'wâang jâa', 'Free!'], ['555', 'hâa hâa hâa', '(just laughing)'], ['ขอบคุณค่ะ', 'khɔ̀ɔp-khun khâ', 'Thank you']], a: 0,
        why: 'พน = พรุ่งนี้ (tomorrow), ป่าว = "or not?". ว่างจ้า is a friendly yes.' },
      { t: 'choose', q: 'Your friend replies "ก็ได้". What could it mean?',
        o: [['A happy "sure" or a reluctant "fine…" — it depends'], ['Always that they\'re angry'], ['Always that they\'re happy']], a: 0,
        why: 'Tone, emoji and context decide. If unsure, it\'s fine to ask: โอเคจริงไหม? (really okay?)' },
      { t: 'build', q: 'What are you doing? (casual chat)',
        ans: [['ทำไร', 'tham rai'], ['อยู่', 'yùu']], extra: [['พน', 'phrûng-níi'], ['จ้า', 'jâa']],
        why: 'ทำไรอยู่ = chat spelling of ทำอะไรอยู่. Not a typo — everyone types it this way.' }
    ]
  },
  s6: {
    th: 'สถานีงอน', en: 'Sulking & teasing', words: ['งอน', 'เขิน', 'แซว', 'ง้อ'],
    ex: [
      { t: 'choose', q: 'What does this mean?', show: 'งอน', showR: 'ngɔɔn',
        o: [['To sulk playfully — wants a little attention'], ['To be very angry'], ['To be sleepy']], a: 0,
        why: 'งอน is common between partners and close friends. It\'s usually light, not a big fight.' },
      { t: 'match', pairs: [['งอน', 'to sulk'], ['เขิน', 'shy / blushing'], ['แซว', 'to tease'], ['ง้อ', 'to win someone back']] },
      { t: 'chat', who: 'Your partner', msg: 'งอนแล้วนะ', msgR: 'ngɔɔn lɛ́ɛo ná', msgE: 'I\'m sulking now!',
        o: [['ขอโทษน้า อย่างอนนะ', 'khɔ̌ɔ-thôot náa, yàa ngɔɔn ná', 'Sorry~ don\'t sulk'], ['ก็ได้', 'gɔ̂ɔ-dâai', 'Fine'], ['ไม่เป็นไร', 'mâi bpen rai', 'Never mind']], a: 0,
        why: 'They want you to ง้อ (win them back). ก็ได้ or ไม่เป็นไร can sound cold here.' },
      { t: 'choose', q: 'A friend teases you and you reply "เขินนะ". You mean…',
        o: [['You\'re making me blush'], ['I\'m angry with you'], ['I\'m hungry']], a: 0,
        why: 'เขิน (khə̌ən) = shy, flustered, blushing.' }
    ]
  },
  s7: {
    th: 'สถานีอักษรกลาง', en: 'Mid-class letters & tone marks', words: ['ก', 'จ', 'ด', 'ต', 'บ', 'ป', 'อ'],
    ex: [
      { t: 'choose', q: 'How many mid-class consonants does Thai have?',
        o: [['9'], ['11'], ['24']], a: 0,
        why: 'ก จ ด ต ฎ ฏ บ ป อ. Their tone follows the tone mark directly — the easiest group to start with.' },
      { t: 'tone', syl: 'ปา', r: 'bpaa · to throw', a: 'Mid', why: 'Mid-class, live syllable, no tone mark → mid tone.' },
      { t: 'tone', syl: 'ป่า', r: 'bpàa · forest', a: 'Low', why: 'Mid-class + ไม้เอก ( ่ ) → low tone.' },
      { t: 'tone', syl: 'ป้า', r: 'bpâa · aunt', a: 'Falling', why: 'Mid-class + ไม้โท ( ้ ) → falling tone.' },
      { t: 'tone', syl: 'ไก่', r: 'gài · chicken', a: 'Low', why: 'ก is mid-class + ไม้เอก → low tone.' },
      { t: 'tone', syl: 'ต้ม', r: 'dtôm · to boil', a: 'Falling', why: 'ต is mid-class + ไม้โท → falling tone (as in ต้มยำ).' }
    ]
  }
};

// Practice drill: reading Thai time and money out loud.
export const TIME_DRILL = [
  { t: 'choose', q: 'How do you say this time?', show: '19:00', thai: true, o: [['หนึ่งทุ่ม', 'nʉ̀ng thûm'], ['เจ็ดโมงเช้า', 'jèt moong cháao'], ['บ่ายเจ็ดโมง', 'bàai jèt moong']], a: 0, why: 'Evening hours 19:00–23:00 use ทุ่ม: 19:00 = หนึ่งทุ่ม.' },
  { t: 'choose', q: 'How do you say this time?', show: '13:00', thai: true, o: [['ตีหนึ่ง', 'dtii nʉ̀ng'], ['บ่ายโมง', 'bàai moong'], ['หนึ่งทุ่ม', 'nʉ̀ng thûm']], a: 1, why: 'Early afternoon uses บ่าย: 13:00 = บ่ายโมง.' },
  { t: 'choose', q: 'How do you say this time?', show: '02:00', thai: true, o: [['สองโมงเช้า', 'sɔ̌ɔng moong cháao'], ['สองทุ่ม', 'sɔ̌ɔng thûm'], ['ตีสอง', 'dtii sɔ̌ɔng']], a: 2, why: 'After midnight uses ตี: 02:00 = ตีสอง.' },
  { t: 'choose', q: 'How do you say this price?', show: '฿25.50', thai: true, o: [['ยี่สิบห้าบาทห้าสิบสตางค์', 'yîi-sìp-hâa bàat hâa-sìp sà-dtaang'], ['ยี่สิบห้าจุดห้าบาท', 'yîi-sìp-hâa jùt hâa bàat'], ['สองห้าบาทห้าศูนย์', 'sɔ̌ɔng hâa bàat hâa sǔun']], a: 0, why: 'Baht first, then satang. 20 is ยี่สิบ, not สองสิบ.' },
  { t: 'choose', q: 'How do you say this number?', show: '1,250', thai: true, o: [['หนึ่งสองห้าศูนย์', 'nʉ̀ng sɔ̌ɔng hâa sǔun'], ['หนึ่งพันสองร้อยห้าสิบ', 'nʉ̀ng phan sɔ̌ɔng rɔ́ɔi hâa-sìp'], ['พันสองห้าสิบ', 'phan sɔ̌ɔng hâa-sìp']], a: 1, why: 'Read by place value: พัน (1,000), ร้อย (100), สิบ (10).' }
];

export const TONES = ['Mid', 'Low', 'Falling', 'High', 'Rising'];

// Word bank: every word a learner can collect.
export const WORDS = {
  'สวัสดี': ['sà-wàt-dii', 'hello / goodbye'], 'ขอบคุณ': ['khɔ̀ɔp-khun', 'thank you'], 'ครับ': ['khráp', 'polite ending (man)'],
  'ค่ะ': ['khâ', 'polite ending (woman)'], 'ไม่เป็นไร': ['mâi bpen rai', 'it\'s okay / no worries'], 'ผม': ['phǒm', 'I (man)'],
  'ฉัน': ['chǎn', 'I (often a woman)'], 'ชื่อ': ['chʉ̂ʉ', 'name'], 'คุณ': ['khun', 'you'], 'อะไร': ['a-rai', 'what'],
  'ยินดีที่ได้รู้จัก': ['yin-dii thîi dâai rúu-jàk', 'nice to meet you'], 'กินข้าวยัง': ['gin khâao yang', 'have you eaten yet?'],
  'ไหว้': ['wâi', 'the wai greeting'], 'ชาเย็น': ['chaa-yen', 'Thai iced tea'], 'กาแฟ': ['gaa-fɛɛ', 'coffee'], 'น้ำ': ['náam', 'water'],
  'หวานน้อย': ['wǎan nɔ́ɔi', 'less sweet'], 'ร้อน': ['rɔ́ɔn', 'hot'], 'เอา': ['ao', 'I\'ll take / want'], 'เผ็ด': ['phèt', 'spicy'],
  'ไม่เผ็ด': ['mâi phèt', 'not spicy'], 'นิดหน่อย': ['nít-nɔ̀i', 'a little'], 'อร่อย': ['a-rɔ̀i', 'delicious'],
  '555': ['hâa hâa hâa', 'laughing'], 'พน': ['phrûng-níi', 'tomorrow (chat)'], 'ทำไร': ['tham rai', 'what are you doing? (chat)'],
  'เดว': ['dǐao', 'in a moment (chat)'], 'จ้า': ['jâa', 'friendly "okay"'], 'ก็ได้': ['gɔ̂ɔ-dâai', 'sure / fine'],
  'งอน': ['ngɔɔn', 'to sulk'], 'เขิน': ['khə̌ən', 'shy / blushing'], 'แซว': ['sɛɛo', 'to tease'], 'ง้อ': ['ngɔ́ɔ', 'to win someone back'],
  'ก': ['gɔɔ gài', 'mid-class letter'], 'จ': ['jɔɔ jaan', 'mid-class letter'], 'ด': ['dɔɔ dèk', 'mid-class letter'], 'ต': ['dtɔɔ dtào', 'mid-class letter'],
  'บ': ['bɔɔ bai-máai', 'mid-class letter'], 'ป': ['bpɔɔ bplaa', 'mid-class letter'], 'อ': ['ɔɔ àang', 'mid-class letter']
};
