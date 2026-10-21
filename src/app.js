// KhaoJai — app shell, routing and screens. Guest mode: no sign-up, progress stays on this device.
// The Learn tab is ONE ordered path: Stage 1 letters → 2 sounds → 3 reading → 4 writing → 5 foundation check.
import { S, save, resetAll, todayPoints, DAILY_GOAL, lessonState, recordResult, markStarted, dueLetters, troubleLetters, knownLetters } from './store.js';
import { STAGES, ALL_LESSONS, LESSON, passMark, reviewDrill } from './data/curriculum.js';
import { LETTERS, L, SOUNDS, CLASS_INFO, SAME_SOUND } from './data/letters.js';
import { LINES, ORDER as LIFE_ORDER, STATIONS, TIME_DRILL, WORDS } from './data/beyond.js';
import { DICT, DECODE_EXAMPLES, decode } from './data/decoder.js';
import { ic, jai, esc, toast, say } from './ui.js';
import { P, startLesson, renderPlayer, playerAction, playerKey, mountPlayer } from './player.js';
import { PLANS, checkoutSheet, wireCheckout, stopQr } from './checkout.js';
import { mountPad, shapeScore } from './draw.js';
import { PASS } from './config.js';

const ROUTES = ['map', 'letters', 'practice', 'decoder', 'me', 'homework', 'plans', 'play'];
const NAV = [['map', 'Learn', 'map'], ['letters', 'ก–ฮ', 'abc'], ['practice', 'Practice', 'practice'], ['decoder', 'Decoder', 'decoder'], ['me', 'Me', 'me']];
let route = 'map', billing = 'monthly', dText = DECODE_EXAMPLES[0];
let openStage = null, lettersTab = 'chart', studio = { c: 'ก', guide: true, strokes: [], score: null };
let fc = { i: 0, flip: false };

/* ---------- progress logic ---------- */
const stageDone = st => st.lessons.every(l => lessonState(l.id) === 'completed');
const stageOpen = st => S.unlockAll || st.n === 1 || stageDone(STAGES[st.n - 2]);
const foundationPassed = () => stageDone(STAGES[4]);
function lessonOpen(st, idx) {
  const l = st.lessons[idx];
  if (S.unlockAll || lessonState(l.id) !== 'not_started') return true;
  if (!stageOpen(st)) return false;
  if (st.n === 5) return true; // the four tests can be taken in any order once Stage 5 is open
  return idx === 0 || lessonState(st.lessons[idx - 1].id) === 'completed';
}
function lockReason(st, idx) {
  if (!stageOpen(st)) return `Pass Stage ${st.n - 1} (${STAGES[st.n - 2].title}) to unlock`;
  return `Complete "${st.lessons[idx - 1].title}" first`;
}
function nextLesson() {
  for (const st of STAGES) for (let i = 0; i < st.lessons.length; i++) {
    if (lessonState(st.lessons[i].id) !== 'completed' && lessonOpen(st, i)) return { st, l: st.lessons[i], i };
  }
  return null;
}
const currentStage = () => STAGES.find(st => !stageDone(st)) || STAGES[4];
const after = id => { const i = ALL_LESSONS.findIndex(l => l.id === id); return ALL_LESSONS[i + 1]; };

const STATUS = {
  not_started: ['Not started', ''], in_progress: ['In progress', 'info'], needs_practice: ['Needs more practice', 'warn'], completed: ['Completed', 'ok']
};
const statusPill = (id, test) => { const s = lessonState(id); const best = S.lessons[id]?.best; const [t, c] = STATUS[s]; return `<span class="pill ${c}">${s === 'completed' && test ? 'Passed' : t}${best && s !== 'not_started' ? ` · ${best}%` : ''}</span>`; };

/* ---------- routing ---------- */
function go(r, sub) {
  if (!ROUTES.includes(r) || (r === 'play' && !P)) r = 'map';
  route = r; if (sub) lettersTab = sub;
  if (r !== 'play') { try { history.replaceState(null, '', '#' + r); } catch (e) {} }
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ROUTES.includes(h) && h !== route && h !== 'play') { closeSheet(); stopSing(); route = h; render(); } });

function nav() {
  const cur = ['homework', 'plans'].includes(route) ? 'me' : route;
  document.getElementById('sidenav').innerHTML = NAV.map(([r, l, i]) => `<button class="sidelink" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${icon(i)}<span>${r === 'letters' ? 'Letters ก–ฮ' : l}</span></button>`).join('')
    + `<button class="sidelink" data-go="homework" ${route === 'homework' ? 'aria-current="page"' : ''}>${ic('homework')}<span>Homework</span></button>`
    + `<button class="sidelink" data-go="plans" ${route === 'plans' ? 'aria-current="page"' : ''}>${ic('star')}<span>Plus</span></button>`;
  document.getElementById('tabbar').innerHTML = NAV.map(([r, l, i]) => `<button class="tab" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${icon(i)}<span>${l}</span></button>`).join('');
}
const icon = n => n === 'abc' ? '<span class="abc" aria-hidden="true">กข</span>' : ic(n);

function topbar() {
  return `<header class="topbar">
    <a class="logo" href="#map" data-go="map">${jai(36)}<span>Khao<b>Jai</b></span></a>
    <div class="row nowrap">
      <span class="chip sun" title="Days in a row">${ic('sun')} ${S.streak}</span>
      <span class="chip lav" title="Letters you know well">${icon('abc')} ${knownLetters()}/44</span>
    </div></header>`;
}

