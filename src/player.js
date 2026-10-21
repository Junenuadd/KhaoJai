// The lesson player. Every lesson runs the same way:
//   intro (what you'll learn) → learn cards → practice → check → result with one clear next step.
// Mistakes are explained, then the question comes back at the end of the lesson (up to twice).
// Only first-try answers count toward the score; the pass mark comes from config.js.
import { S, save, addPoints, seeLetter, markStarted, recordResult } from './store.js';
import { L, SOUNDS, FINALS, CLASS_INFO, TONES } from './data/letters.js';
import { PASS } from './config.js';
import { ic, jai, toneIcon, esc, say } from './ui.js';
import { mountPad, shapeScore } from './draw.js';

export let P = null;
let onExit = () => {};

export function startLesson(opts, exitFn) {
  onExit = exitFn;
  const list = opts.steps.map(e => ({ ...e }));
  P = { ...opts, list, scored: list.filter(e => e.score !== false).length, i: 0, done: 0, right: 0, wrong: 0, missed: new Set(), phase: 'answer', quit: false };
  markStarted(opts.id);
  prep();
}

const cur = () => P.list[P.i];
const scoredStep = ex => ex.score !== false;

function prep() {
  const ex = cur(); if (!ex) return;
  Object.assign(P, { sel: null, ok: null, built: [], left: null, matched: [], miss: null, matchMiss: 0, showEn: false, strokes: [], shape: null, checking: false });
  P.showRom = S.rom && !ex.hideRom && !P.hideRom;
  if (ex.t === 'build') P.torder = shuffleIdx([...ex.ans.map((_, i) => i), ...ex.extra.map((_, i) => 100 + i)]);
  if (ex.t === 'match') { P.lorder = shuffleIdx(ex.pairs.map((_, i) => i)); P.rorder = shuffleIdx(ex.pairs.map((_, i) => i)); }
  if (ex.t === 'listen') setTimeout(() => say(ex.say), 300);
  if (ex.t === 'write' && ex.mode === 'sound') setTimeout(() => say(`${L[ex.c].say} ${L[ex.c].word}`), 300);
  if (ex.t === 'build' && ex.sayWord) setTimeout(() => say(ex.sayWord), 300);
}
function shuffleIdx(a) { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const tileOf = (ex, k) => k >= 100 ? ex.extra[k - 100] : ex.ans[k];
const tileShow = t => t[2] || t[0];

/* ---------- rendering ---------- */
export function renderPlayer() {
  if (P.phase === 'result') return renderResult();
  const ex = cur();
  const pct = Math.round(P.done / Math.max(1, P.scored) * 100);
  const teaching = !scoredStep(ex);
  const canCheck = (['choose', 'listen', 'tone', 'chat'].includes(ex.t) && P.sel !== null) || (ex.t === 'build' && P.built.length > 0) || (['trace', 'write'].includes(ex.t) && P.strokes.length > 0 && !P.checking);
  const romBtn = ['choose', 'listen', 'build', 'card', 'info', 'write', 'chat'].includes(ex.t) && (ex.t !== 'choose' || ex.thai || ex.prompt || ex.show);
  return `<div class="play c-${P.color}">
    <header class="play-top">
      <button class="iconbtn ghost" data-p="quit" aria-label="Leave lesson">${ic('close')}</button>
      <div class="pbar" role="progressbar" aria-label="Lesson progress" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <span class="pts" title="Correct on the first try">${ic('check')} ${P.right}</span>
    </header>
    ${P.quit ? `<div class="quitbar" role="alertdialog" aria-label="Leave lesson?"><p><b>Leave this lesson?</b> Your answers so far in this lesson won't be saved.</p><div class="row"><button class="btn soft" data-p="stay">Keep going</button><button class="btn line" data-p="leave">Leave</button></div></div>` : ''}
    <main class="play-body">
      <div class="steptag">${ex.phase ? `<span class="pill ${ex.phase === 'Check' || ex.phase === 'Test' ? 'info' : ''}">${ex.phase}</span>` : `<span class="pill">${{ intro: 'Lesson', card: 'Learn', vcard: 'Learn', info: 'Understand' }[ex.t] || ''}</span>`}${ex._retry ? '<span class="pill warn">Try this one again</span>' : ''}<span class="small muted">${esc(P.title)}</span></div>
      ${body(ex)}
    </main>
    ${P.phase === 'feedback' ? feedback(ex) : `<footer class="play-foot"><div class="play-foot-in">
      ${romBtn ? `<button class="btn line" data-p="rom" aria-pressed="${P.showRom}">${ic('bulb')} ${P.showRom ? 'Hide' : 'Show'} romanization</button>` : '<span></span>'}
      ${teaching ? `<button class="btn big" data-p="next">${ex.t === 'intro' ? 'Start' : 'Got it'} ${ic('arrow')}</button>`
        : ex.t === 'match' ? '<span class="muted small">Tap a Thai letter, then its meaning</span>'
        : `<button class="btn big" data-p="check" ${canCheck ? '' : 'disabled'}>${P.checking ? 'Checking…' : 'Check'}</button>`}
    </div></footer>`}
  </div>`;
}

const rom = t => P.showRom && t ? `<span class="rom">${t}</span>` : '';
const speak = (t, label = 'Listen') => `<button class="iconbtn" data-say="${esc(t)}" aria-label="${label}">${ic('sound')}</button>`;
function stateCls(i, ans) { if (P.phase !== 'feedback') return P.sel === i ? 'picked' : ''; if (i === ans) return 'right'; return P.sel === i ? 'wrong' : 'dim'; }

function letterCard(c, focus) {
  const x = L[c], s = SOUNDS[x.snd], f = x.fin ? FINALS[x.fin] : null, ci = CLASS_INFO[x.cls];
  return `<div class="lcard">
    <div class="lcard-top"><span class="bigchar cls-${x.cls}" lang="th">${c}</span>
      <div class="stack" style="gap:2px;min-width:0"><p class="th lname" lang="th">${x.say} ${x.word}</p><p class="rom always">${x.rom}</p>
      <div class="row" style="gap:8px">${speak(`${x.say} ${x.word}`, 'Listen to the name')}<button class="btn line small-btn" data-say-slow="${x.say} ${x.word}">${ic('slow')} Slowly</button></div></div></div>
    <div class="lpic"><span class="emoji" aria-hidden="true">${x.pic}</span><div><b class="th" lang="th">${x.word}</b> — ${x.en}<br><span class="small muted">Picture cue: ${x.word} reminds you of ${c}.</span></div></div>
    <dl class="facts">
      <dt>Sound at the start</dt><dd><b>${s.rom}</b> <span class="muted">${s.ipa}</span> — ${s.en}${s.vs ? `<br><span class="small">${s.vs}</span>` : ''}</dd>
      <dt>Sound at the end</dt><dd>${f ? `<b>${f.rom}</b> — ${f.en}` : 'Not used at the end of a syllable'}</dd>
      <dt>Class</dt><dd><span class="pill cls-${x.cls}">${x.cls} class</span> <span class="th small" lang="th">${ci.th}</span> <span class="small muted">— matters later for tones</span></dd>
    </dl>
    ${x.old ? '<p class="note">This letter is no longer used in modern Thai, but it is still part of the alphabet.</p>' : ''}${x.note ? `<p class="note">${x.note}</p>` : ''}
    ${focus === 'sound' ? '' : `<p class="small muted">Tip: say the name out loud after you hear it. Thai children learn it as "${x.say} ${x.word}".</p>`}
  </div>`;
}

function body(ex) {
  const lock = P.phase === 'feedback' ? 'disabled' : '';
  switch (ex.t) {
    case 'intro': return `<h1>${esc(P.title)}</h1>${P.sub ? `<p class="muted">${esc(P.sub)}</p>` : ''}
      <div class="grid g2"><section class="card c-lav-l stack"><h3>What you'll learn</h3><ul class="ticks">${ex.learn.map(x => `<li>${x}</li>`).join('')}</ul></section>
      <section class="card c-mint-l stack"><h3>How this lesson works</h3><ol class="steps">${ex.how.map(x => `<li>${x}</li>`).join('')}</ol></section></div>`;
    case 'card': return `<h2 class="q">Meet ${ex.c}</h2>${letterCard(ex.c, ex.focus)}`;
    case 'vcard': { const v = ex.v, eg = v.v.replace('อ', 'ก'); return `<h2 class="q">Vowel ${v.v}</h2>
      <div class="lcard"><div class="lcard-top"><span class="bigchar cls-mid" lang="th">${v.v}</span><div class="stack" style="gap:4px"><p><b class="rom always" style="font-size:22px">${v.rom}</b> · ${v.len} vowel</p><p class="small">Written <b>${v.pos}</b> the consonant (อ shows where the consonant goes).</p>${v.note ? `<p class="small">${v.note}</p>` : ''}</div></div>
      <div class="egs"><div class="eg"><span class="th" lang="th">${eg}</span>${rom('g' + (v.rom))}${speak(eg)}</div></div></div>`; }
    case 'info': return `<h2 class="q">${ex.title}</h2>${ex.text ? `<p class="lead">${ex.text}</p>` : ''}
      ${ex.compare ? `<div class="compare">${ex.compare.map(c => L[c] ? `<button class="cmp" data-say="${L[c].say} ${L[c].word}"><span class="th" lang="th">${c}</span><small lang="th">${L[c].say} ${L[c].word}</small>${P.showRom ? `<small class="rom">${L[c].rom}</small>` : ''}</button>` : `<span class="cmp"><span class="th">${c}</span></span>`).join('')}</div>` : ''}
      ${ex.rows ? `<div class="tablewrap"><table class="rules">${ex.rows.map(r => `<tr>${r.map((x, i) => `<td${i === 0 ? ' class="th"' : ''}>${x}</td>`).join('')}</tr>`).join('')}</table></div>` : ''}
      ${ex.examples ? `<div class="egs">${ex.examples.map(([th, r, en]) => `<div class="eg"><span class="th" lang="th">${th}</span>${rom(r)}<span class="small">${en}</span>${speak(th)}</div>`).join('')}</div>` : ''}`;
    case 'choose': return `<h2 class="q">${ex.q}</h2>
      ${ex.prompt ? `<div class="show">${ex.prompt.pic ? `<span class="emoji" aria-hidden="true">${ex.prompt.pic}</span>` : ''}<div class="stack" style="gap:0;align-items:center"><span class="th mid" lang="th">${ex.prompt.th}</span>${rom(ex.prompt.rom)}${ex.prompt.en ? `<span class="small">${ex.prompt.en}</span>` : ''}</div>${speak(ex.prompt.th)}</div>` : ''}
      ${ex.show ? `<div class="show"><span class="th" lang="th">${ex.show}</span>${/[฀-๿]/.test(ex.show) ? speak(ex.show) : ''}</div>${ex.showR ? `<p class="center">${rom(ex.showR)}</p>` : ''}` : ''}
      ${optList(ex, lock)}`;
    case 'listen': return `<h2 class="q">What do you hear?</h2>
      <div class="listen"><button class="speaker" data-say="${esc(ex.say)}" aria-label="Play again">${ic('sound')}</button><button class="speaker small" data-say-slow="${esc(ex.say)}" aria-label="Play slowly">${ic('slow')}</button></div>
      ${P.phase === 'feedback' ? `<p class="center">You heard <b class="th" lang="th">${ex.say}</b> <span class="rom always">${ex.sayRom || ''}</span></p>` : ''}
      ${optList(ex, lock)}`;
    case 'tone': return `<h2 class="q">Which tone is this?</h2>
      <div class="show"><span class="th huge" lang="th">${ex.syl}</span>${speak(ex.syl)}</div><p class="center rom always">${ex.r}</p>
      <div class="tones">${TONES.map((t, i) => `<button class="tone ${P.phase === 'feedback' ? (t === ex.a ? 'right' : P.sel === i ? 'wrong' : 'dim') : P.sel === i ? 'picked' : ''}" data-p="sel" data-i="${i}" ${lock}>${toneIcon(t)}<span>${t}</span></button>`).join('')}</div>`;
    case 'chat': return `<h2 class="q">Pick the best reply</h2>
      <div class="thread"><div class="msg in"><span class="who">${ex.who}</span><span class="bub"><span class="th" lang="th">${ex.msg}</span>${rom(ex.msgR)}
        ${P.showEn || P.phase === 'feedback' ? `<small class="en">"${ex.msgE}"</small>` : `<button class="linkbtn" data-p="en">Translate</button>`}</span>${speak(ex.msg)}</div></div>
      <div class="replies">${ex.o.map((o, i) => `<button class="reply ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock}><span class="th" lang="th">${o[0]}</span>${P.showRom || P.phase === 'feedback' ? `<small class="rom">${o[1]}</small>` : ''}${P.phase === 'feedback' ? `<small class="en">"${o[2]}"</small>` : ''}</button>`).join('')}</div>`;
    case 'match': return `<h2 class="q">${ex.title || (ex.keys ? 'Match each letter to its picture word' : 'Match the pairs')}</h2>
      <div class="match">
        <div class="col">${P.lorder.map(i => { const m = P.matched.includes(i); return `<button class="mt th big ${m ? 'gone' : ''} ${P.left === i ? 'picked' : ''} ${P.miss && P.miss[0] === i ? 'shake' : ''}" lang="th" data-p="ml" data-i="${i}" ${m || lock ? 'disabled' : ''}>${ex.pairs[i][0]}</button>`; }).join('')}</div>
        <div class="col">${P.rorder.map(i => { const m = P.matched.includes(i); return `<button class="mt ${m ? 'gone' : ''} ${P.miss && P.miss[1] === i ? 'shake' : ''}" data-p="mr" data-i="${i}" ${m || lock ? 'disabled' : ''}>${ex.pairs[i][1]}</button>`; }).join('')}</div>
      </div>`;
    case 'build': return `<h2 class="q">${ex.q}</h2>
      <div class="listen">${ex.sayWord ? `<button class="speaker small" data-say="${esc(ex.sayWord)}" aria-label="Listen">${ic('sound')}</button>` : ''}</div>
      <div class="ansline" aria-label="Your answer">${P.built.length ? `<span class="th spelled" lang="th">${P.built.map(k => tileOf(ex, k)[0]).join('')}</span>` + P.built.map((k, j) => `<button class="wtile th small" lang="th" data-p="unbuild" data-j="${j}" ${lock} aria-label="Remove">${tileShow(tileOf(ex, k))}</button>`).join('') : '<span class="muted small">Tap the pieces below in writing order</span>'}</div>
      <div class="bank">${P.torder.map(k => { const t = tileOf(ex, k), used = P.built.includes(k); return `<button class="wtile th ${used ? 'used' : ''}" lang="th" data-p="build" data-k="${k}" ${used || lock ? 'disabled' : ''}>${tileShow(t)}</button>`; }).join('')}</div>`;
    case 'trace': case 'write': {
      const x = L[ex.c];
      const head = ex.t === 'trace' ? `Trace <span class="th" lang="th">${ex.c}</span>` : ex.mode === 'sound' ? 'Write the letter you hear' : `Write <span class="th" lang="th">${x.say} ${x.word}</span> from memory`;
      return `<h2 class="q">${head}</h2>
        <div class="row center" style="gap:10px">${ex.mode === 'sound' ? `<button class="speaker small" data-say="${x.say} ${x.word}" aria-label="Listen">${ic('sound')}</button>` : `${speak(`${x.say} ${x.word}`)}<span class="th" lang="th">${x.say} ${x.word}</span>`}${rom(x.rom)}${ex.mode !== 'sound' ? `<span class="emoji sm" aria-hidden="true">${x.pic}</span>` : ''}</div>
        <div class="padwrap"><canvas id="pad" class="pad" aria-label="Writing area"></canvas></div>
        <div class="row center"><button class="btn line" data-p="clear" ${lock}>Clear</button>${ex.t === 'trace' ? '<span class="small muted">Start at the head (small loop) if the letter has one.</span>' : ''}</div>`;
    }
  }
  return '';
}

function optList(ex, lock) {
  if (ex.big) return `<div class="bigopts">${ex.o.map((o, i) => `<button class="bopt ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock} lang="th">${o[0]}${P.phase === 'feedback' && i === ex.a && L[o[0]] ? `<small>${L[o[0]].say} ${L[o[0]].word}</small>` : ''}</button>`).join('')}</div>`;
  return `<div class="opts">${ex.o.map((o, i) => `<button class="opt ${stateCls(i, ex.a)}" data-p="sel" data-i="${i}" ${lock}><span class="key">${i + 1}</span><span class="txt"><span ${ex.thai ? 'class="th" lang="th"' : ''}>${o[0]}</span>${o[1] ? (ex.thai ? (P.showRom || P.phase === 'feedback' ? `<small class="rom">${o[1]}</small>` : '') : `<small>${o[1]}</small>`) : ''}</span></button>`).join('')}</div>`;
}

function correctText(ex) {
  if (ex.t === 'build') return ex.ans.map(a => a[0]).join('');
  if (ex.t === 'tone') return ex.a;
  if (['match', 'trace', 'write'].includes(ex.t)) return '';
  return ex.o[ex.a][0];
}

function feedback(ex) {
  const good = P.ok;
  let title = good ? ['Nice!', 'Correct!', 'You got it!', 'เก่งมาก! (geng maak — great job)'][P.done % 4] : 'Not quite';
  if (ex.t === 'match') title = P.matchMiss ? 'All matched — a few slips' : 'Perfect match!';
  let detail = '';
  if (ex.t === 'trace' || ex.t === 'write') {
    const need = ex.t === 'trace' ? PASS.trace : PASS.write;
    title = good ? 'Good shape!' : 'Let\'s try that again';
    detail = `<p>Shape match: <b>${P.shape}%</b> (needs ${need}%). This check is approximate: it compares shapes and does not judge stroke order.</p>`;
  }
  const ans = correctText(ex);
  const why = ex.why || (ex.c ? `${ex.c} = ${L[ex.c].say} ${L[ex.c].word} (${L[ex.c].rom}).` : '');
  return `<footer class="fb ${good ? 'good' : 'bad'}" role="status"><div class="fb-in">
    <div class="row" style="flex-wrap:nowrap;align-items:flex-start">${jai(52, good ? 'cheer' : 'oops', good ? '#A8EBC4' : '#FFC1B5')}
      <div class="stack" style="gap:4px;min-width:0"><h3>${title}</h3>${detail}
        ${!good && ans ? `<p>Answer: <b ${ex.t === 'tone' ? '' : 'class="th" lang="th"'}>${ans}</b></p>` : ''}
        ${why ? `<p class="small">${why}</p>` : ''}${!good && ex.t !== 'match' ? '<p class="small"><b>This one will come back at the end of the lesson.</b></p>' : ''}</div></div>
    <button class="btn big ${good ? 'go' : 'warm'}" data-p="next" autofocus>Continue</button>
  </div></footer>`;
}

function renderResult() {
  const score = P.score, pass = P.pass, ok = score >= pass;
  const missed = [...P.missed].filter(c => L[c]);
  return `<div class="play result c-${P.color}"><main class="play-body center">
    ${jai(130, ok ? 'cheer' : 'think', ok ? '#C9B6FF' : '#FFD0B3', 'bob')}
    <p class="eyebrow">${P.test ? 'Test result' : 'Lesson result'}</p>
    <h1>${esc(P.title)}</h1>
    <div class="scorebig ${ok ? 'pass' : 'fail'}"><b>${score}%</b><span>right on the first try · pass mark ${pass}%</span></div>
    <p class="statusline ${ok ? 'ok' : 'warn'}">${ok ? (P.test ? 'Passed ✓' : 'Completed ✓') : 'Needs more practice'}</p>
    ${!ok ? `<p>${P.test ? 'Review the items below, then take the test again.' : 'Go through the lesson once more — the parts you missed will make more sense the second time.'}</p>` : ''}
    ${missed.length ? `<div class="stack" style="align-items:center"><p class="small"><b>Letters to practise</b> (added to your review list):</p><div class="wordlist">${missed.map(c => `<button class="wchip" data-say="${L[c].say} ${L[c].word}"><span class="th" lang="th">${c}</span><small lang="th">${L[c].say} ${L[c].word} · ${L[c].rom}</small></button>`).join('')}</div></div>` : ''}
    <div class="stack" style="width:100%;max-width:380px">
      ${ok && P.nextTitle ? `<button class="btn big block" data-p="finish" data-to="next">Next: ${esc(P.nextTitle)} ${ic('arrow')}</button>` : ''}
      ${!ok ? `<button class="btn big block" data-p="finish" data-to="retry">${P.test ? 'Take the test again' : 'Practise again'}</button>` : ''}
      <button class="btn line block" data-p="finish" data-to="map">Back to my path</button>
    </div>
  </main></div>`;
}

/* ---------- actions ---------- */
export function playerAction(btn, rerender) {
  const a = btn.dataset.p, ex = cur();
  switch (a) {
    case 'quit': P.quit = true; break;
    case 'stay': P.quit = false; break;
    case 'leave': P = null; return onExit({ to: 'map' });
    case 'rom': P.showRom = !P.showRom; break;
    case 'en': P.showEn = true; break;
    case 'sel': if (P.phase === 'answer') P.sel = +btn.dataset.i; break;
    case 'build': P.built.push(+btn.dataset.k); break;
    case 'unbuild': P.built.splice(+btn.dataset.j, 1); break;
    case 'clear': P.strokes.length = 0; break;
    case 'ml': P.left = +btn.dataset.i; P.miss = null; break;
    case 'mr': {
      const r = +btn.dataset.i;
      if (P.left === null) { P.miss = null; break; }
      if (r === P.left) { P.matched.push(r); const c = ex.pairs[r][0]; if (L[c]) say(`${L[c].say} ${L[c].word}`); P.left = null; P.miss = null; }
      else { P.miss = [P.left, r]; P.matchMiss++; const c = ex.pairs[P.left][0]; if (L[c]) P.missed.add(c); P.left = null; }
      if (P.matched.length === ex.pairs.length) {
        P.ok = true; P.phase = 'feedback'; P.done++; if (!P.matchMiss && !ex._retry) P.right++;
        (ex.keys || []).forEach(c => seeLetter(c, !P.missed.has(c))); save();
      }
      break;
    }
    case 'check': return check(rerender);
    case 'next': next(); break;
    case 'finish': { const r = { to: btn.dataset.to, id: P.id, passed: P.score >= P.pass }; P = null; return onExit(r); }
  }
  rerender();
}

async function check(rerender) {
  const ex = cur();
  if (ex.t === 'trace' || ex.t === 'write') {
    P.checking = true; rerender();
    P.shape = await shapeScore(ex.c, P.strokes, ex.t === 'write');
    P.checking = false;
    P.ok = P.shape >= (ex.t === 'trace' ? PASS.trace : PASS.write);
  } else if (ex.t === 'build') P.ok = P.built.map(k => tileOf(ex, k)[0]).join('|') === ex.ans.map(a => a[0]).join('|');
  else if (ex.t === 'tone') P.ok = TONES[P.sel] === ex.a;
  else P.ok = P.sel === ex.a;
  P.phase = 'feedback';
  if (ex.key) { seeLetter(ex.key, P.ok); save(); }
  if (P.ok) { P.done++; if (!ex._retry) P.right++; if (ex.t === 'build' && ex.sayWord) say(ex.sayWord); }
  else {
    P.wrong++; if (ex.key) P.missed.add(ex.key);
    if ((ex._retry || 0) < 2) P.list.push({ ...ex, _retry: (ex._retry || 0) + 1 });
    else P.done++;
  }
  rerender();
}

function next() {
  const ex = cur();
  if (!scoredStep(ex)) { /* teaching step */ }
  P.i++;
  if (P.i >= P.list.length) {
    P.score = Math.round(P.right / Math.max(1, P.scored) * 100);
    addPoints(P.right * 2);
    recordResult(P.id, P.score, P.pass, [...P.missed]);
    if (P.words) P.words.forEach(w => { if (!S.words.includes(w)) S.words.push(w); });
    save(); P.phase = 'result'; return;
  }
  P.phase = 'answer'; prep();
}

// After the HTML is on the page, attach the writing pad if this step has one.
export function mountPlayer(rerender) {
  if (!P || P.phase === 'result') return;
  const ex = cur(), cv = document.getElementById('pad');
  if (!cv || !['trace', 'write'].includes(ex.t)) return;
  mountPad(cv, { c: ex.c, guide: ex.t === 'trace', strokes: P.strokes, reveal: P.phase === 'feedback', locked: P.phase === 'feedback',
    onChange: () => { const b = document.querySelector('[data-p="check"]'); if (b) b.disabled = P.strokes.length === 0; } });
}

export function playerKey(e, rerender) {
  if (!P || P.phase === 'result') return;
  const ex = cur();
  if (/^[1-5]$/.test(e.key) && P.phase === 'answer' && ['choose', 'listen', 'tone', 'chat'].includes(ex.t)) {
    const n = +e.key - 1, max = ex.t === 'tone' ? 5 : ex.o.length; if (n < max) { P.sel = n; rerender(); }
  }
  if (e.key === 'Enter' && !e.target.matches('input,textarea,button')) {
    e.preventDefault();
    if (P.phase === 'feedback' || !scoredStep(ex)) { next(); rerender(); }
    else if ((P.sel !== null && ['choose', 'listen', 'tone', 'chat'].includes(ex.t)) || (ex.t === 'build' && P.built.length)) check(rerender);
  }
}
