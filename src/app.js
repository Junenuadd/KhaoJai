// KhaoJai — app shell, routing and screens. Guest mode: no sign-up, progress stays on this device.
import { S, save, resetAll, todayPoints, DAILY_GOAL } from './store.js';
import { LINES, ORDER, STATIONS, TIME_DRILL, WORDS } from './data/lessons.js';
import { DICT, DECODE_EXAMPLES, decode } from './data/decoder.js';
import { ic, jai, esc, toast, say, shuffle } from './ui.js';
import { P, startLesson, renderPlayer, playerAction, playerKey } from './player.js';
import { PLANS, checkoutSheet, wireCheckout, stopQr } from './checkout.js';

const ROUTES = ['map', 'practice', 'decoder', 'me', 'homework', 'plans', 'play'];
const NAV = [['map', 'Learn', 'map'], ['practice', 'Practice', 'practice'], ['decoder', 'Decoder', 'decoder'], ['me', 'Me', 'me']];
let route = 'map';
let billing = 'monthly';
let dText = DECODE_EXAMPLES[0];
let fc = { i: 0, flip: false };

/* ---------- routing ---------- */
function go(r) {
  if (!ROUTES.includes(r) || (r === 'play' && !P)) r = 'map';
  route = r;
  if (r !== 'play') { try { history.replaceState(null, '', '#' + r); } catch (e) {} }
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ROUTES.includes(h) && h !== route && h !== 'play') { closeSheet(); route = h; render(); } });

function nav() {
  const cur = ['homework', 'plans'].includes(route) ? 'me' : route;
  document.getElementById('sidenav').innerHTML = NAV.map(([r, l, i]) => `<button class="sidelink" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></button>`).join('')
    + `<button class="sidelink" data-go="homework" ${route === 'homework' ? 'aria-current="page"' : ''}>${ic('homework')}<span>Homework</span></button>`
    + `<button class="sidelink" data-go="plans" ${route === 'plans' ? 'aria-current="page"' : ''}>${ic('star')}<span>Plus</span></button>`;
  document.getElementById('tabbar').innerHTML = NAV.map(([r, l, i]) => `<button class="tab" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></button>`).join('');
}

function topbar() {
  return `<header class="topbar">
    <a class="logo" href="#map" data-go="map">${jai(36)}<span>Khao<b>Jai</b></span></a>
    <div class="row nowrap">
      <span class="chip sun" title="Days in a row">${ic('sun')} ${S.streak}</span>
      <span class="chip lav" title="Jai points">${ic('bubble')} ${S.points}</span>
    </div></header>`;
}