/* ---------- Learn: the path ---------- */
function vMap() {
  const nx = nextLesson(), cs = currentStage();
  const done = cs.lessons.filter(l => lessonState(l.id) === 'completed').length;
  const fresh = !Object.keys(S.lessons).length;
  if (openStage === null) openStage = cs.n;
  const needs = ALL_LESSONS.filter(l => lessonState(l.id) === 'needs_practice');
  return `${topbar()}
  <section class="card hero c-lav-l">
    <div class="stack" style="gap:8px;min-width:0;flex:1">
      <p class="eyebrow">${fresh ? 'New to Thai? Start here' : `Stage ${cs.n} of 5 · ${cs.title}`}</p>
      <h1>${fresh ? 'Learn to read and write Thai — from ก' : esc(cs.title)}</h1>
      <p class="muted">${fresh ? 'One step at a time: letters → sounds → reading → writing → a check of each skill. No account needed.' : `After this stage you can: ${cs.can}.`}</p>
      ${!fresh ? `<div class="bar thick" role="progressbar" aria-label="Stage progress" aria-valuenow="${done}" aria-valuemin="0" aria-valuemax="${cs.lessons.length}"><i style="width:${done / cs.lessons.length * 100}%"></i></div><p class="small"><b>${done} of ${cs.lessons.length}</b> lessons done in this stage · ${cs.lessons.length - done} to go</p>` : ''}
      ${nx ? `<button class="btn big" data-lesson="${nx.l.id}" style="align-self:flex-start">${ic('play')} ${fresh ? 'Start learning' : lessonState(nx.l.id) === 'needs_practice' ? 'Practise again' : lessonState(nx.l.id) === 'in_progress' ? 'Continue' : 'Next lesson'}: ${esc(nx.l.title)}</button>
        <p class="small muted">Up next: Stage ${nx.st.n} · ${esc(nx.l.title)} <span class="th" lang="th">${nx.l.th}</span></p>` : '<p><b>Foundation complete! 🎉 Real-life Thai is open below.</b></p>'}
    </div>${jai(100, 'happy', '#C9B6FF', 'bob hide-xs')}
  </section>
  ${needs.length ? `<section class="card c-peach-l row between"><div><b>Needs more practice:</b> ${needs.map(l => esc(l.title)).join(', ')}</div><button class="btn soft" data-lesson="${needs[0].id}">Practise</button></section>` : ''}
  <div class="map-layout"><div class="stack gap-l">
    ${STAGES.map(st => {
      const open = stageOpen(st), passed = stageDone(st), expanded = openStage === st.n;
      const n = st.lessons.filter(l => lessonState(l.id) === 'completed').length;
      return `<section class="stage s-${st.color} ${open ? '' : 'locked'}">
        <button class="stage-head" data-stage="${st.n}" aria-expanded="${expanded}">
          <span class="stage-no">${passed ? ic('check') : open ? st.n : ic('lock')}</span>
          <span class="stage-txt"><span class="small th" lang="th">${st.th}</span><b>Stage ${st.n} · ${st.title}</b><small>${passed ? 'Passed ✓' : open ? `${n} of ${st.lessons.length} done` : `Locked — pass Stage ${st.n - 1} to unlock`}</small></span>
          ${ic('chev')}
        </button>
        ${expanded ? `<div class="stage-body"><p class="small">You will be able to: <b>${st.can}</b>.</p>
          ${st.n === 5 ? `<p class="small muted">Each skill is tested on its own. Pass marks: recognition ${PASS.recognition}%, listening ${PASS.listening}%, reading ${PASS.reading}%, writing ${PASS.writing}%. You can retry any test.</p>` : ''}
          <ol class="lessons">${st.lessons.map((l, i) => { const ok = lessonOpen(st, i); return `<li><button class="lesson-row ${lessonState(l.id)} ${ok ? '' : 'locked'}" data-lesson="${l.id}">
            <span class="st">${lessonState(l.id) === 'completed' ? ic('check') : ok ? i + 1 : ic('lock')}</span>
            <span class="grow"><b>${esc(l.title)}</b><br><span class="small th" lang="th">${l.th}</span>${ok ? '' : `<br><span class="small muted">${lockReason(st, i)}</span>`}</span>
            ${ok ? statusPill(l.id, l.test) : ''}</button></li>`; }).join('')}</ol></div>` : ''}
      </section>`; }).join('')}
    <section class="stage s-pink ${foundationPassed() || S.unlockAll ? '' : 'locked'}">
      <button class="stage-head" data-stage="6" aria-expanded="${openStage === 6}"><span class="stage-no">${foundationPassed() || S.unlockAll ? '6' : ic('lock')}</span>
        <span class="stage-txt"><span class="small th" lang="th">ใช้ภาษาไทยจริง</span><b>After the foundation · Real-life Thai</b><small>${foundationPassed() || S.unlockAll ? 'Conversations, chat and culture' : 'Locked — pass all four foundation tests (Stage 5) to unlock'}</small></span>${ic('chev')}</button>
      ${openStage === 6 ? `<div class="stage-body">${(foundationPassed() || S.unlockAll) ? LINES.map(line => `<p class="small"><b>${line.en}</b> <span class="th" lang="th">${line.th}</span></p><ol class="lessons">${line.stations.map(id => `<li><button class="lesson-row ${S.done[id] ? 'completed' : ''}" data-life="${id}"><span class="st">${S.done[id] ? ic('check') : ic('play')}</span><span class="grow"><b>${esc(STATIONS[id].en)}</b><br><span class="small th" lang="th">${STATIONS[id].th}</span></span></button></li>`).join('')}</ol>`).join('') : '<p class="small">Vocabulary, everyday conversation, Thai chat and slang, feelings and culture come after you can read and write the basics.</p>'}</div>` : ''}
    </section>
  </div>${sidePanel()}</div>`;
}
function sidePanel() {
  const due = dueLetters().length;
  return `<aside class="panel stack">
    <div class="card c-lemon-l row nowrap">${goalRing()}<div><p class="eyebrow">Today</p><p class="big-num">${todayPoints()} / ${DAILY_GOAL}</p><p class="small muted">points</p></div></div>
    <div class="card c-sky-l stack"><h3>Letter review</h3><p class="small">${due ? `${due} letter${due > 1 ? 's' : ''} ready to review.` : 'Nothing due — letters come back here when it\'s time to review them.'}</p>${due ? '<button class="btn" data-review="due">Review now</button>' : ''}</div>
    <div class="card c-mint-l stack"><h3>Tools</h3><button class="btn line" data-go="letters" data-sub="chart">Alphabet chart ก–ฮ</button><button class="btn line" data-go="letters" data-sub="sing">Sing-along ก–ฮ</button><button class="btn line" data-go="decoder">Thai Decoder</button></div>
  </aside>`;
}
function goalRing(size = 60) {
  const v = Math.min(1, todayPoints() / DAILY_GOAL), c = 2 * Math.PI * 15;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 36 36" role="img" aria-label="Daily goal"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-l)" stroke-width="5"/>${v > 0 ? `<circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-d)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(v * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 18 18)"/>` : ''}</svg>`;
}

function openLesson(id) {
  const l = LESSON[id], st = STAGES[l.stage - 1], idx = st.lessons.findIndex(x => x.id === id);
  if (!lessonOpen(st, idx)) return toast(lockReason(st, idx) + '.');
  if (l.kind === 'recite') { markStarted(id); return go('letters', 'recite'); }
  const nxt = after(id);
  startLesson({ id, title: l.title, sub: `Stage ${st.n} · ${st.title}`, steps: l.build(), color: st.color, pass: passMark(l), test: !!l.test, nextTitle: nxt && !nxt.kind ? nxt.title : nxt ? nxt.title : null, hideRom: false }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function afterLesson(r) {
  if (r.to === 'retry' && r.id) return openLesson(r.id);
  if (r.to === 'next' && r.id) { const n = after(r.id); if (n) { openStage = n.stage; return openLesson(n.id); } }
  if (r.id && LESSON[r.id]) openStage = LESSON[r.id].stage;
  go('map');
}
function openLife(id) {
  const st = STATIONS[id], line = LINES.find(l => l.stations.includes(id));
  startLesson({ id: null, title: st.en, steps: st.ex, color: line.color, pass: PASS.lesson, words: st.words }, r => { if (r.passed) { S.done[id] = { best: 100 }; save(); } openStage = 6; go('map'); });
  route = 'play'; render();
}
function startDrill(kind, letters) {
  let steps = [], title = '', color = 'sky';
  if (kind === 'time') { steps = TIME_DRILL; title = 'Thai time & money'; color = 'mint'; }
  if (kind === 'letters') { steps = reviewDrill(letters); title = 'Letter review'; }
  if (!steps.length) return toast('Nothing to review yet — finish a Stage 1 lesson first.');
  startLesson({ id: null, title, steps, color, pass: PASS.lesson }, () => go('practice'));
  route = 'play'; render();
}

/* ---------- Letters ก–ฮ hub ---------- */
const GROUPS4 = [0, 11, 22, 33].map(s => LETTERS.slice(s, s + 11).map(x => x.c));
function vLetters() {
  const tabs = [['chart', 'Chart'], ['sing', 'Sing-along'], ['recite', 'Recite & record'], ['write', 'Writing practice']];
  return `${topbar()}<div class="pagehead"><h1>Letters ก–ฮ</h1><p class="muted">All 44 consonants with their names, sounds and pictures. Use these tools any time — they don't change your path.</p></div>
  <div class="seg wide" role="tablist">${tabs.map(([k, t]) => `<button role="tab" data-ltab="${k}" aria-pressed="${lettersTab === k}">${t}</button>`).join('')}</div>
  ${({ chart: vChart, sing: vSing, recite: vRecite, write: vStudio })[lettersTab]()}`;
}
function vChart() {
  return `<div class="row"><span class="pill cls-mid">Mid class · 9</span><span class="pill cls-high">High class · 11</span><span class="pill cls-low">Low class · 24</span><button class="linkbtn" data-sheet="romguide">How to read the romanization</button></div>
  <div class="chart">${LETTERS.map(x => `<button class="ltile cls-${x.cls} ${x.old ? 'old' : ''}" data-letter="${x.c}"><span class="th" lang="th">${x.c}</span><small lang="th">${x.word}</small>${S.rom ? `<small class="rom">${x.rom}</small>` : ''}</button>`).join('')}</div>
  <p class="small muted">Faded tiles (ฃ ฅ) are no longer used but are still part of the alphabet. Picture cues are placeholder emoji until KhaoJai's own illustrations are ready.</p>`;
}

