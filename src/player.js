// The lesson player: runs a list of exercises one at a time, checks answers,
// re-queues mistakes at the end, and shows a result screen.
import { S, save, addPoints } from './store.js';
import { WORDS, TONES } from './data/lessons.js';
import { ic, jai, toneIcon, esc, say, shuffle } from './ui.js';

export let P = null;
let onExit = () => {};

export function startLesson({ id, title, sub, exercises, color = 'lav', mission = false, words = [] }, exitFn) {
  onExit = exitFn;
  P = { id, title, sub, color, mission, words, list: exercises.map(e => ({ ...e })), total: exercises.length,
        i: 0, done: 0, right: 0, wrong: 0, phase: 'answer', quit: false, seed: Date.now() % 9973 };
  prep();
}

function cur() { return P.list[P.i]; }

function prep() {
  const ex = cur(); if (!ex) return;
  P.sel = null; P.ok = null; P.built = []; P.left = null; P.matched = []; P.miss = null; P.matchMiss = 0; P.showRom = false; P.showEn = false;
  P.seed = (P.seed * 7 + 13) % 9973;
  if (ex.t === 'build') P.torder = shuffle([...ex.ans.map((_, i) => i), ...ex.extra.map((_, i) => 100 + i)], P.seed);
  if (ex.t === 'match') { P.lorder = shuffle(ex.pairs.map((_, i) => i), P.seed + 1); P.rorder = shuffle(ex.pairs.map((_, i) => i), P.seed + 2); }
  if (ex.t === 'listen') setTimeout(() => say(ex.say), 250);
}

const tileOf = (ex, k) => k >= 100 ? ex.extra[k - 100] : ex.ans[k];

