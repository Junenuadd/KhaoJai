// Content for Phases 4, 6, 7 and 8 (Phase 3 words live in vocab.js, Phase 5 conversations in beyond.js).
// Content status: written by น้องเบ้บ (v0.7, 2026-11-07) — needs a check by a Thai reviewer before launch.
// Sentence tiles: [Thai, romanization]. Choice options: [shown text, small text].

/* =========================================================
   PHASE 4 — SENTENCES & GRAMMAR
   ========================================================= */
// order: sentences the learner builds from word tiles. extra = wrong tiles mixed in.
// pick: "which sentence is right?" questions. o = [Thai, romanization, English].
export const GRAMMAR = [
  { id: 'S1', title: 'Word order: who · does · what', th: 'ฉัน กิน ข้าว',
    explain: [
      ['Same order as English', 'A Thai sentence usually goes: who → does → what. ฉัน (I) + กิน (eat) + ข้าว (rice) = "I eat rice". There are no articles (a, the) and no plural endings.'],
      ['Describing words come after', 'Adjectives follow the noun: บ้าน (house) + ใหญ่ (big) = "a big house". They can also be the whole verb: บ้านใหญ่ = "the house is big" — no word for "is" needed.']],
    examples: [['ฉันกินข้าว', 'chan gin kaao', 'I eat rice.'], ['เขาชอบกาแฟ', 'kao chorp gaa-fae', 'He / she likes coffee.'], ['บ้านใหญ่', 'baan yai', 'a big house / the house is big'], ['แมวนอน', 'maew norn', 'The cat sleeps.']],
    order: [
      { en: 'I eat rice.', ans: [['ฉัน', 'chan'], ['กิน', 'gin'], ['ข้าว', 'kaao']], extra: [['ไหม', 'mai']] },
      { en: 'He likes coffee.', ans: [['เขา', 'kao'], ['ชอบ', 'chorp'], ['กาแฟ', 'gaa-fae']], extra: [['ไม่', 'mai']] },
      { en: 'The food is delicious.', ans: [['อาหาร', 'aa-haan'], ['อร่อย', 'a-roi']], extra: [['คือ', 'kuue']] },
      { en: 'My friend drinks water.', ans: [['เพื่อน', 'puean'], ['ฉัน', 'chan'], ['ดื่ม', 'duuem'], ['น้ำ', 'naam']], extra: [['กิน', 'gin']] }],
    pick: [
      { q: 'Which means "a big house"?', o: [['บ้านใหญ่', 'baan yai', 'a big house'], ['ใหญ่บ้าน', 'yai baan', '(wrong order)'], ['บ้านคือใหญ่', 'baan kuue yai', '(no "is" before adjectives)']], a: 0, why: 'The describing word comes after the noun, and Thai needs no "is" before it.' },
      { q: 'Which means "I like cats"?', o: [['ฉันชอบแมว', 'chan chorp maew', 'I like cats'], ['แมวชอบฉัน', 'maew chorp chan', 'Cats like me'], ['ชอบฉันแมว', 'chorp chan maew', '(wrong order)']], a: 0, why: 'Who (ฉัน) → does (ชอบ) → what (แมว).' }] },
  { id: 'S2', title: 'Asking questions', th: 'ไหม · อะไร · ที่ไหน',
    explain: [
      ['Yes/no questions: add ไหม', 'Put ไหม (mai) at the END of a sentence to make a yes/no question: คุณหิว (you are hungry) → คุณหิวไหม (are you hungry?). Answer by repeating the verb: หิว (yes) or ไม่หิว (no).'],
      ['Question words stay in place', 'อะไร (what), ที่ไหน (where), ใคร (who) and เมื่อไหร่ (when) go where the answer would go — usually at the end: คุณไปไหน = "you go where?"']],
    examples: [['คุณหิวไหม', 'kun hiw mai', 'Are you hungry?'], ['นี่คืออะไร', 'nee kuue a-rai', 'What is this?'], ['คุณไปไหน', 'kun bpai nai', 'Where are you going?'], ['นั่นใคร', 'nan krai', 'Who is that?']],
    order: [
      { en: 'Are you hungry?', ans: [['คุณ', 'kun'], ['หิว', 'hiw'], ['ไหม', 'mai']], extra: [['อะไร', 'a-rai']] },
      { en: 'What is this?', ans: [['นี่', 'nee'], ['คือ', 'kuue'], ['อะไร', 'a-rai']], extra: [['ไหม', 'mai']] },
      { en: 'Where are you going?', ans: [['คุณ', 'kun'], ['ไป', 'bpai'], ['ไหน', 'nai']], extra: [['ใคร', 'krai']] },
      { en: 'Do you like coffee?', ans: [['คุณ', 'kun'], ['ชอบ', 'chorp'], ['กาแฟ', 'gaa-fae'], ['ไหม', 'mai']], extra: [['ที่ไหน', 'tee-nai']] }],
    pick: [
      { q: 'Someone asks "อร่อยไหม". A natural "yes" is…', o: [['อร่อย', 'a-roi', 'delicious (= yes)'], ['ใช่', 'chai', 'that\'s right'], ['ไหม', 'mai', '(question word)']], a: 0, why: 'Thai answers yes by repeating the verb or adjective. ใช่ is for "is it true that…?" questions.' },
      { q: 'Which asks "Who is that?"', o: [['นั่นใคร', 'nan krai', 'Who is that?'], ['ใครนั่นไหม', 'krai nan mai', '(two question words)'], ['นั่นอะไร', 'nan a-rai', 'What is that?']], a: 0, why: 'ใคร = who. Never use ไหม together with another question word.' }] },
  { id: 'S3', title: 'Saying no: ไม่ and ไม่ใช่', th: 'ไม่ · ไม่ใช่ · ยังไม่',
    explain: [
      ['ไม่ before verbs and adjectives', 'Put ไม่ (mai) in front of the verb or describing word: ชอบ (like) → ไม่ชอบ (don\'t like); เผ็ด (spicy) → ไม่เผ็ด (not spicy).'],
      ['ไม่ใช่ before nouns', 'To say something is NOT a thing, use ไม่ใช่: ไม่ใช่ครู = "(I\'m) not a teacher". ยังไม่ means "not yet": ยังไม่กิน = "haven\'t eaten yet".']],
    examples: [['ฉันไม่ชอบ', 'chan mai chorp', 'I don\'t like it.'], ['ไม่เผ็ด', 'mai pet', 'not spicy'], ['เขาไม่ใช่ครู', 'kao mai chai kroo', 'He isn\'t a teacher.'], ['ยังไม่กิน', 'yang mai gin', 'haven\'t eaten yet']],
    order: [
      { en: 'I don\'t like coffee.', ans: [['ฉัน', 'chan'], ['ไม่', 'mai'], ['ชอบ', 'chorp'], ['กาแฟ', 'gaa-fae']], extra: [['ใช่', 'chai']] },
      { en: 'It isn\'t spicy.', ans: [['ไม่', 'mai'], ['เผ็ด', 'pet']], extra: [['ใช่', 'chai']] },
      { en: 'He isn\'t a teacher.', ans: [['เขา', 'kao'], ['ไม่ใช่', 'mai chai'], ['ครู', 'kroo']], extra: [['ไม่', 'mai']] },
      { en: 'I haven\'t eaten yet.', ans: [['ฉัน', 'chan'], ['ยัง', 'yang'], ['ไม่', 'mai'], ['กิน', 'gin']], extra: [['แล้ว', 'laeo']] }],
    pick: [
      { q: 'Which means "not expensive"?', o: [['ไม่แพง', 'mai paeng', 'not expensive'], ['ไม่ใช่แพง', 'mai chai paeng', '(ไม่ใช่ goes with nouns)'], ['แพงไม่', 'paeng mai', '(wrong order)']], a: 0, why: 'แพง is a describing word, so it takes ไม่.' },
      { q: 'Which means "This isn\'t my phone"?', o: [['นี่ไม่ใช่โทรศัพท์ฉัน', 'nee mai chai toh-ra-sap chan', 'This isn\'t my phone'], ['นี่ไม่โทรศัพท์ฉัน', 'nee mai toh-ra-sap chan', '(ไม่ can\'t go before a noun)'], ['ไม่นี่โทรศัพท์ฉัน', 'mai nee toh-ra-sap chan', '(wrong order)']], a: 0, why: 'โทรศัพท์ (phone) is a noun, so use ไม่ใช่.' }] },
  { id: 'S4', title: 'Past, now and future', th: 'แล้ว · กำลัง · จะ',
    explain: [
      ['Verbs never change', 'กิน is "eat", "ate" and "will eat". Thai shows time with small words or time phrases instead.'],
      ['Three helper words', 'แล้ว (laeo) after the verb = already done: กินแล้ว. กำลัง (gam-lang) before the verb = doing now: กำลังกิน. จะ (ja) before the verb = will: จะกิน.']],
    examples: [['กินแล้ว', 'gin laeo', 'I\'ve eaten (already).'], ['เขากำลังนอน', 'kao gam-lang norn', 'He is sleeping.'], ['พรุ่งนี้ฉันจะไป', 'prung-nee chan ja bpai', 'Tomorrow I will go.'], ['เมื่อวานฉันไปตลาด', 'muea-waan chan bpai dta-laat', 'Yesterday I went to the market.']],
    order: [
      { en: 'I have already eaten.', ans: [['ฉัน', 'chan'], ['กิน', 'gin'], ['แล้ว', 'laeo']], extra: [['จะ', 'ja']] },
      { en: 'He is sleeping.', ans: [['เขา', 'kao'], ['กำลัง', 'gam-lang'], ['นอน', 'norn']], extra: [['แล้ว', 'laeo']] },
      { en: 'Tomorrow I will go.', ans: [['พรุ่งนี้', 'prung-nee'], ['ฉัน', 'chan'], ['จะ', 'ja'], ['ไป', 'bpai']], extra: [['กำลัง', 'gam-lang']] }],
    pick: [
      { q: 'Your friend asks "กินข้าวยัง" (have you eaten yet?). You ate an hour ago. You say…', o: [['กินแล้ว', 'gin laeo', 'I\'ve eaten'], ['จะกิน', 'ja gin', 'I will eat'], ['กำลังกิน', 'gam-lang gin', 'I\'m eating']], a: 0, why: 'แล้ว after the verb = already done.' },
      { q: 'Which means "I am studying Thai"?', o: [['ฉันกำลังเรียนภาษาไทย', 'chan gam-lang rian paa-saa tai', 'I am studying Thai'], ['ฉันเรียนแล้วภาษาไทย', 'chan rian laeo paa-saa tai', '(แล้ว in the wrong place)'], ['ฉันจะเรียนภาษาไทย', 'chan ja rian paa-saa tai', 'I will study Thai']], a: 0, why: 'กำลัง before the verb = happening now.' }] },
  { id: 'S5', title: 'Counting things: classifiers', th: 'แมวสองตัว',
    explain: [
      ['Noun + number + classifier', 'To count things, Thai says the thing, then the number, then a "counting word" (classifier): แมว (cat) + สอง (two) + ตัว = two cats.'],
      ['Common classifiers', 'ตัว for animals, clothes and furniture · คน for people · อัน for small things in general · แก้ว for glasses of drinks · เล่ม for books · คัน for cars.']],
    examples: [['แมวสองตัว', 'maew sorng dtua', 'two cats'], ['เพื่อนสามคน', 'puean saam kon', 'three friends'], ['กาแฟหนึ่งแก้ว', 'gaa-fae nueng gaew', 'one (glass of) coffee'], ['หนังสือสองเล่ม', 'nang-suue sorng lem', 'two books']],
    order: [
      { en: 'two cats', ans: [['แมว', 'maew'], ['สอง', 'sorng'], ['ตัว', 'dtua']], extra: [['คน', 'kon']] },
      { en: 'three friends', ans: [['เพื่อน', 'puean'], ['สาม', 'saam'], ['คน', 'kon']], extra: [['ตัว', 'dtua']] },
      { en: 'one coffee (glass)', ans: [['กาแฟ', 'gaa-fae'], ['หนึ่ง', 'nueng'], ['แก้ว', 'gaew']], extra: [['เล่ม', 'lem']] }],
    pick: [
      { q: 'Which classifier goes with people?', o: [['คน', 'kon', 'people'], ['ตัว', 'dtua', 'animals, clothes'], ['เล่ม', 'lem', 'books']], a: 0, why: 'ครูสองคน = two teachers.' },
      { q: 'Which means "two books"?', o: [['หนังสือสองเล่ม', 'nang-suue sorng lem', 'two books'], ['สองหนังสือ', 'sorng nang-suue', '(no classifier, wrong order)'], ['หนังสือสองคน', 'nang-suue sorng kon', '(คน is for people)']], a: 0, why: 'Noun + number + classifier (เล่ม for books).' }] },
  { id: 'S6', title: 'Sounding polite and friendly', th: 'ครับ · ค่ะ · คะ · นะ',
    explain: [
      ['Polite endings', 'Men end polite sentences with ครับ (krap). Women use ค่ะ (ka) for statements and คะ (ka, a higher tone) for questions: สบายดีไหมคะ.'],
      ['Softening words', 'นะ (na) makes a request or statement softer and friendlier: ไปกันนะ = "let\'s go, okay?". ด้วย (duay) after a request adds "please": ช่วยด้วย = "help, please!"']],
    examples: [['ขอบคุณครับ', 'korp-kun krap', 'Thank you (man).'], ['ขอบคุณค่ะ', 'korp-kun ka', 'Thank you (woman).'], ['หิวไหมคะ', 'hiw mai ka', 'Are you hungry? (woman asking)'], ['ไปกันนะ', 'bpai gan na', 'Let\'s go, okay?']],
    order: [
      { en: 'Thank you (a woman speaking)', ans: [['ขอบคุณ', 'korp-kun'], ['ค่ะ', 'ka']], extra: [['ครับ', 'krap'], ['คะ', 'ka']] },
      { en: 'Are you hungry? (a woman asking)', ans: [['หิว', 'hiw'], ['ไหม', 'mai'], ['คะ', 'ka']], extra: [['ค่ะ', 'ka']] },
      { en: 'Let\'s go, okay?', ans: [['ไป', 'bpai'], ['กัน', 'gan'], ['นะ', 'na']], extra: [['ไหม', 'mai']] }],
    pick: [
      { q: 'A man thanks a shop assistant. He says…', o: [['ขอบคุณครับ', 'korp-kun krap', 'thank you (man)'], ['ขอบคุณค่ะ', 'korp-kun ka', 'thank you (woman)'], ['ขอบคุณคะ', 'korp-kun ka', '(question ending)']], a: 0, why: 'Men use ครับ for statements and questions.' },
      { q: 'A woman asks "Where is the bathroom?". Which ending fits?', o: [['ห้องน้ำอยู่ที่ไหนคะ', 'horng-naam yoo tee-nai ka', 'question ending คะ'], ['ห้องน้ำอยู่ที่ไหนค่ะ', 'horng-naam yoo tee-nai ka', 'statement ending ค่ะ'], ['ห้องน้ำอยู่ที่ไหนครับ', 'horng-naam yoo tee-nai krap', 'man\'s ending']], a: 0, why: 'Women use คะ (high tone) for questions and ค่ะ for statements — a very common spelling mistake even for Thais!' }] }
];