// Sing-along: reads every letter name in order with on-screen karaoke highlighting.
let sing = { on: false, i: 0, rate: 0.85, timer: null };
function stopSing() { sing.on = false; clearTimeout(sing.timer); try { speechSynthesis.cancel(); } catch (e) {} }
function singStep() {
  if (!sing.on || route !== 'letters' || lettersTab !== 'sing') return stopSing();
  paintSing();
  const x = LETTERS[sing.i];
  let moved = false; const advance = () => { if (moved || !sing.on) return; moved = true; sing.i++; if (sing.i >= LETTERS.length) { sing.i = 0; sing.on = false; paintSing(); toast('ก to ฮ — done! Play again or tap any letter.'); return; } sing.timer = setTimeout(singStep, 350 / sing.rate); };
  try {
    if (!S.sound) throw 0;
    const u = new SpeechSynthesisUtterance(`${x.say} ${x.word}`); u.lang = 'th-TH'; u.rate = sing.rate;
    const v = speechSynthesis.getVoices().find(v => /^th/i.test(v.lang)); if (v) u.voice = v;
    u.onend = advance; speechSynthesis.cancel(); speechSynthesis.speak(u);
    sing.timer = setTimeout(advance, 2600 / sing.rate);
  } catch (e) { sing.timer = setTimeout(advance, 1500 / sing.rate); }
}
function paintSing() {
  const x = LETTERS[sing.i];
  const box = document.getElementById('singNow'); if (!box) return;
  box.innerHTML = `<span class="bigchar cls-${x.cls}" lang="th">${x.c}</span><div class="stack" style="gap:2px"><p class="th lname" lang="th">${x.say} ${x.word}</p><p class="rom always">${x.rom}</p><p>${x.pic} ${x.en}</p></div>`;
  document.querySelectorAll('.kara').forEach((el, i) => el.classList.toggle('now', i === sing.i));
  document.querySelector('.kara.now')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  const pb = document.getElementById('singPlay'); if (pb) pb.innerHTML = sing.on ? `${ic('pause')} Pause` : `${ic('play')} Play`;
}
function vSing() {
  return `<section class="card c-lav-l stack">
    <div id="singNow" class="singnow"></div>
    <div class="row"><button class="btn" id="singPlay">${ic('play')} Play</button><button class="btn line" id="singPrev" aria-label="Previous letter">⏮</button><button class="btn line" id="singNext" aria-label="Next letter">⏭</button>
      <label class="row small" for="singRate" style="gap:6px">Speed <select id="singRate" class="input auto"><option value="0.6">Slow</option><option value="0.85" selected>Normal</option><option value="1">Fast</option></select></label></div>
    <div class="karaoke">${LETTERS.map((x, i) => `<button class="kara ${i === sing.i ? 'now' : ''}" data-kara="${i}"><span class="th" lang="th">${x.c}</span><span class="th small" lang="th">${x.say} ${x.word}</span><span class="rom">${x.rom}</span></button>`).join('')}</div>
  </section>
  <p class="small muted">This sing-along reads each letter name aloud with your device's Thai voice and highlights it as it goes. A recorded alphabet song or video (original or properly licensed) will be added here — it is not included yet.</p>`;
}

