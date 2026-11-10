# KhaoJai curriculum — v0.7 "Phases 1–8 complete (draft content)"

**Core idea:** teach learners to *read* Thai first, then meaning, sentences, grammar and real-life communication.
The most important result is not how many lessons a learner finishes, but whether they can recognise Thai characters, combine them, and read Thai **without depending on romanization**.

Content lives in `src/data/letters.js` (consonants, English-letter helpers, vowels) and `src/data/curriculum.js` (phases, lessons, tests). Pass marks live in `src/config.js`.

## The learner journey
1. **Welcome page** → **Sign up / Log in** (email + password with email confirmation, password reset; Google when switched on). An account is required: the notice, the questionnaire, the dashboard and lessons are only shown to signed-in learners.
2. **"Welcome to KhaoJai!" notice** — explains the reading-first approach. It can be reopened from the dashboard and from Me.
3. **Seven onboarding questions** — prior study, letters, reading, listening, main reason, skills wanted, minutes per day. Saved to the account, so returning learners go straight to their dashboard.
4. **Placement check (optional)** — offered only to learners who say they know some Thai. Lessons where every placement question is right are marked *passed (placement)*. A starting-point check, not a proficiency certificate.
5. **Dashboard** → lessons.

## Lesson C0 — English letters → Thai letters
Built from `src/data/associations.js` (content prepared by the KhaoJai team). Each group lists an English letter, the Thai letters it helps learners remember, the start and end sounds, and a note on how the real Thai sound differs. v0.7: a full first draft (21 groups) is switched on (`ASSOC_READY = true`). ฃ and ฅ are shown as old letters and left out of questions. จูน: check and edit the groups freely — the lesson rebuilds itself.

## Audio
The device's Thai voice is used for now. Recorded audio replaces it per item: add files under `audio/` and list them in `src/data/audio.js` (Thai text → file). No lesson changes are needed.

## Phases (v0.7 — 78 lessons, 91 words)
Each phase opens when the previous phase's checkpoint test is passed.

| Phase | Lessons | Content | Data file |
|---|---|---|---|
| **1 · Reading Foundations** | C0, C1–C9, V1–V6, X1–X3, R1–R3 … (26) | 44 consonants, vowels, combining, end sounds, reading without romanization | `letters.js`, `associations.js` |
| **2 · Reading Rules** | F1–F4, G1–G7 (7+) | classes, live/dead syllables, tones & tone marks, leading ห, clusters, ์ | `letters.js` |
| **3 · Vocabulary & Meaning** | T1–T8 + P3 | greetings, numbers, time, food, shopping, travel, family, feelings — word cards, meaning, listening, spelling | `vocab.js` |
| **4 · Sentences & Grammar** | S1–S6 + P4 | word order, ไม่/ไหม, past/future with time words, classifiers, questions, polite particles — build sentences with tiles | `courses.js` (GRAMMAR) |
| **5 · Listening & Speaking** | L1–L6 + P5 | real-life stations (hello, café, market, taxi) + listening/shadowing | `beyond.js`, `vocab.js` |
| **6 · Real Thai & Culture** | K1–K4 + P6 | money & time, wai & politeness, nicknames & pronouns, everyday situations | `beyond.js`, `courses.js` (CULTURE) |
| **7 · Chat & Slang** | H1–H4 + P7 | chat lines, texting (555, นะ, จ้า), casual slang with a register label | `beyond.js`, `courses.js` (CHAT) |
| **8 · Practical Thai** | Z1–Z4 + FINAL | signs, menus, forms, messages — then the **final assessment** (pass 80%) → certificate | `courses.js` (PRACTICAL) |
| Writing track (optional) | W | trace and write all 44 letters | `letters.js` |

Content status: Phases 3–8 are **draft** content written by น้องเบ้บ (marked `status: 'draft'` in each data file). A Thai reviewer should check them before launch and change the status to `reviewed`.

## Certificate
Passing FINAL issues a certificate of completion (name, date, ID) that can be printed or saved as PDF. It says clearly that it is **not** an accredited or official language qualification.

