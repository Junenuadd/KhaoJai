// Phase 3 — Vocabulary & Meaning. Everyday words grouped by topic.
// Each word: [Thai, KhaoJai romanization, English meaning]. Romanization never shows tones (listen to the audio).
// Content status: written by น้องเบ้บ (v0.7, 2026-11-07) — needs a check by a Thai reviewer before launch.
// To add a word: add a line to a topic. The lesson, practice, word review and spelling games are built automatically.

export const VOCAB_STATUS = { status: 'draft', updated: '2026-11-07', reviewer: '' };

export const TOPICS = [
  { id: 'T1', title: 'Greetings & politeness', th: 'ทักทาย', icon: '👋',
    tip: 'Add ครับ (krap, a man speaking) or ค่ะ (ka, a woman speaking) to the end of a sentence to make it polite. You will hear it everywhere.',
    words: [
      ['สวัสดี', 'sa-wat-dee', 'hello / goodbye'], ['ขอบคุณ', 'korp-kun', 'thank you'], ['ขอโทษ', 'kor-toht', 'sorry / excuse me'],
      ['ไม่เป็นไร', 'mai bpen rai', 'never mind / it\'s okay'], ['ครับ', 'krap', 'polite ending (man speaking)'], ['ค่ะ', 'ka', 'polite ending (woman speaking)'],
      ['ใช่', 'chai', 'yes / that\'s right'], ['ไม่ใช่', 'mai chai', 'no / that\'s not right'], ['ลาก่อน', 'laa gorn', 'goodbye (for a long time)'],
      ['ยินดีที่ได้รู้จัก', 'yin-dee tee dai roo-jak', 'nice to meet you']],
    phrases: [['สบายดีไหม', 'sa-baai dee mai', 'How are you?'], ['สบายดี', 'sa-baai dee', 'I\'m fine'], ['คุณชื่ออะไร', 'kun chuue a-rai', 'What\'s your name?'], ['ขอบคุณมาก', 'korp-kun maak', 'Thank you very much']] },
  { id: 'T2', title: 'Numbers', th: 'ตัวเลข', icon: '🔢',
    tip: 'Thai numbers are very regular: 11 is สิบเอ็ด (ten-one), 21 is ยี่สิบเอ็ด. 20 is special: ยี่สิบ, not สองสิบ.',
    words: [
      ['หนึ่ง', 'nueng', 'one (1)'], ['สอง', 'sorng', 'two (2)'], ['สาม', 'saam', 'three (3)'], ['สี่', 'see', 'four (4)'], ['ห้า', 'haa', 'five (5)'],
      ['หก', 'hok', 'six (6)'], ['เจ็ด', 'jet', 'seven (7)'], ['แปด', 'bpaet', 'eight (8)'], ['เก้า', 'gao', 'nine (9)'], ['สิบ', 'sip', 'ten (10)'],
      ['ยี่สิบ', 'yee-sip', 'twenty (20)'], ['ร้อย', 'roi', 'hundred'], ['พัน', 'pan', 'thousand']],
    phrases: [['สิบเอ็ด', 'sip-et', 'eleven (11)'], ['ยี่สิบห้า', 'yee-sip-haa', 'twenty-five (25)'], ['หนึ่งร้อย', 'nueng roi', 'one hundred'], ['สองพัน', 'sorng pan', 'two thousand']] },
  { id: 'T3', title: 'Time & days', th: 'เวลาและวัน', icon: '🕐',
    tip: 'Thai verbs never change for past or future. Time words like วันนี้ (today) or เมื่อวาน (yesterday) do that job.',
    words: [
      ['วันนี้', 'wan-nee', 'today'], ['พรุ่งนี้', 'prung-nee', 'tomorrow'], ['เมื่อวาน', 'muea-waan', 'yesterday'], ['ตอนเช้า', 'dtorn chao', 'in the morning'],
      ['ตอนเย็น', 'dtorn yen', 'in the evening'], ['กลางคืน', 'glaang kuuen', 'night'], ['วันจันทร์', 'wan jan', 'Monday'], ['วันศุกร์', 'wan suk', 'Friday'],
      ['ชั่วโมง', 'chua-mohng', 'hour'], ['นาที', 'naa-tee', 'minute'], ['เดี๋ยวนี้', 'diao-nee', 'right now']],
    phrases: [['กี่โมงแล้ว', 'gee mohng laeo', 'What time is it?'], ['เจอกันพรุ่งนี้', 'jer gan prung-nee', 'See you tomorrow'], ['วันนี้วันอะไร', 'wan-nee wan a-rai', 'What day is it today?']] },
  { id: 'T4', title: 'Food & drink', th: 'อาหารและเครื่องดื่ม', icon: '🍜',
    tip: 'Thai food is often spicy and drinks are often sweet. ไม่เผ็ด (not spicy) and หวานน้อย (less sweet) are two of the most useful things you can say.',
    words: [
      ['ข้าว', 'kaao', 'rice / a meal'], ['น้ำ', 'naam', 'water'], ['กิน', 'gin', 'to eat'], ['ดื่ม', 'duuem', 'to drink'], ['อร่อย', 'a-roi', 'delicious'],
      ['เผ็ด', 'pet', 'spicy'], ['หวาน', 'waan', 'sweet'], ['ไก่', 'gai', 'chicken'], ['หมู', 'moo', 'pork'], ['ผัก', 'pak', 'vegetables'],
      ['กาแฟ', 'gaa-fae', 'coffee'], ['ชา', 'chaa', 'tea']],
    phrases: [['ไม่เผ็ด', 'mai pet', 'not spicy'], ['อร่อยมาก', 'a-roi maak', 'very delicious'], ['ขอน้ำเปล่า', 'kor naam bplao', 'Plain water, please'], ['เช็คบิลด้วย', 'chek bin duay', 'The bill, please']] },
  { id: 'T5', title: 'Shopping & money', th: 'ซื้อของ', icon: '🛍️',
    tip: 'ถูก has two meanings: "cheap" and "correct". The context tells you which one.',
    words: [
      ['ซื้อ', 'suue', 'to buy'], ['ขาย', 'kaai', 'to sell'], ['เท่าไหร่', 'tao-rai', 'how much'], ['บาท', 'baat', 'baht (Thai money)'],
      ['แพง', 'paeng', 'expensive'], ['ถูก', 'tuuk', 'cheap / correct'], ['ลด', 'lot', 'to reduce (a discount)'], ['เงิน', 'ngern', 'money / silver'],
      ['ร้าน', 'raan', 'shop'], ['ตลาด', 'dta-laat', 'market']],
    phrases: [['อันนี้เท่าไหร่', 'an nee tao-rai', 'How much is this?'], ['ลดได้ไหม', 'lot dai mai', 'Can you give a discount?'], ['เอาอันนี้', 'ao an nee', 'I\'ll take this one'], ['แพงไป', 'paeng bpai', 'Too expensive']] },
  { id: 'T6', title: 'Travel & directions', th: 'เดินทาง', icon: '🚉',
    tip: 'ใกล้ (near) and ไกล (far) look and sound alike — only the tone is different. Listen carefully!',
    words: [
      ['ไป', 'bpai', 'to go'], ['มา', 'maa', 'to come'], ['ที่ไหน', 'tee-nai', 'where'], ['ซ้าย', 'saai', 'left'], ['ขวา', 'kwaa', 'right'],
      ['ตรงไป', 'dtrong bpai', 'go straight'], ['ใกล้', 'glai', 'near'], ['ไกล', 'glai', 'far'], ['สถานี', 'sa-taa-nee', 'station'],
      ['รถไฟ', 'rot fai', 'train'], ['สนามบิน', 'sa-naam bin', 'airport'], ['โรงแรม', 'rohng-raem', 'hotel'], ['ห้องน้ำ', 'horng-naam', 'bathroom / toilet']],
    phrases: [['ห้องน้ำอยู่ที่ไหน', 'horng-naam yoo tee-nai', 'Where is the bathroom?'], ['ไปสนามบิน', 'bpai sa-naam bin', 'To the airport, please'], ['จอดตรงนี้', 'jort dtrong nee', 'Stop here, please']] },
  { id: 'T7', title: 'People & family', th: 'คนและครอบครัว', icon: '👨‍👩‍👧',
    tip: 'Thai has no single word for "brother" or "sister". พี่ is any older sibling, น้อง any younger one — and both are used with friends and strangers too.',
    words: [
      ['พ่อ', 'por', 'father'], ['แม่', 'mae', 'mother'], ['พี่', 'pee', 'older brother / sister'], ['น้อง', 'norng', 'younger brother / sister'],
      ['เพื่อน', 'puean', 'friend'], ['แฟน', 'faen', 'boyfriend / girlfriend / partner'], ['ครู', 'kroo', 'teacher'], ['คน', 'kon', 'person'],
      ['เด็ก', 'dek', 'child'], ['ลูก', 'luuk', 'son / daughter (one\'s own child)']],
    phrases: [['นี่คือเพื่อนฉัน', 'nee kuue puean chan', 'This is my friend'], ['มีพี่น้องไหม', 'mee pee-norng mai', 'Do you have brothers or sisters?']] },
  { id: 'T8', title: 'Feelings & describing', th: 'ความรู้สึก', icon: '😊',
    tip: 'Describing words come AFTER the thing: บ้านใหญ่ = "house big" = a big house. To say "very", add มาก after it.',
    words: [
      ['ดี', 'dee', 'good'], ['สวย', 'suay', 'beautiful'], ['หล่อ', 'lor', 'handsome'], ['ใหญ่', 'yai', 'big'], ['เล็ก', 'lek', 'small'],
      ['ร้อน', 'rorn', 'hot'], ['หนาว', 'naao', 'cold (weather)'], ['ดีใจ', 'dee-jai', 'glad / happy'], ['เหนื่อย', 'nueay', 'tired'],
      ['หิว', 'hiw', 'hungry'], ['ชอบ', 'chorp', 'to like'], ['รัก', 'rak', 'to love']],
    phrases: [['ร้อนมาก', 'rorn maak', 'very hot'], ['หิวข้าว', 'hiw kaao', 'hungry (for a meal)'], ['ดีใจที่ได้เจอ', 'dee-jai tee dai jer', 'Glad to see you']] }
];