// Recite & record: listen, record yourself, compare. Recordings stay in this tab only.
let rec = { g: 0, media: null, chunks: [], url: null, recording: false, consent: false };
function vRecite() {
  const g = GROUPS4[rec.g], info = S.recite.groups[rec.g] || { attempts: 0 };
  const lessonNote = lessonState('S6') !== 'completed' ? `<p class="small"><b>Lesson S6:</b> recite all four groups (record yourself, or say them out loud and tick "I recited it") to complete this lesson. Done: ${GROUPS4.filter((_, i) => S.recite.groups[i]?.attempts).length} / 4.</p>` : '<p class="small"><span class="pill ok">Lesson S6 completed</span></p>';
  return `<section class="card c-sky-l stack">${lessonNote}
    <div class="seg" role="group" aria-label="Letter group">${GROUPS4.map((gr, i) => `<button data-rgroup="${i}" aria-pressed="${rec.g === i}">${gr[0]}–${gr[gr.length - 1]}${S.recite.groups[i]?.attempts ? ' ✓' : ''}</button>`).join('')}</div>
    <div class="recgroup">${g.map(c => `<button class="rchip ${S.recite.weak.includes(c) ? 'weak' : ''}" data-weak="${c}" title="Tap to mark for more practice"><span class="th" lang="th">${c}</span><small lang="th">${L[c].say} ${L[c].word}</small>${S.rom ? `<small class="rom">${L[c].rom}</small>` : ''}</button>`).join('')}</div>
    <ol class="steps"><li>Listen to the reference.</li><li>Record yourself saying the names in order.</li><li>Play both and compare. Tap any letter you found hard to mark it for practice.</li></ol>
    <div class="row"><button class="btn line" id="recRef">${ic('sound')} 1 · Listen</button>
      ${rec.recording ? `<button class="btn warm" id="recStop">■ Stop recording</button>` : `<button class="btn" id="recStart">${ic('mic')} 2 · Record</button>`}
      ${rec.url ? `<button class="btn line" id="recCompare">${ic('play')} 3 · Reference, then me</button>` : ''}</div>
    ${rec.url ? `<audio controls src="${rec.url}" id="recAudio"></audio><div class="row"><button class="btn line" id="recDelete">${ic('trash')} Delete my recording</button></div>` : ''}
    <div class="row"><button class="btn soft" id="recDone">I recited this group ✓</button><span class="small muted">Attempts: ${info.attempts || 0}${info.last ? ` · last ${new Date(info.last).toLocaleDateString('en-GB')}` : ''}</span></div>
  </section>
  <p class="small muted">${ic('shield')} Privacy: the microphone is only used while you press Record. Your recording stays in this browser tab and is deleted when you tap Delete or leave this page — nothing is uploaded. Automatic pronunciation scoring is not available yet; comparing by ear is the honest check for now.</p>`;
}
function playSeq(letters, done) {
  let i = 0;
  const nextOne = () => {
    if (i >= letters.length) return done?.();
    const c = letters[i++];
    document.querySelectorAll('.rchip').forEach(el => el.classList.toggle('now', el.dataset.weak === c));
    try { const u = new SpeechSynthesisUtterance(`${L[c].say} ${L[c].word}`); u.lang = 'th-TH'; u.rate = .85; const v = speechSynthesis.getVoices().find(v => /^th/i.test(v.lang)); if (v) u.voice = v; let fired = false; const n = () => { if (!fired) { fired = true; setTimeout(nextOne, 250); } }; u.onend = n; setTimeout(n, 2600); speechSynthesis.speak(u); }
    catch (e) { setTimeout(nextOne, 1200); }
  };
  try { speechSynthesis.cancel(); } catch (e) {}
  nextOne();
}
async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return toast('Recording isn\'t available in this browser. Say the letters out loud and tap "I recited this group".');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    rec.chunks = []; rec.media = new MediaRecorder(stream);
    rec.media.ondataavailable = e => rec.chunks.push(e.data);
    rec.media.onstop = () => { stream.getTracks().forEach(t => t.stop()); if (rec.url) URL.revokeObjectURL(rec.url); rec.url = URL.createObjectURL(new Blob(rec.chunks, { type: rec.media.mimeType })); rec.recording = false; logRecite(true); render(); };
    rec.media.start(); rec.recording = true; render();
  } catch (e) { toast('The microphone wasn\'t allowed, so nothing was recorded. You can still recite out loud.'); }
}
function logRecite(recorded) {
  const gi = S.recite.groups[rec.g] || (S.recite.groups[rec.g] = { attempts: 0 });
  gi.attempts++; gi.last = Date.now(); if (recorded) gi.recorded = true;
  if (GROUPS4.every((_, i) => S.recite.groups[i]?.attempts) && lessonState('S6') !== 'completed') { recordResult('S6', 100, 0, []); toast('Lesson S6 complete — you recited the whole alphabet!'); }
  save();
}

// Writing practice studio: any letter, trace or from memory, with the approximate shape check.
function vStudio() {
  const x = L[studio.c];
  return `<section class="card c-peach-l stack">
    <div class="row between"><div class="row"><span class="th" style="font-size:30px" lang="th">${studio.c}</span><b class="th" lang="th">${x.say} ${x.word}</b><span class="rom always">${x.rom}</span><button class="iconbtn" data-say="${x.say} ${x.word}" aria-label="Listen">${ic('sound')}</button></div>
      <div class="seg"><button data-sguide="1" aria-pressed="${studio.guide}">Trace</button><button data-sguide="0" aria-pressed="${!studio.guide}">From memory</button></div></div>
    <div class="padwrap"><canvas id="studioPad" class="pad" aria-label="Writing area"></canvas></div>
    <div class="row center"><button class="btn line" id="sClear">Clear</button><button class="btn" id="sCheck">Check shape</button></div>
    ${studio.score !== null ? `<p class="center"><b>Shape match: ${studio.score}%</b> ${studio.score >= (studio.guide ? PASS.trace : PASS.write) ? '— nice!' : '— try again, keep the loops round and the size even.'}<br><span class="small muted">Approximate check: compares shapes only, not stroke order.</span></p>` : '<p class="small muted center">Start at the head (the small loop) and write in one stroke where you can.</p>'}
  </section>
  <div class="chart small">${LETTERS.map(l => `<button class="ltile cls-${l.cls} ${l.c === studio.c ? 'sel' : ''}" data-studio="${l.c}"><span class="th" lang="th">${l.c}</span></button>`).join('')}</div>`;
}

