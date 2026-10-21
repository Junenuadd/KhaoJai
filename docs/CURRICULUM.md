# KhaoJai Thai Foundation — curriculum and rules

KhaoJai teaches Thai from the very beginning. Learners follow **one ordered path**. Each stage unlocks only after the previous one is passed. Conversation, chat, slang and culture ("Real-life Thai") open only after the foundation is passed.

Content lives in `src/data/letters.js` (alphabet data) and `src/data/curriculum.js` (stages and lessons). Pass marks live in `src/config.js`.

## The path
| Stage | Goal | Lessons |
|---|---|---|
| **1 · Recognize Thai letters** | Recognize all 44 consonants and say their names (กอ ไก่) | L1–L7: the alphabet in 7 groups, in order ก→ฮ · L8 look-alike letters · L9 alphabet order |
| **2 · Learn the sounds** | Connect letters to sounds | S1 no-puff vs. puff (g/k, dt/t, bp/p, j/ch) · S2 same sound, different letters (ส ศ ษ ซ …) · S3 sounds new to English (ง ป ต ร อ) · S4 hear the letter · S5 end sounds · S6 recite ก–ฮ out loud (record & compare) |
| **3 · Read Thai** | Read syllables and words, then work out tones | R1 long vowels · R2 short and special vowels · R3 first words · R4 words with end sounds · R5 consonant classes · R6 the five tones and tone marks · R7 tone rules · R8 silent ห and clusters · R9 reading without romanization |
| **4 · Write Thai** | Write every consonant and spell words | W1 how Thai is written · W2–W5 trace and write all 44 letters by class · W6 write from sound · W7 spell words |
| **5 · Foundation check** | Prove each skill separately | T1 recognition · T2 listening · T3 reading (no romanization) · T4 writing (spelling + handwriting) |
| After the foundation | Real-life Thai | Hello Line, Café Line, Chat Line (from v0.3, kept) |

Tones come in Stage 3, after letters, sounds and vowels, as the requirements ask.

## Every lesson works the same way
1. **Intro** — what you'll learn and how the lesson works
2. **Learn** — one card per letter or vowel: the letter, its name, romanization, the picture word, the start and end sounds with an English comparison and its limits, its class, and audio
3. **Understand** — concept cards with examples (for example, why ส ศ ษ sound the same)
4. **Practice** — choose, listen, match, spell, trace and write
5. **Review** — every wrong answer is explained and comes back at the end of the lesson (up to twice)
6. **Check** — the last part of each lesson is marked "Check"
7. **Result** — the score, the pass mark, the letters to practise, and one next step: "Next lesson" if passed, "Practise again" if not

## Status and unlocking
- Lesson status: **Not started → In progress → Needs more practice / Completed**. Tests show **Passed**.
- The score counts **first-try answers only**. Opening a lesson or clicking through it never completes it.
- Inside a stage, each lesson unlocks when the previous one is completed. The four Stage 5 tests can be taken in any order.
- A stage is passed when all its lessons are completed. The next stage unlocks at that point.
- Locked items always say what to finish first.
- Completed lessons can be replayed at any time.
- Testing helper: Me → Settings → "Unlock everything (testing)".

## Pass marks (`src/config.js`)
- Lesson 80%
- Recognition 85%
- Listening 80%
- Reading 80%
- Writing 75%
- Trace 60% shape match
- Write from memory 50% shape match

The reasons for each number are written in the config file.

## Letter memory
Each letter has a Leitner box (0–5). A right answer moves it up a box and a wrong answer moves it down two. Reviews come back after 0/1/2/4/8/16 days.

The Practice tab collects:
- **Letter review** — the letters that are due
- **Trouble letters** — the letters missed most often

## Honest limits (also shown in the app)
- **Audio** uses the device's Thai text-to-speech voice. Some devices have no Thai voice. Recordings by native speakers are planned.
- **Handwriting check** compares the overall shape (overlap) and gives an approximate score. It does **not** check stroke order or direction. Animated stroke-order demos for each letter are not built yet. The app teaches the general rule instead: start at the head (loop) and write in one stroke where possible.
- **Recite & record**: the recording stays in the browser tab and is never uploaded. There is no automatic pronunciation scoring; the learner compares by ear.
- **Alphabet song or video**: the sing-along reads every letter name with karaoke highlighting. A recorded song or video is not included yet; it must be original or properly licensed.
- **Picture cues** are placeholder emoji until KhaoJai's own illustrations exist.