/* ---------- learning map ---------- */
const nextStation = () => ORDER.find(id => !S.done[id]);
function stationState(id) {
  if (S.done[id]) return 'done';
  if (id === nextStation()) return 'now';
  return S.unlockAll ? 'open' : 'locked';
}
function goalRing(size = 64) {
  const v = Math.min(1, todayPoints() / DAILY_GOAL), c = 2 * Math.PI * 15;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 36 36" role="img" aria-label="Daily goal ${todayPoints()} of ${DAILY_GOAL} points"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-l)" stroke-width="5"/>${v > 0 ? `<circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-d)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(v * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 18 18)"/>` : ''}</svg>`;
}
function sidePanel() {
  return `<aside class="panel stack">
    <div class="card c-lemon-l row nowrap">${goalRing()}<div><p class="eyebrow">Today's goal</p><p class="big-num">${todayPoints()} / ${DAILY_GOAL}</p><p class="small muted">Jai points</p></div></div>
    <div class="card c-mint-l stack"><div class="row between"><h3>Word bank</h3><span class="pill">${S.words.length}</span></div>
      <div class="wordlist">${S.words.slice(-6).reverse().map(w => `<button class="wchip" data-say="${w}"><span class="th" lang="th">${w}</span><small>${WORDS[w] ? WORDS[w][1] : ''}</small></button>`).join('') || '<p class="small muted">Words you learn land here.</p>'}</div></div>
    <div class="card c-lav-l stack">${jai(48, 'happy')}<h3>Want a real Thai person to check your homework?</h3><button class="btn soft" data-go="homework">Homework Studio</button></div>
  </aside>`;
}
function vMap() {
  const nxt = nextStation();
  return `${topbar()}
  <div class="map-layout">
    <div class="stack gap-l">
      <section class="hello card c-lav-l">
        <div class="stack" style="gap:2px;min-width:0"><p class="th hello-th" lang="th">สวัสดี!</p>
          <p class="muted"><span class="rom">sà-wàt-dii</span> · ${S.points ? 'Welcome back. Your next station is waiting.' : 'Hop on the Hello Line. No sign-up needed.'}</p>
          ${nxt ? `<button class="btn big" data-station="${nxt}" style="align-self:flex-start;margin-top:10px">${ic('play')} ${S.points ? 'Continue' : 'Start'}: ${STATIONS[nxt].en}</button>` : '<p><b>You finished every station so far. More lines are coming!</b></p>'}
        </div>${jai(110, 'happy', '#C9B6FF', 'bob hide-xs')}
      </section>
      <div class="goal-mobile card c-lemon-l row nowrap">${goalRing(52)}<div style="flex:1"><p class="eyebrow">Today's goal</p><p><b>${todayPoints()} / ${DAILY_GOAL}</b> Jai points</p></div><span class="chip sun">${ic('sun')} ${S.streak} day${S.streak === 1 ? '' : 's'}</span></div>
      ${LINES.map(line => `
      <section class="line l-${line.color}">
        <div class="sign"><span class="lineno">${line.n}</span><div><p class="th" lang="th">${line.th}</p><h2>${line.en}</h2></div></div>
        <ol class="rail">
          ${line.stations.map(id => { const st = STATIONS[id], s = stationState(id), best = S.done[id]?.best;
            return `<li class="stop ${s} ${st.mission ? 'mission' : ''}">
              <button class="stopbtn" data-station="${id}" aria-label="${st.en}${s === 'locked' ? ' (locked)' : ''}">
                <span class="dot">${s === 'done' ? ic('check') : s === 'locked' ? ic('lock') : st.mission ? ic('flag') : ic('play')}</span>
                <span class="plate"><span class="th" lang="th">${st.th}</span><b>${st.en}</b>
                  <small>${st.mission ? 'Real-life mission · ' : ''}${st.ex.length} exercises${best !== undefined ? ` · best ${best}%` : ''}</small></span>
                ${s === 'now' ? `<span class="here">${jai(46, 'cheer')}<span class="here-tag">You're here</span></span>` : ''}
              </button></li>`; }).join('')}
        </ol>
      </section>`).join('')}
      <p class="small muted center">More lines on the way: Market, Taxi & Transport, Family, Work, Regional Thai.</p>
    </div>
    ${sidePanel()}
  </div>`;
}

function openStation(id) {
  const st = STATIONS[id], s = stationState(id);
  if (s === 'locked') return toast('Finish the station before this one first. (You can unlock everything in Me → Settings while testing.)');
  const line = LINES.find(l => l.stations.includes(id));
  startLesson({ id, title: st.en, exercises: st.ex, color: line.color, mission: !!st.mission, words: st.words }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function startDrill(kind) {
  let ex = [], title = '', color = 'mint';
  if (kind === 'time') { ex = TIME_DRILL; title = 'Thai time & money'; color = 'mint'; }
  if (kind === 'tone') { ex = STATIONS.s7.ex.filter(e => e.t === 'tone'); title = 'Tone trainer'; color = 'lemon'; }
  if (kind === 'mix') {
    const pool = ORDER.filter(id => S.done[id]).flatMap(id => STATIONS[id].ex.filter(e => e.t !== 'match'));
    ex = shuffle(pool.length ? pool : STATIONS.s1.ex, Date.now() % 997).slice(0, 6); title = 'Review mix'; color = 'pink';
  }
  startLesson({ id: null, title, exercises: ex, color, words: [] }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function afterLesson(finished) { go(finished ? 'map' : 'map'); if (finished) toast('Saved on this device. Nice work!'); }

/* ---------- practice ---------- */
function vPractice() {
  const words = S.words.length ? S.words : ['สวัสดี', 'ขอบคุณ', 'ไม่เป็นไร'];
  const w = words[fc.i % words.length], info = WORDS[w] || ['', ''];
  return `${topbar()}<div class="pagehead"><h1>Practice</h1><p class="muted">Short drills. Mistakes come back until they stick.</p></div>
  <div class="grid g3">
    <button class="card drill c-pink-l" data-drill="mix">${jai(56, 'think', '#FFB8D9')}<h3>Review mix</h3><p class="small">6 questions from stations you finished</p></button>
    <button class="card drill c-mint-l" data-drill="time"><span class="clockface">19:00</span><h3>Thai time & money</h3><p class="small">หนึ่งทุ่ม, บ่ายโมง, baht & satang</p></button>
    <button class="card drill c-lemon-l" data-drill="tone"><span class="th toneglyph" lang="th">ป้า</span><h3>Tone trainer</h3><p class="small">Hear and pick the five tones</p></button>
  </div>
  <section class="card stack c-lav-l">
    <div class="row between"><h2>Word cards</h2><span class="pill">${fc.i % words.length + 1} / ${words.length}${S.words.length ? '' : ' · starter set'}</span></div>
    <button class="flash ${fc.flip ? 'flipped' : ''}" id="flash" aria-label="Flip card"><span class="flash-in">
      <span class="face"><span class="th big" lang="th">${w}</span><span class="small muted">Tap to flip</span></span>
      <span class="face back"><span class="rom">${info[0]}</span><b>${info[1]}</b></span></span></button>
    <div class="row nowrap"><button class="btn line" data-say="${w}" aria-label="Listen">${ic('sound')}</button>
      <button class="btn line grow" data-rate="again">Again</button><button class="btn line grow" data-rate="good">Good</button><button class="btn grow" data-rate="easy">Easy</button></div>
  </section>
  <section class="stack"><h2>Coming next</h2><div class="grid g3">
    ${[['AI conversation', 'Talk with Jai about food, family, travel', 'peach'], ['Reply Lab', 'Polite, cute, direct or distant replies', 'sky'], ['Handwriting', 'Trace letters and write from sound', 'lav']].map(([t, s, c]) => `<div class="card c-${c}-l soon"><span class="pill">Soon</span><h3>${t}</h3><p class="small">${s}</p></div>`).join('')}
  </div></section>`;
}

/* ---------- decoder ---------- */
function vDecoder() {
  const segs = decode(dText), cols = ['lav', 'sky', 'mint', 'peach', 'pink', 'lemon'];
  return `${topbar()}<div class="pagehead"><h1>Thai Decoder</h1><p class="muted">Paste a word or a chat message. We explain it and never silently "fix" your text.</p></div>
  <section class="card c-pink-l stack">
    <label for="dIn" class="lbl">What does this mean?</label>
    <textarea id="dIn" class="input th decode-in" lang="th">${esc(dText)}</textarea>
    <div class="chips">${DECODE_EXAMPLES.map(x => `<button class="chip th" lang="th" data-ex="${esc(x)}">${esc(x)}</button>`).join('')}</div>
    <div class="row"><button class="btn" id="dGo">${ic('sparkle')} Decode</button><button class="btn line" data-toast="Photo and voice search come in a later version.">${ic('upload')} Photo</button></div>
  </section>
  <div class="grid g2">${segs.map((seg, k) => {
    if (seg.laugh) return `<article class="card c-lemon-l seg"><div class="row"><span class="src">${seg.src}</span><span class="pill">Chat laughter</span></div>
      <p>"5" is pronounced <b>hâa</b> in Thai, so 555 sounds like "ha ha ha". ${seg.src.length >= 6 ? 'A long string usually means a bigger laugh, but it can also be sarcastic.' : 'A short 555 can be a real laugh or a polite one.'}</p><span class="pill warn">Confidence: depends on context</span></article>`;
    if (seg.unknown) return `<article class="card seg"><div class="row"><span class="src th" lang="th">${esc(seg.src)}</span><span class="pill warn">Not in the sample list</span></div><p class="small muted">This early version knows about 25 words. The full app explains anything and says how sure it is.</p></article>`;
    const d = DICT[seg.key];
    return `<article class="card c-${cols[k % cols.length]}-l seg">
      <div class="row"><span class="src th" lang="th">${esc(seg.src)}</span><span class="pill ${/shorthand|Casual/.test(d.reg) ? 'info' : 'ok'}">${d.reg}</span>${seg.stretch ? '<span class="pill info">Stretched for emphasis</span>' : ''}</div>
      <dl class="kv"><dt>Standard</dt><dd class="th" lang="th">${d.std}</dd><dt>Say it</dt><dd class="rom">${d.rom}</dd><dt>Meaning</dt><dd>${d.mean}</dd>
      ${d.note || seg.stretch ? `<dt>Good to know</dt><dd>${seg.stretch ? 'Repeating the last letter makes it stronger, like "soooo". ' : ''}${d.note}</dd>` : ''}
      ${d.conf ? `<dt>Confidence</dt><dd><span class="pill warn">${d.conf}</span></dd>` : ''}</dl>
      <div class="row"><button class="btn line" data-say="${d.std}">${ic('sound')} Listen</button><button class="btn line" data-save="${d.std}">${ic('save')} Save</button></div></article>`;
  }).join('')}</div>`;
}

/* ---------- me ---------- */
function weekStrip() {
  const days = []; const today = new Date();
  for (let i = 6; i >= 0; i--) { const d = new Date(today); d.setDate(d.getDate() - i); days.push(d); }
  const last = S.lastDay ? new Date(S.lastDay + 'T12:00:00') : null;
  return days.map(d => {
    const k = d.toISOString().slice(0, 10);
    let lit = false;
    if (last) { const diff = Math.round((last - new Date(k + 'T12:00:00')) / 864e5); lit = diff >= 0 && diff < S.streak; }
    return `<span class="day ${lit ? 'lit' : ''} ${k === today.toISOString().slice(0, 10) ? 'today' : ''}"><small>${d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</small>${lit ? ic('sun') : '<i></i>'}</span>`;
  }).join('');
}
function badges() {
  const d = id => !!S.done[id];
  return [
    ['First stop', 'Finish any station', Object.keys(S.done).length > 0, 'lav'],
    ['Hello Line', 'All of line 1', d('s1') && d('s2') && d('m1'), 'pink'],
    ['Café regular', 'All of line 2', d('s3') && d('s4'), 'mint'],
    ['Chat decoder', 'Finish Chat Like a Thai', d('s5'), 'sky'],
    ['Tone tamer', 'Finish the Tone Line', d('s7'), 'lemon'],
    ['100 points', 'Earn 100 Jai points', S.points >= 100, 'peach']
  ].map(([t, s, got, c]) => `<div class="badge ${got ? 'got c-' + c + '-l' : ''}"><span class="medal c-${c}">${got ? ic('star') : ic('lock')}</span><b>${t}</b><small>${s}</small></div>`).join('');
}
function vMe() {
  const row = (icon, title, sub, ctrl, forId) => `<div class="setting"><${forId ? `label for="${forId}"` : 'span'} class="row nowrap">${ic(icon)}<span><b>${title}</b>${sub ? `<br><span class="small muted">${sub}</span>` : ''}</span></${forId ? 'label' : 'span'}>${ctrl}</div>`;
  const tog = (id, on, label) => `<label class="toggle"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${label}"><span></span></label>`;
  return `${topbar()}
  <section class="card c-lav-l row nowrap me-head">${jai(84, 'happy')}
    <div class="stack" style="gap:4px;min-width:0"><h1>Guest learner</h1><p class="small">Playing without an account. Progress is saved on this device only.</p><span class="pill">Accounts & sync: coming soon</span></div></section>
  <div class="stats4">
    <div class="stat c-lemon-l"><b>${S.streak}</b><span>days in a row</span></div>
    <div class="stat c-lav-l"><b>${S.points}</b><span>Jai points</span></div>
    <div class="stat c-mint-l"><b>${Object.keys(S.done).length}</b><span>stations</span></div>
    <div class="stat c-pink-l"><b>${S.words.length}</b><span>words</span></div>
  </div>
  <div class="grid g2">
    <section class="card stack"><h2>This week</h2><div class="week">${weekStrip()}</div><p class="small muted">A sun for every day you learned. Missing a day just starts a new run — no penalty.</p></section>
    <section class="card stack"><h2>Badges</h2><div class="badges">${badges()}</div></section>
  </div>
  <div class="grid g2">
    <button class="card tile c-mint-l" data-go="homework">${ic('homework')}<span><b>Homework Studio</b><br><span class="small">AI check or a real Thai reviewer</span></span>${ic('chev')}</button>
    <button class="card tile c-lemon-l" data-go="plans">${ic('star')}<span><b>KhaoJai Plus</b><br><span class="small">Plans & payment (demo)</span></span>${ic('chev')}</button>
  </div>
  <section class="card"><h2>Settings</h2>
    ${row('globe', 'Explain things in', 'More languages come later', `<select id="sLang" class="input auto">${['English', '中文', '日本語', '한국어', 'Français', 'Deutsch', 'Español'].map(l => `<option ${l === S.explainLang ? 'selected' : ''}>${l}</option>`).join('')}</select>`, 'sLang')}
    ${row('sound', 'Sound', 'Play Thai audio', tog('sSound', S.sound, 'Sound'))}
    ${row('lock', 'Adult language lessons', 'Insults & profanity line, 18+ (coming soon)', tog('sAdult', S.adult, 'Adult language lessons'))}
    ${row('map', 'Unlock all stations', 'Handy while testing the app', tog('sUnlock', S.unlockAll, 'Unlock all stations'))}
    ${row('phone', 'Install on your phone or computer', 'iPhone, Android, Windows, Mac', '<button class="btn line" id="sInstall">How</button>')}
    ${row('trash', 'Reset progress', 'Start again from the first station', '<button class="btn line" id="sReset">Reset</button>')}
  </section>
  <p class="small muted center">KhaoJai early preview · v0.3</p>`;
}

/* ---------- homework ---------- */
function vHomework() {
  const st = { ai: ['info', 'sparkle', 'Checked by AI'], queue: ['warn', 'homework', 'Waiting for a person'], human: ['ok', 'person', 'Reviewed by a Thai reviewer'] };
  const sample = [{ title: 'Message to my partner\'s mom (writing)', status: 'human', note: 'Sample review · Natural 4/5 · Politeness 5/5. Add ค่ะ after the thank-you; คุณแม่ sounds warmer than คุณ here.', date: 'Example' }];
  const list = [...S.homework, ...sample];
  return `${topbar()}<div class="pagehead"><h1>Homework Studio</h1><p class="muted">Send writing, a photo of handwriting, or a voice clip.</p></div>
  <div class="grid g2">
    <form class="card c-mint-l stack" id="hwForm" novalidate>
      <h2>New homework</h2>
      <div class="field"><label for="hwTitle">What is it?</label><input id="hwTitle" class="input" placeholder="e.g. Ordering at a street-food stall"></div>
      <div class="field"><label for="hwText">Your Thai (optional if you attach a file)</label><textarea id="hwText" class="input th" lang="th" placeholder="พิมพ์ภาษาไทยที่นี่"></textarea></div>
      <label class="drop" for="hwFile">${ic('upload')}<b>Attach a photo or voice clip</b><span class="small" id="hwFileName">JPG, PNG, M4A or MP3</span></label>
      <input id="hwFile" type="file" accept="image/*,audio/*" hidden>
      <fieldset class="stack plain-fs"><legend class="lbl">Who checks it?</legend><div class="pmg">
        <label class="rc"><input type="radio" name="hwWho" id="hwAi" value="ai" checked><span class="dot"></span><span><b>AI check</b><br><span class="small muted">Included</span></span></label>
        <label class="rc"><input type="radio" name="hwWho" id="hwHuman" value="human"><span class="dot"></span><span><b>Thai reviewer</b><br><span class="small muted">1 credit · you have ${S.credits}</span></span></label>
      </div></fieldset>
      <p class="err" id="hwErr" role="alert"></p>
      <button class="btn block" type="submit">Send homework</button>
    </form>
    <section class="stack">
      <div class="card c-lav-l row between nowrap"><div><p class="eyebrow">Review credits</p><p class="big-num">${S.credits}</p><p class="small">We show the real queue instead of promising a fixed time.</p></div><button class="btn soft" data-go="plans">Get credits</button></div>
      ${list.map(h => `<article class="card hw"><div class="row between"><b>${esc(h.title)}</b><span class="small muted">${h.date}</span></div>
        <span class="pill ${st[h.status][0]}">${ic(st[h.status][1])} ${st[h.status][2]}</span><p class="small">${esc(h.note)}</p></article>`).join('')}
    </section>
  </div>`;
}

/* ---------- plans ---------- */
const baht = n => n === 0 ? '฿0' : '฿' + n.toLocaleString('en-US');
function vPlans() {
  return `${topbar()}<div class="pagehead"><h1>KhaoJai Plus</h1><p class="muted">AI for everyday practice. Real people for deep feedback.</p></div>
  <div class="row between"><div class="seg" role="group" aria-label="Billing period"><button data-bill="monthly" aria-pressed="${billing === 'monthly'}">Monthly</button><button data-bill="yearly" aria-pressed="${billing === 'yearly'}">Yearly · save 23%</button></div><span class="demo">Sample prices · demo checkout</span></div>
  <div class="plans">${Object.entries(PLANS).map(([k, p]) => { const v = (billing === 'yearly' && !p.once) ? p.y : p.m; return `<article class="card plan c-${p.color === 'white' ? 'white' : p.color + '-l'}">
    ${k === 'plus' ? '<span class="pill hot">Most popular</span>' : '<span class="pill" style="visibility:hidden">·</span>'}
    <h2>${p.name}</h2><p><span class="price">${baht(v)}</span> <span class="muted">${p.m === 0 ? 'forever' : p.once ? 'one-time' : billing === 'yearly' ? '/ year' : '/ month'}</span></p>
    <ul>${p.f.map(x => `<li>${ic('check')}<span>${x}</span></li>`).join('')}</ul>
    ${k === 'free' ? '<button class="btn line block" disabled>You\'re on Free</button>' : `<button class="btn block ${k === 'review' ? 'soft' : ''}" data-buy="${k}" ${k === 'plus' && S.plan === 'plus' ? 'disabled' : ''}>${k === 'plus' ? (S.plan === 'plus' ? 'Active' : 'Get Plus') : 'Buy 5 reviews'}</button>`}
  </article>`; }).join('')}</div>
  <section class="card stack"><h3>Ways to pay</h3><div class="chips">${['Visa', 'Mastercard', 'JCB', 'AmEx', 'UnionPay', 'PromptPay', 'TrueMoney', 'K PLUS', 'SCB', 'Krungthai', 'Apple Pay', 'Google Pay', 'PayPal'].map(x => `<span class="chip">${x}</span>`).join('')}</div>
  <p class="small muted">This checkout is a demo and never charges. In the iPhone and Android stores, subscriptions may have to use Apple / Google billing; this is checked before launch.</p></section>`;
}

/* ---------- sheets ---------- */
let sheet = null, co = null;
function openSheet(k) { sheet = k; paintSheet(); }
function closeSheet() { sheet = null; stopQr(); paintSheet(); }
function paintSheet() {
  const L = document.getElementById('layer');
  if (!sheet) { L.innerHTML = ''; return; }
  const html = sheet === 'checkout' ? checkoutSheet(co, billing) : installSheet();
  const y = L.querySelector('.sheet')?.scrollTop || 0;
  L.innerHTML = `<div class="scrim" data-scrim><div class="sheet" role="dialog" aria-modal="true" aria-label="${sheet}"><span class="grab"></span>${html}</div></div>`;
  L.querySelector('.sheet').scrollTop = y;
  if (sheet === 'checkout') wireCheckout(co, paintSheet, () => {
    if (co.item === 'plus') { S.plan = 'plus'; S.credits += 1; } if (co.item === 'review') S.credits += 5; save(); render();
  });
}
function installSheet() {
  return `<div class="sheet-head c-mint-l">${jai(56, 'cheer')}<div style="flex:1"><h2>Put KhaoJai on your home screen</h2><p class="small">Open the KhaoJai web address first, then:</p></div><button class="iconbtn" data-close aria-label="Close">${ic('close')}</button></div>
  ${[['sky', 'iPhone / iPad', 'In Safari tap Share → Add to Home Screen'], ['mint', 'Android', 'In Chrome tap ⋮ → Install app (or Add to Home screen)'], ['lav', 'Windows', 'In Chrome or Edge click the install icon at the right of the address bar'], ['pink', 'Mac', 'In Chrome or Edge click Install; in Safari choose File → Add to Dock']].map(([c, t, s]) => `<div class="card c-${c}-l"><b>${t}</b><p class="small">${s}</p></div>`).join('')}
  <p class="small muted">It opens full-screen like an app and keeps working with a weak connection.</p>`;
}

/* ---------- render ---------- */
function render() {
  document.body.classList.toggle('playing', route === 'play');
  const main = document.getElementById('main');
  if (route === 'play') main.innerHTML = renderPlayer();
  else main.innerHTML = `<div class="view">${({ map: vMap, practice: vPractice, decoder: vDecoder, me: vMe, homework: vHomework, plans: vPlans })[route]()}</div>`;
  nav();
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); closeSheet(); return go(g.dataset.go); }
  const t = e.target.closest('button,[data-scrim]'); if (!t) return;
  if (t.matches('[data-scrim]')) { if (e.target === t) closeSheet(); return; }
  const d = t.dataset;
  if (d.say) return say(d.say);
  if (d.saySlow) return say(d.saySlow, 0.55);
  if (d.p) return playerAction(t, render);
  if (d.toast) return toast(d.toast);
  if (d.station) return openStation(d.station);
  if (d.drill) return startDrill(d.drill);
  if (t.hasAttribute('data-close')) return closeSheet();
  if (d.save) { if (!S.words.includes(d.save)) { S.words.push(d.save); save(); } return toast(`Saved "${d.save}" to your word bank`); }
  if (d.ex) { dText = d.ex; return render(); }
  if (t.id === 'dGo') { dText = document.getElementById('dIn').value; return render(); }
  if (t.id === 'flash') { fc.flip = !fc.flip; t.classList.toggle('flipped', fc.flip); return; }
  if (d.rate) { fc.i++; fc.flip = false; toast(d.rate === 'again' ? 'This card comes back soon.' : d.rate === 'good' ? 'See you tomorrow, card.' : 'Next review in a few days.'); return render(); }
  if (d.bill) { billing = d.bill; return render(); }
  if (d.buy) { co = { item: d.buy, method: 'card', step: 'form' }; return openSheet('checkout'); }
  if (t.id === 'sInstall') return openSheet('install');
  if (t.id === 'sReset') {
    if (d.armed) { resetAll(); toast('Progress reset. Back to the first station.'); return go('map'); }
    d.armed = '1'; t.textContent = 'Tap again to reset'; return;
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'sLang') { S.explainLang = t.value; save(); toast(t.value === 'English' ? 'Explanations in English.' : `${t.value} explanations are coming. English for now.`); }
  if (t.id === 'sSound') { S.sound = t.checked; save(); }
  if (t.id === 'sAdult') { S.adult = t.checked; save(); toast(S.adult ? 'The 18+ line will appear when it\'s ready.' : 'Adult lessons hidden.'); }
  if (t.id === 'sUnlock') { S.unlockAll = t.checked; save(); toast(S.unlockAll ? 'All stations unlocked.' : 'Stations unlock in order again.'); }
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
  S.homework.unshift({ title, status: human ? 'queue' : 'ai', date: new Date().toLocaleDateString('en-GB'),
    note: human ? 'In the queue for a Thai reviewer. We\'ll show your place in line and an honest estimate.' : 'AI checking is coming soon. Your homework is saved on this device.' });
  save(); toast(human ? 'Sent to the review queue. 1 credit used.' : 'Saved. AI checking is coming soon.'); render();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && sheet) return closeSheet();
  if (route === 'play') return playerKey(e, render);
  if (e.key === 'Enter' && e.target.id === 'dIn' && (e.metaKey || e.ctrlKey)) { dText = e.target.value; render(); }
});

/* ---------- start ---------- */
const h0 = location.hash.slice(1);
route = ROUTES.includes(h0) && h0 !== 'play' ? h0 : 'map';
render();

// Installable app: register the service worker when hosted (not inside previews).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !location.hostname.endsWith('claude.ai') && !location.hostname.includes('claudeusercontent')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