/* ---------- Practice ---------- */
function vPractice() {
  const due = dueLetters(), trouble = troubleLetters(), learned = Object.keys(S.cards);
  const words = learned.length ? learned : LETTERS.slice(0, 6).map(x => x.c);
  const c = words[fc.i % words.length], x = L[c];
  return `${topbar()}<div class="pagehead"><h1>Practice</h1><p class="muted">Short reviews of what you've learned. Letters you miss come back sooner.</p></div>
  <div class="grid g3">
    <button class="card drill c-sky-l" data-review="due"><span class="clockface th" lang="th">ก ข ค</span><h3>Letter review</h3><p class="small">${due.length ? `${due.length} letters are due today` : 'Nothing due — try "Trouble letters"'}</p></button>
    <button class="card drill c-pink-l" data-review="trouble"><span class="clockface th" lang="th">${trouble.slice(0, 3).join(' ') || '—'}</span><h3>Trouble letters</h3><p class="small">${trouble.length ? 'The letters you miss most' : 'None yet — great!'}</p></button>
    <button class="card drill c-mint-l" data-drill="time"><span class="clockface">19:00</span><h3>Thai time & money</h3><p class="small">หนึ่งทุ่ม, บ่ายโมง, baht & satang</p></button>
  </div>
  <section class="card stack c-lav-l">
    <div class="row between"><h2>Letter cards</h2><span class="pill">${fc.i % words.length + 1} / ${words.length}${learned.length ? '' : ' · starter set'}</span></div>
    <button class="flash ${fc.flip ? 'flipped' : ''}" id="flash" aria-label="Flip card"><span class="flash-in">
      <span class="face"><span class="th big" lang="th">${c}</span><span class="small muted">What is this letter called? Tap to check.</span></span>
      <span class="face back"><span class="th" lang="th" style="font-size:24px">${x.say} ${x.word}</span><span class="rom">${x.rom}</span><b>${x.pic} ${x.en}</b></span></span></button>
    <div class="row nowrap"><button class="btn line" data-say="${x.say} ${x.word}" aria-label="Listen">${ic('sound')}</button>
      <button class="btn line grow" data-rate="again">Again</button><button class="btn line grow" data-rate="good">Good</button><button class="btn grow" data-rate="easy">Easy</button></div>
  </section>`;
}

/* ---------- Decoder ---------- */
function vDecoder() {
  const segs = decode(dText), cols = ['lav', 'sky', 'mint', 'peach', 'pink', 'lemon'];
  return `${topbar()}<div class="pagehead"><h1>Thai Decoder</h1><p class="muted">Paste a word or a chat message. We explain it and never silently "fix" your text.</p></div>
  <section class="card c-pink-l stack">
    <label for="dIn" class="lbl">What does this mean?</label>
    <textarea id="dIn" class="input th decode-in" lang="th">${esc(dText)}</textarea>
    <div class="chips">${DECODE_EXAMPLES.map(x => `<button class="chip th" lang="th" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="dGo">${ic('sparkle')} Decode</button></div>
  </section>
  <div class="grid g2">${segs.map((seg, k) => {
    if (seg.laugh) return `<article class="card c-lemon-l dseg"><div class="row"><span class="src">${seg.src}</span><span class="pill">Chat laughter</span></div><p>"5" is pronounced <b>hâa</b> in Thai, so 555 sounds like "ha ha ha". ${seg.src.length >= 6 ? 'A long string usually means a bigger laugh, but it can also be sarcastic.' : 'A short 555 can be a real laugh or a polite one.'}</p><span class="pill warn">Confidence: depends on context</span></article>`;
    if (seg.unknown) return `<article class="card dseg"><div class="row"><span class="src th" lang="th">${esc(seg.src)}</span><span class="pill warn">Not in the sample list</span></div><p class="small muted">This early version knows about 25 words. The full app explains anything and says how sure it is.</p></article>`;
    const d = DICT[seg.key];
    return `<article class="card c-${cols[k % cols.length]}-l dseg"><div class="row"><span class="src th" lang="th">${esc(seg.src)}</span><span class="pill ${/shorthand|Casual/.test(d.reg) ? 'info' : 'ok'}">${d.reg}</span>${seg.stretch ? '<span class="pill info">Stretched for emphasis</span>' : ''}</div>
      <dl class="kv"><dt>Standard</dt><dd class="th" lang="th">${d.std}</dd><dt>Say it</dt><dd class="rom">${d.rom}</dd><dt>Meaning</dt><dd>${d.mean}</dd>${d.note || seg.stretch ? `<dt>Good to know</dt><dd>${seg.stretch ? 'Repeating the last letter makes it stronger, like "soooo". ' : ''}${d.note}</dd>` : ''}${d.conf ? `<dt>Confidence</dt><dd><span class="pill warn">${d.conf}</span></dd>` : ''}</dl>
      <div class="row"><button class="btn line" data-say="${d.std}">${ic('sound')} Listen</button></div></article>`;
  }).join('')}</div>`;
}

/* ---------- Me ---------- */
function vMe() {
  const tests = STAGES[4].lessons;
  const row = (icn, title, sub, ctrl, forId) => `<div class="setting"><${forId ? `label for="${forId}"` : 'span'} class="row nowrap">${ic(icn)}<span><b>${title}</b>${sub ? `<br><span class="small muted">${sub}</span>` : ''}</span></${forId ? 'label' : 'span'}>${ctrl}</div>`;
  const tog = (id, on, label) => `<label class="toggle"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${label}"><span></span></label>`;
  return `${topbar()}
  <section class="card c-lav-l row nowrap me-head">${jai(80, 'happy')}<div class="stack" style="gap:4px;min-width:0"><h1>Guest learner</h1><p class="small">Playing without an account. Progress is saved on this device only.</p><span class="pill">Accounts & sync: coming soon</span></div></section>
  <div class="stats4">
    <div class="stat c-lav-l"><b>${knownLetters()}/44</b><span>letters known well</span></div>
    <div class="stat c-mint-l"><b>${ALL_LESSONS.filter(l => lessonState(l.id) === 'completed').length}/${ALL_LESSONS.length}</b><span>foundation lessons</span></div>
    <div class="stat c-lemon-l"><b>${S.streak}</b><span>days in a row</span></div>
    <div class="stat c-pink-l"><b>${currentStage().n}</b><span>current stage</span></div>
  </div>
  <section class="card stack"><h2>Foundation skills</h2><p class="small muted">Each skill is checked separately in Stage 5.</p>
    ${tests.map(t => `<div class="setting"><span><b>${t.title.replace(' test', '')}</b><br><span class="small muted">pass mark ${passMark(t)}%</span></span>${statusPill(t.id, true)}</div>`).join('')}</section>
  <div class="grid g2">
    <button class="card tile c-mint-l" data-go="homework">${ic('homework')}<span><b>Homework Studio</b><br><span class="small">AI check or a real Thai reviewer</span></span>${ic('chev')}</button>
    <button class="card tile c-lemon-l" data-go="plans">${ic('star')}<span><b>KhaoJai Plus</b><br><span class="small">Plans & payment (demo)</span></span>${ic('chev')}</button>
  </div>
  <section class="card"><h2>Settings</h2>
    ${row('bulb', 'Show romanization', 'On by default for beginners. You can also hide it inside any lesson.', tog('sRom', S.rom, 'Show romanization'))}
    ${row('globe', 'How romanization works', 'KhaoJai\'s spelling system and its limits', '<button class="btn line" data-sheet="romguide">Read</button>')}
    ${row('sound', 'Sound', 'Play Thai audio', tog('sSound', S.sound, 'Sound'))}
    ${row('lock', 'Adult language lessons', 'Insults & profanity, 18+ (after the foundation, coming later)', tog('sAdult', S.adult, 'Adult language lessons'))}
    ${row('map', 'Unlock everything (testing)', 'For reviewing the app — normally lessons unlock in order', tog('sUnlock', S.unlockAll, 'Unlock everything'))}
    ${row('phone', 'Install on your phone or computer', 'iPhone, Android, Windows, Mac', '<button class="btn line" data-sheet="install">How</button>')}
    ${row('trash', 'Reset progress', 'Start again from the first lesson', '<button class="btn line" id="sReset">Reset</button>')}
  </section>
  <p class="small muted center">KhaoJai early preview · v0.4 · Thai Foundation</p>`;
}