/* =========================================================
   PHASE 6 — REAL THAI & CULTURE (new lessons; m1 "meet a Thai family" is reused from beyond.js)
   ========================================================= */
// Each item is a situation: a message or scene and the reply/choice that fits best.
export const CULTURE = [
  { id: 'K2', title: 'Calling people: พี่, น้อง, ป้า, ลุง', th: 'พี่ · น้อง · ป้า · ลุง',
    explain: [['Family words for everyone', 'Thais often call people by family words, even strangers. Someone a bit older is พี่ (pee), someone younger is น้อง (norng). Older women and men can be ป้า (bpaa, auntie) and ลุง (lung, uncle).'],
      ['Names come after', 'You can add a nickname: พี่ต้น, น้องมิว. In a restaurant, staff often call a waiter น้อง and the waiter may call you พี่.']],
    items: [
      { scene: 'You want to call a young waiter in a restaurant.', o: [['น้องครับ / น้องคะ', 'norng krap / norng ka', '"Little brother/sister!" — normal and friendly'], ['คุณครับ', 'kun krap', 'Polite but distant'], ['เฮ้', 'hey', 'Rude']], a: 0, why: 'น้อง is how most Thais call a younger waiter. It is warm, not rude.' },
      { scene: 'A friendly street-food seller, about 60 years old.', o: [['ป้าคะ / ป้าครับ', 'bpaa ka / bpaa krap', 'Auntie'], ['น้อง', 'norng', 'little sister'], ['พี่สาว', 'pee-saao', 'older sister']], a: 0, why: 'ป้า (auntie) shows warmth and respect for an older woman.' },
      { scene: 'A colleague who is a few years older than you.', o: [['พี่ + nickname', 'pee …', 'older brother/sister'], ['น้อง + nickname', 'norng …', 'younger'], ['ลุง', 'lung', 'uncle']], a: 0, why: 'At work, พี่ + nickname is the usual way to address an older colleague.' },
      { scene: 'Your Thai friend introduces their younger cousin. What might the cousin call you?', o: [['พี่', 'pee', 'older sibling'], ['ลูก', 'luuk', 'child'], ['แม่', 'mae', 'mother']], a: 0, why: 'Younger people call older people พี่ — it\'s a sign of respect and closeness.' }] },
  { id: 'K3', title: 'Formal and casual Thai', th: 'กิน · ทาน · รับประทาน',
    explain: [['Same meaning, different level', 'Thai has different words for the same idea depending on who you talk to. "To eat" is กิน (everyday), ทาน (polite), รับประทาน (very formal, written).'],
      ['Casual chat shortens words', 'With friends, ไหม often becomes มั้ย, ครับ becomes คับ, and สวัสดี becomes หวัดดี. They are fine with friends but too casual with a boss or an elder.']],
    items: [
      { scene: 'You are talking to your partner\'s grandmother about lunch.', o: [['ทานข้าวหรือยังคะ', 'taan kaao rue yang ka', 'polite: "have you eaten?"'], ['กินยังอะ', 'gin yang a', 'very casual'], ['แดกยัง', 'daek yang', 'rude slang']], a: 0, why: 'ทาน + ค่ะ/คะ/ครับ is polite and warm with elders.' },
      { scene: 'A message to your close friend.', o: [['หวัดดี ทำไรอยู่', 'wat-dee tam rai yoo', 'Hi, what are you doing?'], ['สวัสดีครับ ท่านกำลังทำอะไรอยู่ครับ', 'sa-wat-dee krap tan gam-lang …', 'extremely formal'], ['เรียนท่านผู้เกี่ยวข้อง', 'rian tan poo giao-korng', '"To whom it may concern"']], a: 0, why: 'With close friends, casual Thai sounds natural. Very formal Thai would sound like a joke.' },
      { scene: 'An email to a company.', o: [['เรียน ฝ่ายบุคคล', 'rian fai buk-ka-kon', 'Dear HR department'], ['หวัดดีจ้า', 'wat-dee jaa', 'Hiya!'], ['เฮ้ย', 'hoei', 'Hey!']], a: 0, why: 'เรียน is the formal opening of a letter or email.' },
      { scene: 'Which word for "eat" would you see on a restaurant\'s formal sign?', o: [['รับประทาน', 'rap-bpra-taan', 'very formal'], ['กิน', 'gin', 'everyday'], ['ทาน', 'taan', 'polite speech']], a: 0, why: 'รับประทาน is used in writing and very formal speech.' }] },
  { id: 'K4', title: 'เกรงใจ: being considerate', th: 'เกรงใจ · ไม่เป็นไร',
    explain: [['What is เกรงใจ?', 'เกรงใจ (greng-jai) is a feeling of not wanting to bother or burden others. It is why people may say "it\'s okay" even when it isn\'t quite, or avoid saying a direct "no".'],
      ['Soft ways to say no', 'Instead of a hard ไม่ (no), Thais often say ไม่เป็นไร (it\'s fine, no need), ไว้คราวหน้านะ (maybe next time) or give a reason. These are polite, not dishonest.']],
    items: [
      { scene: 'A friend invites you out tonight but you are tired. A soft, polite answer:', o: [['ไว้คราวหน้านะ วันนี้เหนื่อยมาก', 'wai kraao naa na, wan-nee nueay maak', 'Maybe next time — I\'m very tired today'], ['ไม่ไป', 'mai bpai', 'Not going.'], ['ไม่อยากเจอ', 'mai yaak jer', 'I don\'t want to see you.']], a: 0, why: 'Giving a reason and "next time" keeps the friendship warm.' },
      { scene: 'You offer to pay and your Thai friend says "ไม่เป็นไร ไม่เป็นไร". It most likely means…', o: [['No need, I\'ve got it (they don\'t want you to pay)', '', ''], ['They are angry', '', ''], ['They didn\'t understand you', '', '']], a: 0, why: 'ไม่เป็นไร here is a kind refusal — they feel เกรงใจ about you paying.' },
      { scene: 'You don\'t understand your boss\'s instructions. Best approach:', o: [['ขอโทษครับ ช่วยอธิบายอีกครั้งได้ไหมครับ', 'kor-toht krap, chuay a-ti-baai eek krang dai mai krap', 'Sorry, could you explain again?'], ['ไม่เข้าใจ', 'mai kao-jai', 'Don\'t understand. (blunt)'], ['Say nothing and guess', '', '']], a: 0, why: 'A polite apology plus a request is respectful and clear.' },
      { scene: 'Someone helps you carry heavy bags. You say…', o: [['ขอบคุณมากครับ / ค่ะ', 'korp-kun maak krap / ka', 'Thank you very much'], ['ไม่เป็นไร', 'mai bpen rai', 'Never mind'], ['อร่อย', 'a-roi', 'Delicious']], a: 0, why: 'ไม่เป็นไร is what the helper says back to your thanks.' }] }
];