/* ---------- rendering ---------- */
export function renderPlayer() {
  if (P.phase === 'result') return renderResult();
  const ex = cur();
  const pct = Math.round(P.done / P.total * 100);
  const canCheck = (['choose', 'listen', 'chat', 'tone'].includes(ex.t) && P.sel !== null) || (ex.t === 'build' && P.built.length > 0);
  return `<div class="play c-${P.color}">
    <header class="play-top">
      <button class="iconbtn ghost" data-p="quit" aria-label="Leave lesson">${ic('close')}</button>
      <div class="pbar" role="progressbar" aria-label="Lesson progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <span class="pts" title="Jai points this lesson">${ic('bubble')} ${P.right * 10}</span>
    </header>
    ${P.quit ? `<div class="quitbar" role="alertdialog" aria-label="Leave lesson?"><p><b>Leave this station?</b> Progress in this lesson won't be saved.</p><div class="row"><button class="btn soft" data-p="stay">Keep going</button><button class="btn line" data-p="leave">Leave</button></div></div>` : ''}
    <main class="play-body">${ex._retry ? '<span class="pill warn">Try this one again</span>' : ''}${body(ex)}</main>
    ${P.phase === 'feedback' ? feedback(ex) : `<footer class="play-foot"><div class="play-foot-in">
      ${['choose', 'listen', 'chat', 'build'].includes(ex.t) ? `<button class="btn line" data-p="rom" aria-pressed="${P.showRom}">${ic('bulb')} ${P.showRom ? 'Hide' : 'Show'} romanization</button>` : '<span></span>'}
      ${ex.t === 'match' ? '<span class="muted small">Tap a Thai word, then its meaning</span>' : `<button class="btn big" data-p="check" ${canCheck ? '' : 'disabled'}>Check</button>`}
    </div></footer>`}
  </div>`;
}

function optRom(o) { return o[1] && (P.showRom || P.phase === 'feedback') ? `<small class="rom">${o[1]}</small>` : ''; }
function stateCls(i, ans) { if (P.phase !== 'feedback') return P.sel === i ? 'picked' : ''; if (i === ans) return 'right'; return P.sel === i ? 'wrong' : 'dim'; }

function body(ex) {
  const lock = P.phase === 'feedback' ? 'disabled' : '';
  switch (ex.t) {
    case 'choose': return `<h2 class="q">${ex.q}</h2>
      ${ex.show ? `<div class="show"><span class="th" lang="th">${ex.show}</span>${ex.showR ? `<button class="iconbtn" data-say="${ex.show}" aria-label="Listen">${ic('sound')}</button>` : ''}</div>${ex.showR && (P.showRom || P.phase === 'feedback') ? `<p class="rom center">${ex.showR}</p>` : ''}` : ''}
      <div class="opts">${ex.o.map((o, i) => `<button class="opt ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock}><span class="key">${i + 1}</span><span class="txt"><span ${ex.thai ? 'class="th" lang="th"' : ''}>${o[0]}</span>${optRom(o)}</span></button>`).join('')}</div>`;
    case 'listen': return `<h2 class="q">What do you hear?</h2>
      <div class="listen"><button class="speaker" data-say="${ex.say}" aria-label="Play again">${ic('sound')}</button><button class="speaker small" data-say-slow="${ex.say}" aria-label="Play slowly">${ic('slow')}</button></div>
      <div class="opts">${ex.o.map((o, i) => `<button class="opt ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock}><span class="key">${i + 1}</span><span class="txt"><span class="th" lang="th">${o[0]}</span>${optRom(o)}</span></button>`).join('')}</div>`;
    case 'chat': return `<h2 class="q">Pick the best reply</h2>
      <div class="thread">
        <div class="msg in"><span class="who">${ex.who}</span><span class="bub"><span class="th" lang="th">${ex.msg}</span>
          ${P.showRom || P.phase === 'feedback' ? `<small class="rom">${ex.msgR}</small>` : ''}
          ${P.showEn || P.phase === 'feedback' ? `<small class="en">"${ex.msgE}"</small>` : `<button class="linkbtn" data-p="en">Translate</button>`}</span>
          <button class="iconbtn" data-say="${ex.msg}" aria-label="Listen">${ic('sound')}</button></div>
      </div>
      <div class="replies">${ex.o.map((o, i) => `<button class="reply ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock}><span class="th" lang="th">${o[0]}</span>${optRom(o)}${P.phase === 'feedback' ? `<small class="en">"${o[2]}"</small>` : ''}</button>`).join('')}</div>`;
    case 'tone': return `<h2 class="q">Which tone is this?</h2>
      <div class="show"><span class="th huge" lang="th">${ex.syl}</span><button class="iconbtn" data-say="${ex.syl}" aria-label="Listen">${ic('sound')}</button></div><p class="rom center">${ex.r}</p>
      <div class="tones">${TONES.map((t, i) => `<button class="tone ${P.phase === 'feedback' ? (t === ex.a ? 'right' : P.sel === i ? 'wrong' : 'dim') : P.sel === i ? 'picked' : ''}" data-p="sel" data-i="${i}" ${lock}>${toneIcon(t)}<span>${t}</span></button>`).join('')}</div>`;
    case 'match': {
      return `<h2 class="q">Match the pairs</h2>
      <div class="match">
        <div class="col">${P.lorder.map(i => { const m = P.matched.includes(i); return `<button class="mt th ${m ? 'gone' : ''} ${P.left === i ? 'picked' : ''} ${P.miss && P.miss[0] === i ? 'shake' : ''}" lang="th" data-p="ml" data-i="${i}" ${m || lock ? 'disabled' : ''}>${ex.pairs[i][0]}</button>`; }).join('')}</div>
        <div class="col">${P.rorder.map(i => { const m = P.matched.includes(i); return `<button class="mt ${m ? 'gone' : ''} ${P.miss && P.miss[1] === i ? 'shake' : ''}" data-p="mr" data-i="${i}" ${m || lock ? 'disabled' : ''}>${ex.pairs[i][1]}</button>`; }).join('')}</div>
      </div>`;
    }
    case 'build': return `<h2 class="q">Build it in Thai</h2>
      <div class="prompt">${jai(54, 'think')}<p class="bub2">${ex.q}</p></div>
      <div class="ansline" aria-label="Your answer">${P.built.length ? P.built.map((k, j) => { const t = tileOf(ex, k); return `<button class="wtile th" lang="th" data-p="unbuild" data-j="${j}" ${lock}>${t[0]}${P.showRom ? `<small class="rom">${t[1]}</small>` : ''}</button>`; }).join('') : '<span class="muted small">Tap the words below in order</span>'}</div>
      <div class="bank">${P.torder.map(k => { const t = tileOf(ex, k), used = P.built.includes(k); return `<button class="wtile th ${used ? 'used' : ''}" lang="th" data-p="build" data-k="${k}" ${used || lock ? 'disabled' : ''}>${t[0]}${P.showRom ? `<small class="rom">${t[1]}</small>` : ''}</button>`; }).join('')}</div>`;
  }
  return '';
}

function correctText(ex) {
  if (ex.t === 'build') return ex.ans.map(a => a[0]).join('');
  if (ex.t === 'tone') return ex.a;
  if (ex.t === 'match') return '';
  const o = ex.o[ex.a]; return o[0];
}

function feedback(ex) {
  const good = P.ok;
  const title = ex.t === 'match' ? (P.matchMiss ? 'All matched!' : 'Perfect match!') : good ? ['Nice!', 'Correct!', 'You got it!', 'เก่งมาก!'][P.done % 4] : 'Not quite';
  const ans = correctText(ex);
  return `<footer class="fb ${good ? 'good' : 'bad'}" role="status"><div class="fb-in">
    <div class="row" style="flex-wrap:nowrap;align-items:flex-start">${jai(56, good ? 'cheer' : 'oops', good ? '#A8EBC4' : '#FFC1B5')}
      <div class="stack" style="gap:4px;min-width:0"><h3>${title}</h3>
        ${!good && ans ? `<p>Answer: <b ${ex.t === 'tone' ? '' : 'class="th" lang="th"'}>${ans}</b></p>` : ''}
        ${ex.why ? `<p class="small">${ex.why}</p>` : ''}</div></div>
    <button class="btn big ${good ? 'go' : 'warm'}" data-p="next" autofocus>Continue</button>
  </div></footer>`;
}

function renderResult() {
  const acc = Math.round(P.right / P.total * 100);
  const learned = P.words.filter(w => WORDS[w]);
  return `<div class="play result c-${P.color}"><main class="play-body center">
    ${jai(150, 'cheer', '#C9B6FF', 'bob')}
    <p class="eyebrow">${P.mission ? 'Mission complete' : 'Station complete'}</p>
    <h1>${esc(P.title)}</h1>
    <div class="stats3">
      <div class="stat lemon"><b>+${P.earned}</b><span>Jai points</span></div>
      <div class="stat mint"><b>${acc}%</b><span>first-try right</span></div>
      <div class="stat pink"><b>${learned.length}</b><span>words</span></div>
    </div>
    ${learned.length ? `<div class="wordlist">${learned.map(w => `<button class="wchip" data-say="${w}"><span class="th" lang="th">${w}</span><small>${WORDS[w][0]} · ${WORDS[w][1]}</small></button>`).join('')}</div>` : ''}
    <div class="row center"><button class="btn big" data-p="finish">Continue</button></div>
  </main></div>`;
}

/* ---------- actions ---------- */
export function playerAction(btn, rerender) {
  const a = btn.dataset.p, ex = cur();
  switch (a) {
    case 'quit': P.quit = true; break;
    case 'stay': P.quit = false; break;
    case 'leave': P = null; return onExit(false);
    case 'rom': P.showRom = !P.showRom; break;
    case 'en': P.showEn = true; break;
    case 'sel': if (P.phase === 'answer') P.sel = +btn.dataset.i; break;
    case 'build': P.built.push(+btn.dataset.k); break;
    case 'unbuild': P.built.splice(+btn.dataset.j, 1); break;
    case 'ml': P.left = +btn.dataset.i; P.miss = null; break;
    case 'mr': {
      const r = +btn.dataset.i;
      if (P.left === null) { P.miss = null; break; }
      if (r === P.left) { P.matched.push(r); P.left = null; P.miss = null; if (ex.pairs[r]) say(ex.pairs[r][0]); }
      else { P.miss = [P.left, r]; P.matchMiss++; P.left = null; }
      if (P.matched.length === ex.pairs.length) { P.ok = true; P.phase = 'feedback'; P.done++; if (!P.matchMiss && !ex._retry) P.right++; }
      break;
    }
    case 'check': check(); break;
    case 'next': next(); break;
    case 'finish': { const id = P.id; P = null; return onExit(true, id); }
  }
  rerender();
}

function check() {
  const ex = cur();
  if (ex.t === 'build') P.ok = P.built.map(k => tileOf(ex, k)[0]).join('|') === ex.ans.map(a => a[0]).join('|');
  else if (ex.t === 'tone') P.ok = TONES[P.sel] === ex.a;
  else P.ok = P.sel === ex.a;
  P.phase = 'feedback';
  if (P.ok) { P.done++; if (!ex._retry) P.right++; }
  else { P.wrong++; P.list.push({ ...ex, _retry: true }); }
  if (P.ok && ex.t === 'build') say(ex.ans.map(a => a[0]).join(''));
}

function next() {
  P.i++;
  if (P.i >= P.list.length) {
    P.earned = P.right * 10 + (P.wrong === 0 ? 10 : 0);
    addPoints(P.earned);
    const prev = S.done[P.id]?.best || 0, acc = Math.round(P.right / P.total * 100);
    if (P.id) S.done[P.id] = { best: Math.max(prev, acc), at: new Date().toISOString() };
    P.words.forEach(w => { if (!S.words.includes(w)) S.words.push(w); });
    save(); P.phase = 'result'; return;
  }
  P.phase = 'answer'; prep();
}

export function playerKey(e, rerender) {
  if (!P || P.phase === 'result') return;
  const ex = cur();
  if (/^[1-5]$/.test(e.key) && P.phase === 'answer' && ['choose', 'listen', 'chat', 'tone'].includes(ex.t)) {
    const n = +e.key - 1, max = ex.t === 'tone' ? 5 : ex.o.length; if (n < max) { P.sel = n; rerender(); }
  }
  if (e.key === 'Enter' && !e.target.matches('input,textarea')) {
    e.preventDefault();
    if (P.phase === 'feedback') { next(); rerender(); }
    else if ((P.sel !== null && ex.t !== 'build' && ex.t !== 'match') || (ex.t === 'build' && P.built.length)) { check(); rerender(); }
  }
}