/* ---------- Homework & Plans (unchanged features) ---------- */
function vHomework() {
  const st = { ai: ['info', 'sparkle', 'Checked by AI'], queue: ['warn', 'homework', 'Waiting for a person'], human: ['ok', 'person', 'Reviewed by a Thai reviewer'] };
  const list = [...S.homework, { title: 'Message to my partner\'s mom (writing)', status: 'human', note: 'Sample review · Natural 4/5 · Politeness 5/5. Add ค่ะ after the thank-you.', date: 'Example' }];
  return `${topbar()}<div class="pagehead"><h1>Homework Studio</h1><p class="muted">Send writing, a photo of handwriting, or a voice clip.</p></div>
  <div class="grid g2"><form class="card c-mint-l stack" id="hwForm" novalidate><h2>New homework</h2>
    <div class="field"><label for="hwTitle">What is it?</label><input id="hwTitle" class="input" placeholder="e.g. My handwriting: ก to ฮ"></div>
    <div class="field"><label for="hwText">Your Thai (optional if you attach a file)</label><textarea id="hwText" class="input th" lang="th" placeholder="พิมพ์ภาษาไทยที่นี่"></textarea></div>
    <label class="drop" for="hwFile">${ic('upload')}<b>Attach a photo or voice clip</b><span class="small" id="hwFileName">JPG, PNG, M4A or MP3</span></label><input id="hwFile" type="file" accept="image/*,audio/*" hidden>
    <fieldset class="stack plain-fs"><legend class="lbl">Who checks it?</legend><div class="pmg">
      <label class="rc"><input type="radio" name="hwWho" id="hwAi" value="ai" checked><span class="dot"></span><span><b>AI check</b><br><span class="small muted">Included</span></span></label>
      <label class="rc"><input type="radio" name="hwWho" id="hwHuman" value="human"><span class="dot"></span><span><b>Thai reviewer</b><br><span class="small muted">1 credit · you have ${S.credits}</span></span></label></div></fieldset>
    <p class="err" id="hwErr" role="alert"></p><button class="btn block" type="submit">Send homework</button></form>
  <section class="stack"><div class="card c-lav-l row between nowrap"><div><p class="eyebrow">Review credits</p><p class="big-num">${S.credits}</p><p class="small">We show the real queue instead of promising a fixed time.</p></div><button class="btn soft" data-go="plans">Get credits</button></div>
    ${list.map(h => `<article class="card hw"><div class="row between"><b>${esc(h.title)}</b><span class="small muted">${h.date}</span></div><span class="pill ${st[h.status][0]}">${ic(st[h.status][1])} ${st[h.status][2]}</span><p class="small">${esc(h.note)}</p></article>`).join('')}</section></div>`;
}
const baht = n => n === 0 ? '฿0' : '฿' + n.toLocaleString('en-US');
function vPlans() {
  return `${topbar()}<div class="pagehead"><h1>KhaoJai Plus</h1><p class="muted">The Thai Foundation is free. Plus adds AI practice and human homework review.</p></div>
  <div class="row between"><div class="seg" role="group" aria-label="Billing period"><button data-bill="monthly" aria-pressed="${billing === 'monthly'}">Monthly</button><button data-bill="yearly" aria-pressed="${billing === 'yearly'}">Yearly · save 23%</button></div><span class="demo">Sample prices · demo checkout</span></div>
  <div class="plans">${Object.entries(PLANS).map(([k, p]) => { const v = (billing === 'yearly' && !p.once) ? p.y : p.m; return `<article class="card plan c-${p.color === 'white' ? 'white' : p.color + '-l'}">${k === 'plus' ? '<span class="pill hot">Most popular</span>' : '<span class="pill" style="visibility:hidden">·</span>'}<h2>${p.name}</h2><p><span class="price">${baht(v)}</span> <span class="muted">${p.m === 0 ? 'forever' : p.once ? 'one-time' : billing === 'yearly' ? '/ year' : '/ month'}</span></p><ul>${p.f.map(x => `<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul>${k === 'free' ? '<button class="btn line block" disabled>You\'re on Free</button>' : `<button class="btn block ${k === 'review' ? 'soft' : ''}" data-buy="${k}" ${k === 'plus' && S.plan === 'plus' ? 'disabled' : ''}>${k === 'plus' ? (S.plan === 'plus' ? 'Active' : 'Get Plus') : 'Buy 5 reviews'}</button>`}</article>`; }).join('')}</div>
  <section class="card stack"><h3>Ways to pay</h3><div class="chips">${['Visa', 'Mastercard', 'JCB', 'AmEx', 'UnionPay', 'PromptPay', 'TrueMoney', 'K PLUS', 'SCB', 'Krungthai', 'Apple Pay', 'Google Pay', 'PayPal'].map(x => `<span class="chip">${x}</span>`).join('')}</div><p class="small muted">This checkout is a demo and never charges.</p></section>`;
}

/* ---------- sheets ---------- */
let sheet = null, co = null, sheetLetter = null;
function openSheet(k) { sheet = k; paintSheet(); }
function closeSheet() { sheet = null; stopQr(); paintSheet(); }
function paintSheet() {
  const Lr = document.getElementById('layer');
  if (!sheet) { Lr.innerHTML = ''; return; }
  const html = ({ checkout: () => checkoutSheet(co, billing), install: installSheet, romguide: romSheet, letter: letterSheet })[sheet]();
  Lr.innerHTML = `<div class="scrim" data-scrim><div class="sheet" role="dialog" aria-modal="true" aria-label="${sheet}"><span class="grab"></span>${html}</div></div>`;
  if (sheet === 'checkout') wireCheckout(co, paintSheet, () => { if (co.item === 'plus') { S.plan = 'plus'; S.credits += 1; } if (co.item === 'review') S.credits += 5; save(); render(); });
}
const closeBtn = `<button class="iconbtn" data-close aria-label="Close">${ic('close')}</button>`;
function letterSheet() {
  const x = L[sheetLetter], s = SOUNDS[x.snd];
  const fam = SAME_SOUND.find(f => f.letters.includes(x.c));
  return `<div class="sheet-head c-lav-l"><span class="bigchar cls-${x.cls}" lang="th">${x.c}</span><div style="flex:1;min-width:0"><p class="th lname" lang="th">${x.say} ${x.word}</p><p class="rom always">${x.rom}</p></div>${closeBtn}</div>
  <div class="row"><button class="btn" data-say="${x.say} ${x.word}">${ic('sound')} Listen</button><button class="btn line" data-say-slow="${x.say} ${x.word}">${ic('slow')} Slowly</button><button class="btn line" data-studio="${x.c}" data-go="letters" data-sub="write">✍️ Practise writing</button></div>
  <div class="lpic"><span class="emoji" aria-hidden="true">${x.pic}</span><div><b class="th" lang="th">${x.word}</b> — ${x.en}</div></div>
  <dl class="facts"><dt>Sound at the start</dt><dd><b>${s.rom}</b> <span class="muted">${s.ipa}</span> — ${s.en}${s.vs ? `<br><span class="small">${s.vs}</span>` : ''}</dd>
    <dt>Class</dt><dd><span class="pill cls-${x.cls}">${x.cls} class</span> <span class="th small" lang="th">${CLASS_INFO[x.cls].th}</span></dd>
    ${fam ? `<dt>Same sound as</dt><dd><span class="th" lang="th">${fam.letters.filter(c => c !== x.c).join(' ')}</span><br><span class="small">${fam.why}</span></dd>` : ''}</dl>
  ${x.old ? '<p class="note">No longer used in modern Thai, but still part of the alphabet.</p>' : ''}${x.note ? `<p class="note">${x.note}</p>` : ''}`;
}
function romSheet() {
  return `<div class="sheet-head c-mint-l">${jai(52, 'happy')}<div style="flex:1"><h2>How KhaoJai romanization works</h2><p class="small">Thai written with English letters — a helper, not a replacement for Thai script.</p></div>${closeBtn}</div>
  <div class="card stack"><p><b>It is an approximation.</b> English letters can't show every Thai sound, and they don't show the tone. Always listen to the audio, and switch romanization off when you're ready to read Thai.</p>
  <div class="tablewrap"><table class="rules">
    <tr><td><b>g · dt · bp · j</b></td><td>No puff of air: ก ต ป จ (like the k in "skin", t in "stop", p in "spin")</td></tr>
    <tr><td><b>k · t · p · ch</b></td><td>With a puff of air: ข ค · ท ถ · พ ผ · ช ฉ (like "kite", "top", "pin", "chair")</td></tr>
    <tr><td><b>ng</b></td><td>ง — the "ng" of "sing", also at the start of words</td></tr>
    <tr><td><b>aa · ee · oo</b></td><td>Long vowels า ี ู (a doubled letter = long). Short: a · i · u</td></tr>
    <tr><td><b>eh · ae · oh · or</b></td><td>Long เ แ โ ออ</td></tr>
    <tr><td><b>ai · ao · am</b></td><td>ไ / ใ · เา · ำ</td></tr>
    <tr><td><b>ue · uea</b></td><td>อึ/อือ (say "ee" with unrounded lips) · เอือ</td></tr></table></div>
  <p class="small">Tones are shown separately as a tone name (mid, low, falling, high, rising) when they matter, not with accent marks.</p>
  <p class="small">In everyday chat you'll see other spellings, like "sawasdee ka". KhaoJai keeps to one system so you never have to guess.</p></div>`;
}
function installSheet() {
  return `<div class="sheet-head c-mint-l">${jai(52, 'cheer')}<div style="flex:1"><h2>Put KhaoJai on your home screen</h2><p class="small">Open the KhaoJai web address first, then:</p></div>${closeBtn}</div>
  ${[['sky', 'iPhone / iPad', 'In Safari tap Share → Add to Home Screen'], ['mint', 'Android', 'In Chrome tap ⋮ → Install app'], ['lav', 'Windows', 'In Chrome or Edge click the install icon at the right of the address bar'], ['pink', 'Mac', 'In Chrome or Edge click Install; in Safari choose File → Add to Dock']].map(([c, t, s]) => `<div class="card c-${c}-l"><b>${t}</b><p class="small">${s}</p></div>`).join('')}`;
}

