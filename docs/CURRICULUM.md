# KhaoJai curriculum — v0.5 "Reading Foundations"

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
Built from `src/data/associations.js` (content prepared by the KhaoJai team). Each group lists an English letter, the Thai letters it helps learners remember, the start and end sounds, and a note on how the real Thai sound differs. The lesson stays hidden until `ASSOC_READY = true` and groups are marked `reviewed`; then it appears before C1 with practice and a test (skill: "Link English letters to Thai letters").

## Audio
The device's Thai voice is used for now. Recorded audio replaces it per item: add files under `audio/` and list them in `src/data/audio.js` (Thai text → file). No lesson changes are needed.

## Phases
| Phase | Status | Content |
|---|---|---|
| **1 · Reading Foundations** | built | 44 consonants, all vowels, combining, end sounds, reading without romanization |
| **2 · Reading Rules** | built | consonant classes, live/dead syllables, five tones & tone marks, tone rules, leading ห & clusters, silent letters ์ |
| 3 · Vocabulary & Meaning | planned | — |
| 4 · Sentences & Grammar | planned | — |
| 5 · Listening, Speaking & Real-life Thai | early preview | Hello / Café / Chat lines from v0.3 (unlocks after Phase 2) |
| Writing track (optional) | built | trace and write all 44 letters, write from sound, spell words — runs alongside Phase 1, not required for Phase 2 |

### Phase 1 order
Consonants and vowels are interleaved so learners start reading early.

| # | Lesson | Tests |
|---|---|---|
| C1 | Consonants ก–ฆ | shapes · names · sounds |
| C2 | Consonants ง–ฌ | shapes · names · sounds |
| V1 | First vowels อา อี อู ออ + first syllables | vowels · combining |
| C3 | Consonants ญ–ฒ | shapes · names · sounds |
| C4 | Consonants ณ–ธ | shapes · names · sounds |
| V2 | Short vowels อะ อิ อุ (short vs long) | vowels · combining |
| X1 | Review 1 (mixed) | everything so far |
| C5 | Consonants น–พ | |
| C6 | Consonants ฟ–ล | |
| V3 | Vowels before the consonant เอ แอ โอ (+ short เอะ แอะ โอะ) | |
| C7 | Consonants ว–ฮ | |
| X2 | Review 2: all 44 consonants | |
| C8 | Look-alike letters | shapes · names |
| C9 | English letters with two Thai letters (K → ก/ค, T → ต/ท, P → ป/พ, J/CH, R/L) and same-sound letters (ส ศ ษ ซ) | similar sounds · sounds |
| V4 | อึ อือ เออ เอาะ (+ short เออะ) | |
| V5 | Vowels with several parts เอีย เอือ อัว | |
| V6 | Special vowels ไอ ใอ เอา อำ ฤ | |
| X3 | Review 3: all vowels | |
| R1 | Read new syllables (made from any consonant + vowel) | combining |
| R2 | End sounds (8 final sounds, ั in closed syllables) | end sounds · reading |
| R3 | Read on your own (romanization hidden) | reading |
| F1–F4 | **Phase checks**: consonants · sounds · vowels · reading | each skill on its own |

Phase 2 unlocks only when every Phase 1 lesson **and** all four phase checks are passed.

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