/* =========================================================
   PHASE 7 — CHAT, SLANG & INTERNET THAI
   Living content: each entry has a register and a review date. AI may draft; a Thai reviewer must approve.
   ========================================================= */
export const CHAT = [
  { id: 'H3', title: 'How Thais type', th: 'คับ · ค่า · มั้ย · ป่าว', reviewed: '2026-11-07', status: 'draft',
    explain: [['Spelling it how it sounds', 'In chat, Thais often spell words the way they say them casually. It is not a mistake — but don\'t use it in formal writing.'],
      ['Stretching for feeling', 'Repeating the last letter adds feeling: ขอบคุณค่าาา (thank youuu), มากกกก (sooo much). More letters = more feeling.']],
    entries: [
      ['คับ', 'krap', 'casual ครับ (men)', 'casual'], ['ค่า / คร่า', 'kaa', 'cheerful ค่ะ (women)', 'casual, friendly'], ['มั้ย', 'mai', 'casual ไหม (question)', 'casual'],
      ['ป่าว', 'bplao', 'casual เปล่า ("no" / "or not?")', 'casual'], ['ไร', 'rai', 'short for อะไร (what)', 'casual'], ['งับ', 'ngap', 'cute ครับ/ค่ะ', 'cute, playful'],
      ['เค', 'keh', 'OK', 'casual'], ['จุ๊บๆ', 'jup jup', 'kisses (xoxo)', 'affectionate']] },
  { id: 'H4', title: 'Popular slang', th: 'ปัง · ฟิน · ตัวแม่ · ติ่ง', reviewed: '2026-11-07', status: 'draft',
    explain: [['Slang changes fast', 'These words were common in 2025–2026 on Thai social media and among fans. Some may sound old soon — that is normal. KhaoJai marks when each entry was last checked.'],
      ['Use with friends only', 'Slang is great with friends and online, but sounds odd at work or with elders.']],
    entries: [
      ['ปัง', 'bpang', 'a hit / amazing ("it slaps")', 'casual, positive'], ['ฟิน', 'fin', 'blissful, so satisfying (from "fin")', 'casual, positive'],
      ['ตัวแม่', 'dtua-mae', 'the queen, the best at something', 'casual, admiring'], ['ติ่ง', 'dting', 'a big fan (a stan)', 'casual'],
      ['เริ่ด', 'rert', 'fabulous', 'casual, playful'], ['มงลง', 'mong long', '"the crown lands" — they win / deserve it', 'casual, playful'],
      ['โป๊ะ', 'bpo', 'a blunder that exposes you', 'casual, teasing'], ['เท', 'teh', 'to bail on someone, to stand them up', 'casual'],
      ['แซะ', 'sae', 'to make a sly dig at someone', 'casual, can be negative'], ['นอยด์', 'noi', 'feeling down / anxious (from "paranoid")', 'casual']] }
];