/* ---------- render ---------- */
function render() {
  document.body.classList.toggle('playing', route === 'play');
  const main = document.getElementById('main');
  if (route === 'play') { main.innerHTML = renderPlayer(); mountPlayer(render); }
  else {
    main.innerHTML = `<div class="view">${({ map: vMap, letters: vLetters, practice: vPractice, decoder: vDecoder, me: vMe, homework: vHomework, plans: vPlans })[route]()}</div>`;
    if (route === 'letters' && lettersTab === 'sing') paintSing();
    if (route === 'letters' && lettersTab === 'write') { const cv = document.getElementById('studioPad'); if (cv) mountPad(cv, { c: studio.c, guide: studio.guide, strokes: studio.strokes, reveal: studio.score !== null && !studio.guide }); }
  }
  nav();
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('button,[data-scrim],a[data-go]'); if (!t) return;
  const d = t.dataset;
  if (d.studio) { studio = { c: d.studio, guide: studio.guide, strokes: [], score: null }; }
  if (d.go) { e.preventDefault(); closeSheet(); stopSing(); return go(d.go, d.sub); }
  if (t.matches('[data-scrim]')) { if (e.target === t) closeSheet(); return; }
  if (d.say) return say(d.say);
  if (d.saySlow) return say(d.saySlow, 0.55);
  if (d.p) return playerAction(t, render);
  if (d.close !== undefined) return closeSheet();
  if (d.sheet) return openSheet(d.sheet);
  if (d.toast) return toast(d.toast);
  if (d.lesson) return openLesson(d.lesson);
  if (d.life) return openLife(d.life);
  if (d.stage) { openStage = openStage === +d.stage ? 0 : +d.stage; return render(); }
  if (d.review) { const set = d.review === 'due' ? dueLetters() : troubleLetters(); return startDrill('letters', set.length ? set : Object.keys(S.cards)); }
  if (d.drill) return startDrill(d.drill);
  if (d.letter) { sheetLetter = d.letter; say(`${L[d.letter].say} ${L[d.letter].word}`); return openSheet('letter'); }
  if (d.ltab) { stopSing(); lettersTab = d.ltab; return render(); }
  if (d.kara !== undefined) { sing.i = +d.kara; const was = sing.on; stopSing(); if (was) { sing.on = true; singStep(); } else { paintSing(); const x = LETTERS[sing.i]; say(`${x.say} ${x.word}`); } return; }
  if (t.id === 'singPlay') { if (sing.on) { stopSing(); paintSing(); } else { sing.on = true; singStep(); } return; }
  if (t.id === 'singPrev' || t.id === 'singNext') { sing.i = (sing.i + (t.id === 'singNext' ? 1 : -1) + LETTERS.length) % LETTERS.length; const was = sing.on; stopSing(); if (was) { sing.on = true; singStep(); } else { paintSing(); say(`${LETTERS[sing.i].say} ${LETTERS[sing.i].word}`); } return; }
  if (d.rgroup !== undefined) { rec.g = +d.rgroup; if (rec.url) { URL.revokeObjectURL(rec.url); rec.url = null; } return render(); }
  if (d.weak) { const w = S.recite.weak; const i = w.indexOf(d.weak); if (i < 0) w.push(d.weak); else w.splice(i, 1); save(); t.classList.toggle('weak'); say(`${L[d.weak].say} ${L[d.weak].word}`); return; }
  if (t.id === 'recRef') return playSeq(GROUPS4[rec.g]);
  if (t.id === 'recStart') return startRecording();
  if (t.id === 'recStop') { rec.media?.stop(); return; }
  if (t.id === 'recCompare') return playSeq(GROUPS4[rec.g], () => document.getElementById('recAudio')?.play());
  if (t.id === 'recDelete') { if (rec.url) URL.revokeObjectURL(rec.url); rec.url = null; toast('Recording deleted.'); return render(); }
  if (t.id === 'recDone') { logRecite(false); toast('Nice! Logged this group.'); return render(); }
  if (d.studio) return render();
  if (d.sguide !== undefined) { studio.guide = d.sguide === '1'; studio.strokes = []; studio.score = null; return render(); }
  if (t.id === 'sClear') { studio.strokes.length = 0; studio.score = null; return render(); }
  if (t.id === 'sCheck') { if (!studio.strokes.length) return toast('Write the letter first.'); shapeScore(studio.c, studio.strokes, !studio.guide).then(s => { studio.score = s; render(); }); return; }
  if (d.ex) { dText = d.ex; return render(); }
  if (t.id === 'dGo') { dText = document.getElementById('dIn').value; return render(); }
  if (t.id === 'flash') { fc.flip = !fc.flip; t.classList.toggle('flipped', fc.flip); return; }
  if (d.rate) { fc.i++; fc.flip = false; return render(); }
  if (d.bill) { billing = d.bill; return render(); }
  if (d.buy) { co = { item: d.buy, method: 'card', step: 'form' }; return openSheet('checkout'); }
  if (t.id === 'sReset') { if (d.armed) { resetAll(); openStage = null; toast('Progress reset. Back to the first lesson.'); return go('map'); } d.armed = '1'; t.textContent = 'Tap again to reset'; return; }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'sRom') { S.rom = t.checked; save(); }
  if (t.id === 'sSound') { S.sound = t.checked; save(); }
  if (t.id === 'sAdult') { S.adult = t.checked; save(); }
  if (t.id === 'sUnlock') { S.unlockAll = t.checked; save(); toast(S.unlockAll ? 'Everything unlocked for testing.' : 'Lessons unlock in order again.'); }
  if (t.id === 'singRate') sing.rate = +t.value;
  if (t.id === 'hwFile') document.getElementById('hwFileName').textContent = t.files[0] ? t.files[0].name : 'JPG, PNG, M4A or MP3';
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'hwForm') return; e.preventDefault();
  const title = document.getElementById('hwTitle').value.trim(), txt = document.getElementById('hwText').value.trim(), file = document.getElementById('hwFile').files[0];
  const human = document.getElementById('hwHuman').checked, err = document.getElementById('hwErr');
  if (!title) return err.textContent = 'Give your homework a short name.';
  if (!txt && !file) return err.textContent = 'Type some Thai or attach a photo or voice clip.';
  if (human && S.credits < 1) return err.textContent = 'You have no review credits yet. Get some in Plus, or choose AI check.';
  if (human) S.credits--;
  S.homework.unshift({ title, status: human ? 'queue' : 'ai', date: new Date().toLocaleDateString('en-GB'), note: human ? 'In the queue for a Thai reviewer.' : 'AI checking is coming soon. Your homework is saved on this device.' });
  save(); toast(human ? 'Sent to the review queue.' : 'Saved.'); render();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sheet) return closeSheet();
  if (route === 'play') return playerKey(e, render);
  if (e.key === 'Enter' && e.target.id === 'dIn' && (e.metaKey || e.ctrlKey)) { dText = e.target.value; render(); }
});
window.addEventListener('pagehide', () => { if (rec.url) URL.revokeObjectURL(rec.url); });

/* ---------- start ---------- */
const h0 = location.hash.slice(1);
route = ROUTES.includes(h0) && h0 !== 'play' ? h0 : 'map';
render();
if ('speechSynthesis' in window) speechSynthesis.getVoices();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !location.hostname.endsWith('claude.ai') && !location.hostname.includes('claudeusercontent')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