## Word review & spelling
Every word seen in a lesson goes into "My words" (Practice tab): spaced review, listening and spelling games are built automatically from `vocab.js`.

## Interface languages
Menus, sign-in, onboarding and player buttons: English, ไทย, 中文, 日本語, 한국어 (`src/i18n.js`). Lesson explanations are English for now. zh/ja/ko need a native check.

## English-letter helpers
Every consonant has a familiar English letter as a **memory aid** (e.g. K → ก, T → ต and ท, L → ล, S → ส), plus a short tip explaining where the English sound is different. The app always labels these as "a memory aid only — not an exact sound". C9 then teaches where one English letter maps to two Thai letters and how to hear the difference. Technical phonetics (IPA, "puff of air") is introduced only where it explains a real distinction.

## Every lesson works the same way
1. **Learn** — letter or vowel cards: Thai name (ก ไก่), romanization, English helper, picture cue, sound, audio (normal and slow).
2. **Listen / Recognize / Practice** — find the letter, hear and choose, match, read syllables. Practice mistakes come back later in the lesson (up to twice).
3. **Recall** — see a letter, remember its name, then reveal the answer (feeds spaced repetition).
4. **Read** — with romanization shown or hidden; the learner can always toggle it, but reading tests hide it.
5. **Test** — the end-of-lesson assessment. New random questions every attempt. **Only first-try answers in the test count.**
6. **Result** — overall score, pass mark, a bar for each skill tested, and the letters to practise.
7. **Review** — if not passed: *Practise what I missed* (re-teaches only the missed items and asks about them again), then *Retake the test*.
8. **Progress** — the next lesson unlocks only after a pass.

## Passing (`src/config.js`)
- Lesson test: **80%** overall **and at least 60% in each skill** that had 2+ questions — so a learner who knows letter shapes but not their sounds does not pass.
- Reviews: 80%. Phase checks: consonants 85%, sounds 80%, vowels 80%, reading 80%, reading rules 80%.
- Tracing: 60% overlap with the guide letter.
- Free-hand writing: the drawing is compared with **all** letters; it passes only if the target letter is among the 3 closest matches and its match score is at least 80.
The reasons for every number are written in `src/config.js`.

## What the dashboard shows
- Current phase and next lesson, with one **Continue learning** button (it becomes **Review & retake** if the next lesson needs review).
- Counts kept separate: lessons **viewed**, **practice done**, **tests passed**, **skills strong**, **skills to review**.
- **Skills** — Recognize consonant shapes · Know consonant names · Match sounds to letters · Hear similar sounds apart · Recognize vowels · Combine consonant + vowel · Read end sounds · Read without romanization (+ tones, writing when tested). Each shows Strong (85%+) / Developing (60–84%) / Needs review (<60%) / Not tested yet, based on the **most recent test** of each lesson — not on lessons opened.
- A **recommended practice** for the weakest skill, a **Needs review** list with practise/retake buttons, recent test results, and items due for review.
- Lesson statuses: Not started · Viewed · Practice done · Needs review · Passed (or Passed · placement). Locked lessons say what to pass first.

## Practice tab
Review what's due (spaced repetition for letters and vowels: boxes 0–5, reviews after 0/1/2/4/8/16 days), trouble letters, practise any single skill, Thai time & money, and randomized letter flashcards that put missed letters first.

## Honest limits (also shown in the app)
- **Audio** uses the device's Thai text-to-speech voice. Some devices have no Thai voice. Native-speaker recordings are planned.
- **Handwriting** checks are approximate shape comparisons. They do not check stroke order or direction, and the free-hand check has been calibrated on typeset letters, not yet on many real learners. No animated stroke-order demos yet.
- **Recite & record** keeps the recording in the browser tab only (never uploaded or saved to the account). There is no automatic pronunciation score.
- **Alphabet song/video**: the karaoke sing-along uses the device voice; a recorded song or video is not included yet (must be original or licensed).
- **Picture cues** are placeholder emoji until KhaoJai's own illustrations exist.
- The placement check and phase checks are KhaoJai's own checks, not a validated proficiency framework.