/* =========================================================
   PHASE 8 — PRACTICAL THAI (reading real-life text)
   ========================================================= */
export const PRACTICAL = [
  { id: 'Z1', title: 'Signs', th: 'ป้าย', intro: 'Short words you see on doors and walls. Read them without romanization.',
    items: [
      { show: 'ทางเข้า', q: 'What does this sign mean?', o: ['Entrance', 'Exit', 'Toilet', 'Closed'], a: 0, rom: 'taang kao', why: 'ทาง (way) + เข้า (enter) = entrance.' },
      { show: 'ทางออก', q: 'What does this sign mean?', o: ['Exit', 'Entrance', 'Parking', 'Open'], a: 0, rom: 'taang ork', why: 'ทาง (way) + ออก (go out) = exit.' },
      { show: 'ห้องน้ำ', q: 'What does this sign mean?', o: ['Toilet / bathroom', 'Kitchen', 'Bedroom', 'Office'], a: 0, rom: 'horng-naam', why: 'ห้อง (room) + น้ำ (water) = bathroom.' },
      { show: 'ห้ามสูบบุหรี่', q: 'What does this sign mean?', o: ['No smoking', 'No parking', 'No photos', 'No entry'], a: 0, rom: 'haam suup bu-ree', why: 'ห้าม = forbidden. สูบบุหรี่ = to smoke cigarettes.' },
      { show: 'ปิด', q: 'A shop door says this. It means…', o: ['Closed', 'Open', 'Sale', 'Push'], a: 0, rom: 'bpit', why: 'ปิด = closed. เปิด (bpert) = open.' },
      { show: 'เปิด', q: 'A shop door says this. It means…', o: ['Open', 'Closed', 'Pull', 'Free'], a: 0, rom: 'bpert', why: 'เปิด = open.' },
      { show: 'ผลัก', q: 'On a door. What should you do?', o: ['Push', 'Pull', 'Knock', 'Wait'], a: 0, rom: 'plak', why: 'ผลัก = push. ดึง (dueng) = pull.' },
      { show: 'ระวัง', q: 'This sign warns you to…', o: ['Be careful', 'Hurry up', 'Be quiet', 'Pay here'], a: 0, rom: 'ra-wang', why: 'ระวัง = be careful / watch out.' }] },
  { id: 'Z2', title: 'Menus & food stalls', th: 'เมนู', intro: 'Read a simple Thai menu: dish names are built from cooking method + main ingredient.',
    items: [
      { show: 'ข้าวผัดไก่', q: 'What is this dish?', o: ['Chicken fried rice', 'Chicken soup', 'Pork fried rice', 'Grilled chicken'], a: 0, rom: 'kaao pat gai', why: 'ข้าว (rice) + ผัด (stir-fried) + ไก่ (chicken).' },
      { show: 'ก๋วยเตี๋ยวหมู', q: 'What is this dish?', o: ['Pork noodle soup', 'Pork fried rice', 'Chicken noodles', 'Pork salad'], a: 0, rom: 'guay-dtiao moo', why: 'ก๋วยเตี๋ยว = noodles (usually soup). หมู = pork.' },
      { show: 'ต้มยำกุ้ง', q: 'What is this dish?', o: ['Spicy-sour shrimp soup', 'Fried shrimp', 'Shrimp salad', 'Shrimp fried rice'], a: 0, rom: 'dtom-yam gung', why: 'ต้ม (boil) + ยำ (spicy-sour mix) + กุ้ง (shrimp).' },
      { show: 'ไก่ย่าง', q: 'What is this dish?', o: ['Grilled chicken', 'Fried chicken', 'Chicken soup', 'Chicken rice'], a: 0, rom: 'gai yaang', why: 'ย่าง = grilled.' },
      { show: 'น้ำเปล่า 10 บาท', q: 'What does this say?', o: ['Plain water, 10 baht', 'Ice, 10 baht', 'Juice, 10 baht', 'Water, 100 baht'], a: 0, rom: 'naam bplao sip baat', why: 'น้ำเปล่า = plain water.' },
      { show: 'เผ็ดน้อย', q: 'You ask for your food like this. It means…', o: ['A little spicy', 'Very spicy', 'Not salty', 'Extra sweet'], a: 0, rom: 'pet noi', why: 'เผ็ด (spicy) + น้อย (a little).' }] },
  { id: 'Z3', title: 'Messages', th: 'ข้อความ', intro: 'Short messages from friends, shops and apps.',
    items: [
      { show: 'ถึงแล้วโทรหานะ', q: 'Your friend writes this. They mean…', o: ['Call me when you arrive', 'I have arrived', 'Don\'t call me', 'I\'m on the phone'], a: 0, rom: 'tueng laeo toh haa na', why: 'ถึงแล้ว (arrived) + โทรหา (call) + นะ (please / okay?).' },
      { show: 'รอแป๊บนึง', q: 'This message means…', o: ['Wait a moment', 'I\'m leaving now', 'See you tomorrow', 'I can\'t wait'], a: 0, rom: 'ror bpaep nueng', why: 'รอ = wait. แป๊บนึง = a little moment (casual).' },
      { show: 'พัสดุของคุณจัดส่งแล้ว', q: 'A shopping app says this. It means…', o: ['Your parcel has been sent', 'Your parcel is lost', 'Please pay now', 'Your order is cancelled'], a: 0, rom: 'pat-sa-du korng kun jat song laeo', why: 'พัสดุ = parcel. จัดส่งแล้ว = has been shipped.' },
      { show: 'วันนี้ร้านหยุด', q: 'A restaurant posts this. It means…', o: ['The shop is closed today', 'The shop is busy today', 'New dishes today', 'Free food today'], a: 0, rom: 'wan-nee raan yut', why: 'หยุด = to stop / take a day off.' },
      { show: 'กำลังไป', q: 'Your friend replies this. They mean…', o: ['I\'m on my way', 'I already went', 'I won\'t go', 'Go now'], a: 0, rom: 'gam-lang bpai', why: 'กำลัง + ไป = going right now.' }] },
  { id: 'Z4', title: 'Getting around', th: 'การเดินทาง', intro: 'Tickets, stations and announcements.',
    items: [
      { show: 'ขาเข้า', q: 'At a station, this means…', o: ['Arrivals / inbound', 'Departures', 'Tickets', 'Platform 1'], a: 0, rom: 'kaa kao', why: 'ขาเข้า = coming in (arrivals).' },
      { show: 'ขาออก', q: 'At an airport, this means…', o: ['Departures', 'Arrivals', 'Baggage', 'Exit only'], a: 0, rom: 'kaa ork', why: 'ขาออก = going out (departures).' },
      { show: 'จำหน่ายตั๋ว', q: 'This window is for…', o: ['Selling tickets', 'Lost and found', 'Information', 'Waiting'], a: 0, rom: 'jam-naai dtua', why: 'จำหน่าย = to sell (formal). ตั๋ว = ticket.' },
      { show: 'สถานีต่อไป', q: 'You hear this on the train. It means…', o: ['Next station', 'Last station', 'Change trains', 'Doors closing'], a: 0, rom: 'sa-taa-nee dtor bpai', why: 'ต่อไป = next.' },
      { show: 'ป้ายรถเมล์', q: 'This sign shows…', o: ['A bus stop', 'A taxi rank', 'A train platform', 'A boat pier'], a: 0, rom: 'bpaai rot-may', why: 'ป้าย = sign/stop. รถเมล์ = city bus.' }] }
];
