// KhaoJai — app shell, routing and screens.
// Journey: Sign in / guest → How KhaoJai teaches → a few questions (+ optional placement) → Dashboard → lessons.
import { S, save, resetAll, todayPoints, dailyGoal, lessonState, isPassed, markPlaced, dueLetters, troubleLetters, knownLetters, skillSummary, seeLetter } from './store.js';
import { PHASES, WRITING, ALL_LESSONS, LESSON, SKILLS, PHASE1_SKILLS, passMark, phaseOf, placementSteps, REVIEW_COVERS, remedialSteps, skillDrill, reviewDrill } from './data/curriculum.js';
import { LETTERS, L, SOUNDS, CLASS_INFO, SAME_SOUND, VOWELS } from './data/letters.js';
import { LINES, STATIONS, TIME_DRILL } from './data/beyond.js';
import { DICT, DECODE_EXAMPLES, decode } from './data/decoder.js';
import { ic, jai, esc, toast, say } from './ui.js';
import { P, startLesson, renderPlayer, playerAction, playerKey, mountPlayer } from './player.js';
import { PLANS, checkoutSheet, wireCheckout, stopQr } from './checkout.js';
import { mountPad, shapeScore, recognize } from './draw.js';
import { PASS, LEVEL } from './config.js';
import * as Auth from './auth.js';

const ROUTES = ['auth', 'notice', 'onboard', 'map', 'letters', 'practice', 'decoder', 'me', 'homework', 'plans', 'play'];
const GATE = ['auth', 'notice', 'onboard'];
const NAV = [['map', 'Learn', 'map'], ['letters', 'ก–ฮ', 'abc'], ['practice', 'Practice', 'practice'], ['decoder', 'Decoder', 'decoder'], ['me', 'Me', 'me']];
let route = 'map', billing = 'monthly', dText = DECODE_EXAMPLES[0];
let openPhase = null, lettersTab = 'chart', studio = { c: 'ก', guide: true, strokes: [], score: null };
let fc = { deck: [], i: 0, flip: false };
let auth = { mode: 'welcome', busy: false, err: '', msg: '', draft: {} };
let onb = null;
const isLetter = c => !!L[c];

/* ---------- unlocking ---------- */
const lessonsOf = ph => ph.lessons;
const phasePassed = n => { const ph = PHASES[n - 1]; return ph.lessons.length > 0 && ph.lessons.every(l => isPassed(l.id)); };
const phaseOpen = ph => S.unlockAll || ph.n === 1 || (ph.n === 2 && phasePassed(1)) || (ph.life && phasePassed(2));
function lessonOpen(id) {
  const l = LESSON[id];
  if (S.unlockAll || lessonState(id) !== 'not_started') return true;
  if (l.phase === 'W') return l.idx === 0 ? isPassed('C2') : isPassed(WRITING.lessons[l.idx - 1].id);
  const ph = PHASES[l.phase - 1];
  if (!phaseOpen(ph)) return false;
  if (l.check) return ph.lessons.filter(x => !x.check).every(x => isPassed(x.id)); // phase checks: any order
  return l.idx === 0 || isPassed(ph.lessons[l.idx - 1].id);
}
function lockReason(id) {
  const l = LESSON[id];
  if (l.phase === 'W') return l.idx === 0 ? 'Pass "Consonants ง–ฌ" (C2) first' : `Pass "${WRITING.lessons[l.idx - 1].title}" first`;
  const ph = PHASES[l.phase - 1];
  if (!phaseOpen(ph)) return `Pass Phase ${ph.n - 1} to unlock`;
  if (l.check) return 'Pass every lesson in this phase to unlock the phase checks';
  return `Pass "${ph.lessons[l.idx - 1].title}" first`;
}
function nextLesson() {
  for (const ph of PHASES) for (const l of ph.lessons) if (!isPassed(l.id) && lessonOpen(l.id)) return l;
  return null;
}
const currentPhase = () => PHASES.find(ph => ph.lessons.length && !phasePassed(ph.n)) || PHASES[1];
const nextAfter = id => { const l = LESSON[id]; const list = l.phase === 'W' ? WRITING.lessons : PHASES[l.phase - 1].lessons; return list[l.idx + 1] || (l.phase === 1 && phasePassed(1) ? PHASES[1].lessons[0] : null); };

const STATUS = { not_started: ['Not started', ''], viewed: ['Viewed', 'info'], practiced: ['Practice done', 'info'], needs_review: ['Needs review', 'warn'], passed: ['Passed', 'ok'] };
const statusPill = id => { const s = lessonState(id), r = S.lessons[id]; const [t, c] = STATUS[s]; return `<span class="pill ${c}">${t}${r?.via === 'placement' ? ' · placement' : r?.testBest && s !== 'not_started' ? ` · ${r.testBest}%` : ''}</span>`; };
const level = pct => pct === null || pct === undefined ? ['Not tested yet', ''] : pct >= LEVEL.strong ? ['Strong', 'ok'] : pct >= LEVEL.developing ? ['Developing', 'info'] : ['Needs review', 'warn'];
const bar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.max(pct ? 2 : 0, pct || 0)}%"></i></div>`;

/* ---------- routing ---------- */
function gateRoute(r) {
  if (!S.entered) return 'auth';
  if (!S.noticeSeen && r !== 'auth') return 'notice';
  if (!S.profile && !['auth', 'notice'].includes(r)) return 'onboard';
  return r;
}
function go(r, sub) {
  if (!ROUTES.includes(r) || (r === 'play' && !P)) r = 'map';
  if (r !== 'play') r = gateRoute(r);
  route = r; if (sub) lettersTab = sub;
  if (r !== 'play') { try { history.replaceState(null, '', '#' + r); } catch (e) {} }
  render(); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (ROUTES.includes(h) && h !== route && h !== 'play') { closeSheet(); stopSing(); route = gateRoute(h); render(); } });

function nav() {
  const gate = GATE.includes(route);
  document.body.classList.toggle('gate', gate);
  const cur = ['homework', 'plans'].includes(route) ? 'me' : route;
  document.getElementById('sidenav').innerHTML = gate ? '' : NAV.map(([r, l, i]) => `<button class="sidelink" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${icon(i)}<span>${r === 'letters' ? 'Letters ก–ฮ' : l}</span></button>`).join('')
    + `<button class="sidelink" data-go="homework" ${route === 'homework' ? 'aria-current="page"' : ''}>${ic('homework')}<span>Homework</span></button>`
    + `<button class="sidelink" data-go="plans" ${route === 'plans' ? 'aria-current="page"' : ''}>${ic('star')}<span>Plus</span></button>`;
  document.getElementById('tabbar').innerHTML = gate ? '' : NAV.map(([r, l, i]) => `<button class="tab" data-go="${r}" ${cur === r ? 'aria-current="page"' : ''}>${icon(i)}<span>${l}</span></button>`).join('');
  const foot = document.querySelector('.side-foot');
  if (foot) foot.innerHTML = gate ? '' : Auth.signedIn() ? `Signed in as<br><b>${esc(Auth.user()?.email || '')}</b><br><button class="linkbtn" id="mOut">Sign out</button>` : `Guest · progress on this device${Auth.configured() ? '<br><button class="linkbtn" id="mSignIn">Sign in or create an account</button>' : ''}`;
}
const icon = n => n === 'abc' ? '<span class="abc" aria-hidden="true">กข</span>' : ic(n);

function topbar() {
  return `<header class="topbar">
    <a class="logo" href="#map" data-go="map">${jai(36)}<span>Khao<b>Jai</b></span></a>
    <div class="row nowrap">
      <span class="chip sun" title="Days in a row">${ic('sun')} ${S.streak}</span>
      <span class="chip lav" title="Letters you know well">${icon('abc')} ${knownLetters(isLetter)}/44</span>
      ${Auth.signedIn() ? `<button class="chip" data-go="me" title="${esc(Auth.user()?.email || 'Account')}">${ic('me')}<span class="hide-xs">Account</span></button>` : Auth.configured() ? `<button class="btn small-btn" id="mSignIn">Sign in</button>` : ''}
    </div></header>`;
}

/* ---------- 1. Sign in / sign up ---------- */
// Sign-in / sign-up screens. Sign-up is three short steps: details → password → 6-digit email code.
const CC = [['+66', 'TH'], ['+1', 'US/CA'], ['+44', 'UK'], ['+61', 'AU'], ['+49', 'DE'], ['+33', 'FR'], ['+81', 'JP'], ['+82', 'KR'], ['+86', 'CN'], ['+65', 'SG'], ['+60', 'MY'], ['+63', 'PH'], ['+91', 'IN'], ['+31', 'NL'], ['+46', 'SE'], ['+7', 'RU'], ['+971', 'AE']];
const heroArt = (small) => `<div class="hart ${small ? 'sm' : ''}" aria-hidden="true">
  <span class="spk s1">✦</span><span class="spk s2">✦</span><span class="spk s3">•</span>
  <span class="blk b1" lang="th">ก</span><span class="blk b2" lang="th">ข</span><span class="blk b3" lang="th">ค</span>
  <span class="hjai">${jai(small ? 70 : 104, 'cheer', '#fff', 'bob')}</span>
  <span class="hbub" lang="th">อ่านได้!</span></div>`;
const authShell = (side, inner) => `<div class="authbg"><div class="apanel">${side}</div><div class="asheet">${inner}</div></div>`;
const sideBrand = (small) => `${heroArt(small)}<div class="abrand"><h1 class="aword">Khao<b>Jai</b></h1><p class="atag">Read Thai from your very first letter</p></div>`;
const stepBar = n => `<div class="steps3" aria-label="Step ${n} of 3">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}<span>Step ${n} of 3</span></div>`;
const backBtn = to => `<button type="button" class="aback" data-amode="${to}" aria-label="Back">←</button>`;
const otpBoxes = () => `<div class="otp" id="otp">${[0, 1, 2, 3, 4, 5].map(i => `<input class="otpbox" inputmode="numeric" autocomplete="${i ? 'off' : 'one-time-code'}" maxlength="1" aria-label="Digit ${i + 1}" data-otp="${i}">`).join('')}</div>`;

function vAuth() {
  const on = Auth.configured(), dr = auth.draft || (auth.draft = {});
  if (!on) return authShell(sideBrand(), `<section class="stack"><h2>Accounts are not switched on yet</h2><p>You can learn as a guest: your progress is saved <b>on this device only</b>.</p><button class="btn big block" id="aGuest">Start as a guest</button></section>`);
  if (auth.mode === 'welcome') return `<div class="welcome">
    <div class="wtop">${heroArt(false)}<h1 class="aword big">Khao<b>Jai</b></h1><p class="atag">Read Thai from your very first letter. Short lessons, real tests, no Thai needed to start.</p></div>
    <div class="wbtm stack">
      <div class="wfeat"><span><b lang="th">ก–ฮ</b>44 letters</span><span><b>5 min</b>a day</span><span><b>Free</b>to start</span></div>
      <button class="btn big block yel" data-amode="signup1">Get started — it's free</button>
      <button class="btn big block line" data-amode="signin">I already have an account</button>
      <button class="linkbtn center" id="aGuest">Just looking? Try it as a guest</button></div></div>`;
  const tiles = up => `<div class="socrow">${SOCIAL.map(([k, label, svg]) => { const ok = Auth.providers[k]; return `<button type="button" class="soc" ${ok ? `data-oauth="${k}"` : 'disabled'} aria-label="${up ? 'Sign up' : 'Sign in'} with ${label}${ok ? '' : ' (coming soon)'}">${svg}<span>${label}</span>${ok ? '' : '<em>soon</em>'}</button>`; }).join('')}</div><div class="ordiv"><span>or with email</span></div>`;
  const submit = (label, busy) => `${authMsgs()}<button class="btn big block" type="submit" ${auth.busy ? 'disabled' : ''}>${auth.busy ? busy : label}</button>`;
  const pwField = (up) => `<div class="field"><label for="aPw">${up ? 'Create a password' : 'Password'}</label><div class="pwwrap"><input id="aPw" class="input" type="password" autocomplete="${up ? 'new-password' : 'current-password'}" required><button type="button" class="pweye" id="aEye" aria-label="Show password">Show</button></div></div>`;
  let body;
  switch (auth.mode) {
    case 'signup1': body = `<form class="stack" id="aSignup1" novalidate>${backBtn('welcome')}${stepBar(1)}
        <div><h2>Create your account</h2><p class="small muted">Your progress is saved to it, on every device.</p></div>${tiles(true)}
        <div class="field"><label for="aName">Your name</label><input id="aName" class="input" autocomplete="name" maxlength="40" value="${esc(dr.name || '')}" placeholder="What should Jai call you?"></div>
        <div class="field"><label for="aEmail">Email</label><input id="aEmail" class="input" type="email" autocomplete="email" value="${esc(dr.email || '')}" placeholder="you@example.com"></div>
        <div class="field"><label for="aPhone">Mobile number <span class="muted">(optional)</span></label><div class="phonerow"><select id="aCC" class="input" aria-label="Country code">${CC.map(([c, n]) => `<option value="${c}" ${(dr.cc || '+66') === c ? 'selected' : ''}>${n} ${c}</option>`).join('')}</select><input id="aPhone" class="input" type="tel" inputmode="tel" autocomplete="tel-national" value="${esc(dr.phone || '')}" placeholder="81 234 5678"></div><p class="small muted">For account help and lesson reminders later. We never share it.</p></div>
        ${submit('Continue', 'Checking…')}
        <p class="small center">Already have an account? <button class="linkbtn" type="button" data-amode="signin">Sign in</button></p></form>`; break;
    case 'signup2': body = `<form class="stack" id="aSignup2" novalidate>${backBtn('signup1')}${stepBar(2)}
        <div><h2>Choose a password</h2><p class="small muted">For <b>${esc(dr.email || '')}</b></p></div>
        ${pwField(true)}
        <ul class="pwrules" id="pwRules"><li data-r="len">At least 8 characters</li><li data-r="mix">Letters and numbers</li></ul>
        <label class="rc agree"><input type="checkbox" id="aAgree"><span class="dot"></span><span class="small">I agree to KhaoJai's terms and privacy policy (early preview).</span></label>
        ${submit('Create account', 'Creating your account…')}</form>`; break;
    case 'verify': body = `<form class="stack" id="aVerify" novalidate>${backBtn(auth.vkind === 'signup' ? 'signup1' : 'signin')}${auth.vkind === 'signup' ? stepBar(3) : ''}
        <div class="center vhead"><span class="mailic" aria-hidden="true">✉️</span><h2>Check your email</h2><p class="small muted">We sent a 6-digit code to<br><b>${esc(dr.email || '')}</b></p></div>
        ${otpBoxes()}
        ${submit(auth.vkind === 'signup' ? 'Verify & finish' : 'Sign in', 'Checking the code…')}
        <p class="small center muted" id="resendRow">${auth.cool > 0 ? `You can ask for a new code in <b id="coolN">${auth.cool}</b>s` : `Didn't get it? Check spam, or <button class="linkbtn" type="button" id="aResend">send a new code</button>`}</p>
        <p class="small center"><button class="linkbtn" type="button" data-amode="${auth.vkind === 'signup' ? 'signup1' : 'signincode'}">Use a different email</button></p></form>`; break;
    case 'signincode': body = `<form class="stack" id="aCode" novalidate>${backBtn('signin')}
        <div><h2>Sign in with a code</h2><p class="small muted">No password needed — we'll email you a 6-digit code.</p></div>
        <div class="field"><label for="aEmail">Email</label><input id="aEmail" class="input" type="email" autocomplete="email" value="${esc(dr.email || '')}"></div>
        ${submit('Email me a code', 'Sending…')}</form>`; break;
    case 'reset': body = `<form class="stack" id="aReset" novalidate>${backBtn('signin')}<div><h2>Reset your password</h2><p class="small muted">We'll email you a link to choose a new password.</p></div>
        <div class="field"><label for="aEmail">Email</label><input id="aEmail" class="input" type="email" autocomplete="email" value="${esc(dr.email || '')}"></div>
        ${submit('Send reset link', 'Sending…')}</form>`; break;
    case 'newpass': body = `<form class="stack" id="aNewPass" novalidate><div><h2>Choose a new password</h2></div>${pwField(true)}
        <ul class="pwrules" id="pwRules"><li data-r="len">At least 8 characters</li><li data-r="mix">Letters and numbers</li></ul>${submit('Save new password', 'Saving…')}</form>`; break;
    default: body = `<form class="stack" id="aForm" novalidate>${backBtn('welcome')}
        <div><h2>Welcome back!</h2><p class="small muted">Sign in to keep learning.</p></div>${tiles(false)}
        <div class="field"><label for="aEmail">Email</label><input id="aEmail" class="input" type="email" autocomplete="email" value="${esc(dr.email || '')}"></div>
        ${pwField(false)}
        <div class="row between"><button class="linkbtn" type="button" data-amode="signincode">Email me a code instead</button><button class="linkbtn" type="button" data-amode="reset">Forgot password?</button></div>
        ${submit('Sign in', 'Signing in…')}
        <p class="small center">New to KhaoJai? <button class="linkbtn" type="button" data-amode="signup1">Create an account</button></p></form>`;
  }
  return authShell(sideBrand(true), `${body}<button class="linkbtn center guestlink" id="aGuest">Continue as a guest</button>`);
}
const SOCIAL = [
  ['google', 'Google', '<svg width="24" height="24" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>'],
  ['apple', 'Apple', '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path fill="#111" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8c1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.4-1-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z"/></svg>'],
  ['facebook', 'Facebook', '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#1877F2"/><path fill="#fff" d="M13.4 22.9v-7.6h2.5l.4-3h-2.9v-1.9c0-.9.3-1.5 1.5-1.5h1.5V6.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H8v3h2.5v7.6z"/></svg>']
];
const authMsgs = () => `${auth.err ? `<p class="err" role="alert">${esc(auth.err)}</p>` : ''}${auth.msg ? `<p class="okmsg" role="status">${esc(auth.msg)}</p>` : ''}`;
const val = id => document.getElementById(id)?.value.trim() || '';
const emailOk = e => /^\S+@\S+\.\S+$/.test(e);
const pwOk = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
function setMode(mode, keepMsg) { auth = { ...auth, mode, busy: false, err: '', msg: keepMsg ? auth.msg : '' }; render(); setTimeout(() => document.querySelector('.asheet input:not([type=checkbox]), .otpbox')?.focus(), 30); }
let coolTimer = null;
function startCool(sec = 60) {
  auth.cool = sec; clearInterval(coolTimer);
  coolTimer = setInterval(() => { auth.cool--; const n = document.getElementById('coolN'); if (auth.cool <= 0) { clearInterval(coolTimer); if (route === 'auth' && auth.mode === 'verify') { const keep = otpValue(); render(); fillOtp(keep); } } else if (n) n.textContent = auth.cool; }, 1000);
}
const otpValue = () => [...document.querySelectorAll('.otpbox')].map(i => i.value).join('');
const fillOtp = s => document.querySelectorAll('.otpbox').forEach((b, i) => { b.value = s[i] || ''; });
async function authStep(kind) {
  const dr = auth.draft; auth.err = ''; auth.msg = '';
  const fail = m => { auth.err = m; auth.busy = false; render(); };
  if (kind === 'signup1') {
    Object.assign(dr, { name: val('aName'), email: val('aEmail'), cc: val('aCC'), phone: val('aPhone').replace(/[^\d]/g, '').replace(/^0/, '') });
    if (!dr.name) return fail('Please tell us your name.');
    if (!emailOk(dr.email)) return fail('Please enter a valid email address.');
    if (dr.phone && !/^\d{6,12}$/.test(dr.phone)) return fail('That mobile number doesn\'t look right. Leave it empty if you prefer.');
    return setMode('signup2');
  }
  const pw = document.getElementById('aPw')?.value || '';
  if ((kind === 'signup2' || kind === 'newpass') && !pwOk(pw)) return fail('Your password needs at least 8 characters, with letters and numbers.');
  if (kind === 'signup2' && !document.getElementById('aAgree')?.checked) return fail('Please tick the box to agree to the terms.');
  if (['signin', 'signincode', 'reset'].includes(kind)) { dr.email = val('aEmail'); if (!emailOk(dr.email)) return fail('Please enter a valid email address.'); }
  if (kind === 'signin' && !pw) return fail('Please enter your password.');
  const code = kind === 'verify' ? otpValue() : '';
  if (kind === 'verify' && !/^\d{6}$/.test(code)) return fail('Please enter all 6 digits of the code.');
  auth.busy = true; render(); if (kind === 'verify') fillOtp(code);
  try {
    if (kind === 'signin') { await Auth.signIn(dr.email, pw); return enterApp(); }
    if (kind === 'signup2') {
      const r = await Auth.signUp(dr.email, pw, { name: dr.name, phone: dr.phone ? dr.cc + dr.phone : '' });
      if (r.signedIn) return enterApp();
      auth.vkind = 'signup'; startCool(); return setMode('verify');
    }
    if (kind === 'signincode') { await Auth.sendLoginCode(dr.email); auth.vkind = 'email'; startCool(); return setMode('verify'); }
    if (kind === 'verify') { await Auth.verifyCode(dr.email, code, auth.vkind); toast(auth.vkind === 'signup' ? `Welcome to KhaoJai, ${dr.name || 'friend'}! 🎉` : 'Signed in.'); return enterApp(); }
    if (kind === 'reset') { await Auth.sendReset(dr.email); auth.msg = 'If an account exists for that email, a reset link is on its way. Check your inbox (and spam).'; }
    if (kind === 'newpass') { await Auth.setNewPassword(pw); toast('Password updated.'); return enterApp(); }
  } catch (e) { auth.err = e.message; }
  auth.busy = false; render(); if (kind === 'verify') fillOtp(code);
}
async function resendCode() {
  const dr = auth.draft; auth.err = ''; auth.msg = '';
  try { auth.vkind === 'signup' ? await Auth.resendSignup(dr.email) : await Auth.sendLoginCode(dr.email); auth.msg = 'A new code is on its way.'; startCool(); }
  catch (e) { auth.err = e.message; }
  render();
}
function enterApp() {
  auth = { mode: 'signin', busy: false, err: '', msg: '', draft: {} };
  if (!S.entered) S.entered = Auth.signedIn() ? 'account' : 'guest';
  save(); go('map');
}

/* ---------- 2. How KhaoJai teaches ---------- */
function vNotice() {
  return `<div class="gatehead">${jai(84, 'cheer', '#C9B6FF', 'bob')}<div><p class="eyebrow">Before you start</p><h1>Welcome to KhaoJai!</h1></div></div>
  <section class="card stack c-lav-l"><h2>Our first goal is to help you read Thai.</h2>
    <p>Unlike methods that begin with memorising vocabulary and sentences, KhaoJai starts by helping you recognise Thai letters, understand their sounds, learn the vowels, and gradually combine them to read Thai words.</p>
    <p>You can use English-letter associations, romanization, picture memory aids and audio in your early lessons. As you improve, you can hide romanization and practise reading Thai on your own.</p></section>
  <section class="card stack"><h2>Your learning journey</h2><ol class="journey">
    ${['Recognise Thai consonants and vowels.', 'Connect Thai characters with their sounds.', 'Learn how consonants and vowels combine to form words.', 'Practise reading Thai without romanization.', 'Learn vocabulary and understand word meanings.', 'Build sentences and learn Thai grammar.', 'Develop listening, speaking, writing and everyday communication.'].map((t, i) => `<li><span class="jn ${i < 4 ? 'now' : ''}">${i + 1}</span><span>${t}${i < 4 ? ' <span class="pill info">Phase 1–2</span>' : ''}</span></li>`).join('')}</ol></section>
  <section class="card stack c-lemon-l"><h3>Important learning notice</h3>
    <p>KhaoJai puts <b>reading Thai first</b>, before vocabulary memorisation, sentence building and grammar.</p>
    <p>You do <b>not</b> need to know any Thai to start. KhaoJai is made for complete beginners: you learn step by step through guided lessons, practice and short tests.</p>
    <p>Romanization and English-letter associations are learning aids, not exact replacements for Thai pronunciation. The goal is to help you feel comfortable reading Thai script directly.</p></section>
  <div class="row"><button class="btn big" id="nStart">${S.noticeSeen ? 'Back to learning' : 'Start learning'} ${ic('arrow')}</button></div>`;
}

/* ---------- 3. Onboarding ---------- */
const QS = [
  ['studied', 'Have you studied Thai before?', [['no', 'No, never'], ['little', 'A little'], ['yes', 'Yes, for a while']]],
  ['letters', 'Can you recognise any Thai letters?', [['none', 'Not yet'], ['some', 'Some of them'], ['most', 'Most or all of them']]],
  ['readWords', 'Can you read Thai words?', [['no', 'No'], ['slowly', 'Slowly, with effort'], ['yes', 'Yes']]],
  ['listen', 'Can you understand spoken Thai?', [['no', 'Not really'], ['some', 'Some words and phrases'], ['yes', 'Yes, quite a lot']]],
  ['reason', 'What is your main reason for learning Thai?', [['names', 'Read Thai names & song titles'], ['ent', 'Understand Thai entertainment (T-Pop, series)'], ['travel', 'Travel in Thailand'], ['people', 'Talk with Thai partner, family or friends'], ['live', 'Live or work in Thailand'], ['other', 'Something else']]],
  ['skills', 'Which skills would you like to build eventually? (choose any)', [['reading', 'Reading'], ['listening', 'Listening'], ['speaking', 'Speaking'], ['writing', 'Writing']], true],
  ['minutes', 'How much time would you like to learn each day?', [['5', '5 minutes'], ['10', '10 minutes'], ['15', '15 minutes'], ['20', '20+ minutes']]]
];
function vOnboard() {
  onb = onb || { ...(S.profile || {}), skills: S.profile?.skills || ['reading'] };
  if (onb.step === 'place') return `<div class="gatehead">${jai(84, 'think', '#C9B6FF')}<div><p class="eyebrow">Almost there</p><h1>You already know some Thai</h1></div></div>
    <section class="card stack c-mint-l"><p>Take a short <b>placement check</b> (about 28 quick questions, 5 minutes). Lessons you show you already know are marked as passed, so you don't have to repeat them.</p>
      <p class="small muted">This only finds a starting point — it is not a proficiency certificate. The checks at the end of each phase still test every skill.</p>
      <div class="row"><button class="btn big" id="oPlace">Take the placement check</button><button class="btn line" id="oSkip">Start from the beginning</button></div></section>`;
  return `<div class="gatehead">${jai(84, 'happy', '#C9B6FF')}<div><p class="eyebrow">A few quick questions</p><h1>Let's find your starting point</h1><p class="muted">Your answers set your daily goal and where you begin. You can change them later in Me.</p></div></div>
  <form id="oForm" class="stack" novalidate>${QS.map(([k, q, opts, multi]) => `<fieldset class="card stack plain-fs"><legend class="lbl" style="font-size:16px">${q}</legend><div class="pmg">${opts.map(([v, t]) => `<label class="rc"><input type="${multi ? 'checkbox' : 'radio'}" name="${k}" value="${v}" ${multi ? (onb[k] || []).includes(v) ? 'checked' : '' : String(onb[k]) === v ? 'checked' : ''}><span class="dot"></span><span>${t}</span></label>`).join('')}</div></fieldset>`).join('')}
    <p class="err" id="oErr" role="alert"></p>
    <button class="btn big" type="submit">Continue ${ic('arrow')}</button></form>`;
}
function onboardSubmit(form) {
  const fd = new FormData(form), p = {};
  for (const [k, , , multi] of QS) p[k] = multi ? fd.getAll(k) : fd.get(k);
  const missing = QS.filter(([k, , , multi]) => !multi && !p[k]);
  if (missing.length) { document.getElementById('oErr').textContent = `Please answer: "${missing[0][1]}"`; return; }
  p.minutes = +p.minutes; S.profile = p; save();
  const knows = p.letters !== 'none' || p.readWords !== 'no';
  if (knows && !S.placed) { onb = { ...p, step: 'place' }; return render(); }
  onb = null; go('map');
}
function startPlacement() {
  startLesson({ id: null, title: 'Placement check', sub: 'Find what you already know', mode: 'placement', color: 'lav', pass: 100,
    steps: [{ t: 'intro', score: false, learn: ['Consonants, vowels and reading', 'One or two questions per lesson'], how: ['Answer on your own — skip-guessing is fine, just pick your best answer', 'Lessons where you answer everything right are marked as passed'] }, ...placementSteps()] },
    r => { (r.placed || []).forEach(markPlaced); Object.entries(REVIEW_COVERS).forEach(([x, ids]) => { if (ids.every(isPassed)) markPlaced(x); }); S.placed = true; save(); onb = null; go('map'); });
  route = 'play'; render(); window.scrollTo(0, 0);
}

/* ---------- 4. Dashboard ---------- */
function vMap() {
  const nx = nextLesson(), ph = currentPhase();
  const passedN = ph.lessons.filter(l => isPassed(l.id)).length;
  if (openPhase === null) openPhase = ph.n;
  const all = Object.values(S.lessons);
  const counts = { viewed: all.filter(l => l.viewed).length, practiced: all.filter(l => l.practiced).length, passed: all.filter(l => l.status === 'passed').length };
  const sk = skillSummary();
  const shown = [...PHASE1_SKILLS, ...(sk.tone ? ['tone'] : []), ...(sk.write ? ['write'] : [])];
  const strong = shown.filter(k => sk[k]?.pct >= LEVEL.strong), weak = shown.filter(k => sk[k]?.pct !== null && sk[k]?.pct !== undefined && sk[k].pct < LEVEL.developing);
  const tested = shown.filter(k => sk[k]?.t).sort((a, b) => sk[a].pct - sk[b].pct);
  const rec = tested.find(k => sk[k].pct < LEVEL.strong);
  const review = ALL_LESSONS.filter(l => lessonState(l.id) === 'needs_review');
  const fresh = !all.length;
  return `${topbar()}
  <section class="card hero c-lav-l">
    <div class="stack" style="gap:8px;min-width:0;flex:1">
      <p class="eyebrow">Phase ${ph.n} · ${ph.title}</p>
      <h1>${nx ? esc(nx.title) : 'Phase complete! 🎉'}</h1>
      <p class="muted">${fresh ? 'Start with the first Thai letters. Every lesson ends with a short test, so you always know what you can really do.' : `Goal of this phase: ${ph.can}.`}</p>
      ${bar(passedN / ph.lessons.length * 100, 'thick')}<p class="small"><b>${passedN} of ${ph.lessons.length}</b> lessons passed in Phase ${ph.n}</p>
      ${nx ? `<button class="btn big" data-continue="${nx.id}" style="align-self:flex-start">${ic('play')} ${fresh ? 'Start learning' : lessonState(nx.id) === 'needs_review' ? 'Review & retake' : 'Continue learning'}</button>` : ''}
    </div>${jai(100, 'happy', '#C9B6FF', 'bob hide-xs')}
  </section>
  ${review.length ? `<section class="card c-peach-l stack"><h3>Needs review</h3>${review.map(l => `<div class="row between"><span><b>${esc(l.title)}</b> <span class="small muted">· last test ${S.lessons[l.id].testLast}% (pass ${passMark(l)}%)</span></span><span class="row"><button class="btn soft" data-remedial="${l.id}">Practise what I missed</button><button class="btn line" data-retest="${l.id}">Retake test</button></span></div>`).join('')}</section>` : ''}
  <div class="map-layout"><div class="stack gap-l">
    <section class="card stack"><div class="row between"><h2>Your skills</h2><span class="small muted">Based on your most recent tests — not on lessons opened</span></div>
      <div class="statrow">${[['Lessons viewed', counts.viewed], ['Practice done', counts.practiced], ['Tests passed', counts.passed], ['Skills strong', strong.length], ['Skills to review', weak.length]].map(([t, n]) => `<div class="mini"><b>${n}</b><span>${t}</span></div>`).join('')}</div>
      <div class="skills">${shown.map(k => { const s = sk[k], [lv, c] = level(s?.pct); return `<div class="skillrow"><div class="row between nowrap"><span>${SKILLS[k].label}</span><span class="pill ${c}">${lv}${s?.t ? ` · ${s.pct}%` : ''}</span></div>${bar(s?.pct || 0, c === 'warn' ? 'warn' : c === 'ok' ? 'ok' : '')}</div>`; }).join('')}</div>
      ${rec ? `<div class="row between c-sky-l recbox"><span><b>Recommended:</b> practise ${SKILLS[rec].label.toLowerCase()} (${sk[rec].pct}%).</span><button class="btn" data-skill="${rec}">Practise now</button></div>` : (tested.length ? '<p class="small">All the skills you have been tested on are strong. Keep going!</p>' : '<p class="small muted">Take your first lesson test to see your skills here.</p>')}
    </section>
    ${PHASES.map(phaseCard).join('')}
    ${writingCard()}
    <p class="small"><button class="linkbtn" data-go="notice">How KhaoJai teaches</button></p>
  </div>${sidePanel()}</div>`;
}
function lessonRow(l) {
  const ok = lessonOpen(l.id), st = lessonState(l.id);
  return `<li><button class="lesson-row ${st} ${ok ? '' : 'locked'}" data-lesson="${l.id}">
    <span class="st">${st === 'passed' ? ic('check') : ok ? (l.check ? ic('flag') : l.review ? '↻' : l.id) : ic('lock')}</span>
    <span class="grow"><b>${esc(l.title)}</b><br><span class="small th" lang="th">${l.th}</span>${ok ? `<br><span class="small muted">Tests: ${l.skills.map(k => SKILLS[k].short).join(' · ')}</span>` : `<br><span class="small muted">${lockReason(l.id)}</span>`}</span>
    ${ok ? statusPill(l.id) : ''}</button></li>`;
}
function phaseCard(ph) {
  const open = phaseOpen(ph), done = ph.lessons.length && phasePassed(ph.n), expanded = openPhase === ph.n;
  const n = ph.lessons.filter(l => isPassed(l.id)).length;
  const sub = ph.soon ? 'Coming later — not built yet' : ph.life ? (open ? 'Conversations, chat and culture (early preview)' : 'Locked — pass Phase 2 to unlock') : done ? 'Passed ✓' : open ? `${n} of ${ph.lessons.length} passed` : `Locked — pass Phase ${ph.n - 1} to unlock`;
  return `<section class="stage s-${ph.color} ${open && !ph.soon ? '' : 'locked'}">
    <button class="stage-head" data-phase="${ph.n}" aria-expanded="${expanded}">
      <span class="stage-no">${done ? ic('check') : open && !ph.soon ? ph.n : ic('lock')}</span>
      <span class="stage-txt"><span class="small th" lang="th">${ph.th}</span><b>Phase ${ph.n} · ${ph.title}</b><small>${sub}</small></span>${ic('chev')}</button>
    ${expanded ? `<div class="stage-body"><p class="small">You will be able to: <b>${ph.can}</b>.</p>
      ${ph.soon ? '<p class="small muted">This phase is planned but its lessons are not built yet.</p>' : ''}
      ${ph.n === 1 ? `<p class="small muted">Each lesson ends with a test (pass ${PASS.lesson}%, and at least ${PASS.skillMin}% in each skill). Reviews mix older material. The four phase checks test each skill on its own and unlock Phase 2.</p>` : ''}
      ${ph.life ? (open ? LINES.map(line => `<p class="small"><b>${line.en}</b> <span class="th" lang="th">${line.th}</span></p><ol class="lessons">${line.stations.map(id => `<li><button class="lesson-row ${S.done[id] ? 'passed' : ''}" data-life="${id}"><span class="st">${S.done[id] ? ic('check') : ic('play')}</span><span class="grow"><b>${esc(STATIONS[id].en)}</b><br><span class="small th" lang="th">${STATIONS[id].th}</span></span></button></li>`).join('')}</ol>`).join('') : '<p class="small">Everyday conversation, chat and culture come after you can read.</p>') : `<ol class="lessons">${ph.lessons.map(lessonRow).join('')}</ol>`}
    </div>` : ''}</section>`;
}
function writingCard() {
  const expanded = openPhase === 'W', n = WRITING.lessons.filter(l => isPassed(l.id)).length;
  return `<section class="stage s-peach"><button class="stage-head" data-phase="W" aria-expanded="${expanded}"><span class="stage-no">✍️</span>
    <span class="stage-txt"><span class="small th" lang="th">${WRITING.th}</span><b>Writing track (optional)</b><small>${n} of ${WRITING.lessons.length} passed · alongside Phase 1</small></span>${ic('chev')}</button>
    ${expanded ? `<div class="stage-body"><p class="small muted">Practise writing every letter. The handwriting check compares shapes only and is approximate — it does not judge stroke order. This track is not required to unlock Phase 2.</p><ol class="lessons">${WRITING.lessons.map(lessonRow).join('')}</ol></div>` : ''}</section>`;
}
function sidePanel() {
  const due = dueLetters(), last = S.history.slice(0, 4);
  return `<aside class="panel stack">
    <div class="card c-lemon-l row nowrap">${goalRing()}<div><p class="eyebrow">Today</p><p class="big-num">${todayPoints()} / ${dailyGoal()}</p><p class="small muted">points</p></div></div>
    <div class="card c-sky-l stack"><h3>Review</h3><p class="small">${due.length ? `${due.length} letter${due.length > 1 ? 's' : ''} or vowel${due.length > 1 ? 's' : ''} ready to review.` : 'Nothing due — things you learn come back here when it\'s time to review them.'}</p>${due.length ? '<button class="btn" data-review="due">Review now</button>' : ''}</div>
    <div class="card stack"><h3>Recent tests</h3>${last.length ? last.map(h => `<div class="row between nowrap small"><span>${esc(LESSON[h.id]?.title || h.id)}</span><span class="pill ${h.passed ? 'ok' : 'warn'}">${h.score}% ${h.passed ? '✓' : ''}</span></div>`).join('') : '<p class="small muted">No tests yet.</p>'}</div>
    <div class="card c-mint-l stack"><h3>Tools</h3><button class="btn line" data-go="letters" data-sub="chart">Alphabet chart ก–ฮ</button><button class="btn line" data-go="letters" data-sub="sing">Sing-along ก–ฮ</button><button class="btn line" data-go="decoder">Thai Decoder</button></div>
  </aside>`;
}
function goalRing(size = 60) {
  const v = Math.min(1, todayPoints() / dailyGoal()), c = 2 * Math.PI * 15;
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 36 36" role="img" aria-label="Daily goal"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-l)" stroke-width="5"/>${v > 0 ? `<circle cx="18" cy="18" r="15" fill="none" stroke="var(--lemon-d)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(v * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 18 18)"/>` : ''}</svg>`;
}

/* ---------- running lessons ---------- */
const colorOf = id => phaseOf(id).color;
function openLesson(id) {
  const l = LESSON[id];
  if (!lessonOpen(id)) return toast(lockReason(id) + '.');
  const nxt = nextAfter(id);
  startLesson({ id, title: l.title, sub: `${l.phase === 'W' ? 'Writing track' : `Phase ${l.phase} · ${phaseOf(id).title}`}`, mode: 'lesson', steps: [...l.teach(), ...l.test()], color: colorOf(id), pass: passMark(l), nextTitle: nxt?.title }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function retest(id) {
  const l = LESSON[id], nxt = nextAfter(id);
  startLesson({ id, title: l.title, mode: 'test', color: colorOf(id), pass: passMark(l), nextTitle: nxt?.title,
    steps: [{ t: 'intro', score: false, learn: ['A new set of test questions for this lesson'], how: ['Only your first answer counts', `Pass mark ${passMark(l)}%, and at least ${PASS.skillMin}% in each skill`] }, ...l.test()] }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function remedial(id) {
  const l = LESSON[id], missed = S.lessons[id]?.missed || [];
  const steps = remedialSteps(missed);
  if (!steps.length) return retest(id);
  startLesson({ id: null, title: `Practise: ${l.title}`, mode: 'practice', color: colorOf(id), steps: [{ t: 'intro', score: false, learn: [`Only the ${missed.length} item${missed.length === 1 ? '' : 's'} you missed in the test`], how: ['Look at each one again', 'Answer a new question about it', 'Then retake the test'] }, ...steps], retestId: id }, afterLesson);
  route = 'play'; render(); window.scrollTo(0, 0);
}
function afterLesson(r) {
  if (r.to === 'remedial' && r.id) return remedial(r.id);
  if (r.to === 'retest' && (r.id || lastRetest)) return retest(r.id || lastRetest);
  if (r.to === 'next' && r.id) { const n = nextAfter(r.id); if (n) { openPhase = LESSON[n.id].phase; return openLesson(n.id); } }
  if (r.id && LESSON[r.id]) openPhase = LESSON[r.id].phase;
  go('map');
}
let lastRetest = null;
function startPractice(title, steps, color = 'sky', retestId) {
  if (!steps.length) return toast('Nothing to practise yet — pass a lesson first.');
  lastRetest = retestId || null;
  startLesson({ id: null, title, steps, color, mode: 'practice', retestId }, r => { if (r.to === 'retest' && lastRetest) return retest(lastRetest); go(route === 'play' ? 'map' : route); });
  route = 'play'; render(); window.scrollTo(0, 0);
}
function openLife(id) {
  const st = STATIONS[id], line = LINES.find(l => l.stations.includes(id));
  startLesson({ id: null, title: st.en, steps: st.ex.map(s => ({ ...s, test: true })), color: line.color, mode: 'test', pass: PASS.lesson, words: st.words }, r => { if (r.passed) { S.done[id] = { best: 100 }; save(); } openPhase = 5; go('map'); });
  route = 'play'; render();
}
const learnedKeys = () => Object.keys(S.cards);

/* ---------- Letters ก–ฮ hub ---------- */
const GROUPS4 = [0, 11, 22, 33].map(s => LETTERS.slice(s, s + 11).map(x => x.c));
function vLetters() {
  const tabs = [['chart', 'Chart'], ['vowels', 'Vowels'], ['sing', 'Sing-along'], ['recite', 'Recite & record'], ['write', 'Writing practice']];
  return `${topbar()}<div class="pagehead"><h1>Letters ก–ฮ</h1><p class="muted">All 44 consonants and the vowels, with names, sounds, English helpers and pictures. Use these tools any time — they don't change your path.</p></div>
  <div class="seg wide" role="tablist">${tabs.map(([k, t]) => `<button role="tab" data-ltab="${k}" aria-pressed="${lettersTab === k}">${t}</button>`).join('')}</div>
  ${({ chart: vChart, vowels: vVowels, sing: vSing, recite: vRecite, write: vStudio })[lettersTab]()}`;
}
function vChart() {
  return `<div class="row"><span class="pill cls-mid">Mid class · 9</span><span class="pill cls-high">High class · 11</span><span class="pill cls-low">Low class · 24</span><button class="linkbtn" data-sheet="romguide">How to read the romanization</button></div>
  <div class="chart">${LETTERS.map(x => `<button class="ltile cls-${x.cls} ${x.old ? 'old' : ''}" data-letter="${x.c}"><span class="engtag">${x.eng}</span><span class="th" lang="th">${x.c}</span><small lang="th">${x.word}</small>${S.rom ? `<small class="rom">${x.rom}</small>` : ''}</button>`).join('')}</div>
  <p class="small muted">The small English letter on each tile is a memory aid, not an exact sound. Faded tiles (ฃ ฅ) are no longer used. Picture cues are placeholder emoji until KhaoJai's own illustrations are ready.</p>`;
}
function vVowels() {
  return `<p class="small muted">อ shows where the consonant goes. Tap a vowel to hear its example word.</p>
  <div class="chart">${VOWELS.map(v => `<button class="ltile cls-mid" data-say="${v.eg[0]}"><span class="th" lang="th">${v.v}</span><small>${S.rom ? v.rom + ' · ' : ''}${v.len}</small><small lang="th">${v.eg[0]}</small></button>`).join('')}</div>`;
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
let rec = { g: 0, media: null, chunks: [], url: null, recording: false };
function vRecite() {
  const g = GROUPS4[rec.g], info = S.recite.groups[rec.g] || { attempts: 0 };
  return `<section class="card c-sky-l stack">
    <div class="seg" role="group" aria-label="Letter group">${GROUPS4.map((gr, i) => `<button data-rgroup="${i}" aria-pressed="${rec.g === i}">${gr[0]}–${gr[gr.length - 1]}${S.recite.groups[i]?.attempts ? ' ✓' : ''}</button>`).join('')}</div>
    <div class="recgroup">${g.map(c => `<button class="rchip ${S.recite.weak.includes(c) ? 'weak' : ''}" data-weak="${c}" title="Tap to mark for more practice"><span class="th" lang="th">${c}</span><small lang="th">${L[c].say} ${L[c].word}</small>${S.rom ? `<small class="rom">${L[c].rom}</small>` : ''}</button>`).join('')}</div>
    <ol class="steps"><li>Listen to the reference.</li><li>Record yourself saying the names in order.</li><li>Play both and compare. Tap any letter you found hard to mark it for practice.</li></ol>
    <div class="row"><button class="btn line" id="recRef">${ic('sound')} 1 · Listen</button>
      ${rec.recording ? `<button class="btn warm" id="recStop">■ Stop recording</button>` : `<button class="btn" id="recStart">${ic('mic')} 2 · Record</button>`}
      ${rec.url ? `<button class="btn line" id="recCompare">${ic('play')} 3 · Reference, then me</button>` : ''}</div>
    ${rec.url ? `<audio controls src="${rec.url}" id="recAudio"></audio><div class="row"><button class="btn line" id="recDelete">${ic('trash')} Delete my recording</button></div>` : ''}
    <div class="row"><button class="btn soft" id="recDone">I recited this group ✓</button><span class="small muted">Attempts: ${info.attempts || 0}${info.last ? ` · last ${new Date(info.last).toLocaleDateString('en-GB')}` : ''}</span></div>
  </section>
  <p class="small muted">${ic('shield')} Privacy: the browser asks for microphone permission when you first press Record, and the microphone is used only while recording. Your recording stays in this browser tab and is deleted when you tap Delete or leave the page — nothing is uploaded or saved to your account. There is no automatic pronunciation score; comparing by ear is the honest check for now.</p>`;
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
  save();
}

// Writing practice studio.
function vStudio() {
  const x = L[studio.c];
  return `<section class="card c-peach-l stack">
    <div class="row between"><div class="row"><span class="th" style="font-size:30px" lang="th">${studio.c}</span><b class="th" lang="th">${x.say} ${x.word}</b><span class="rom always">${x.rom}</span><button class="iconbtn" data-say="${x.say} ${x.word}" aria-label="Listen">${ic('sound')}</button></div>
      <div class="seg"><button data-sguide="1" aria-pressed="${studio.guide}">Trace</button><button data-sguide="0" aria-pressed="${!studio.guide}">From memory</button></div></div>
    <div class="padwrap"><canvas id="studioPad" class="pad" aria-label="Writing area"></canvas></div>
    <div class="row center"><button class="btn line" id="sClear">Clear</button><button class="btn" id="sCheck">Check shape</button></div>
    ${studio.score !== null ? `<p class="center"><b>Shape match: ${studio.score}%</b> ${studio.ok ? '— nice!' : '— try again, keep the loops round and the size even.'}${studio.best?.length ? `<br>Looks most like: <b class="th" lang="th">${studio.best.join(' ')}</b>` : ''}<br><span class="small muted">Approximate check: compares shapes only, not stroke order.</span></p>` : '<p class="small muted center">Start at the head (the small loop) and write in one stroke where you can.</p>'}
  </section>
  <div class="chart small">${LETTERS.map(l => `<button class="ltile cls-${l.cls} ${l.c === studio.c ? 'sel' : ''}" data-studio="${l.c}"><span class="th" lang="th">${l.c}</span></button>`).join('')}</div>`;
}

/* ---------- Practice ---------- */
function buildDeck() {
  const trouble = troubleLetters(), due = dueLetters().filter(isLetter), learned = learnedKeys().filter(isLetter);
  const base = learned.length ? learned : LETTERS.slice(0, 6).map(x => x.c);
  const shuffled = base.slice().sort(() => Math.random() - .5);
  fc = { deck: [...new Set([...trouble, ...due, ...shuffled])], i: 0, flip: false };
}
function vPractice() {
  if (!fc.deck.length) buildDeck();
  const due = dueLetters(), trouble = troubleLetters(), c = fc.deck[fc.i % fc.deck.length], x = L[c];
  const sk = skillSummary();
  return `${topbar()}<div class="pagehead"><h1>Practice</h1><p class="muted">Short practice sets. Practice never changes a test result — it helps you get ready for the next one.</p></div>
  <div class="grid g3">
    <button class="card drill c-sky-l" data-review="due"><span class="clockface th" lang="th">ก ข ค</span><h3>Review what's due</h3><p class="small">${due.length ? `${due.length} items are due today` : 'Nothing due — try trouble letters'}</p></button>
    <button class="card drill c-pink-l" data-review="trouble"><span class="clockface th" lang="th">${trouble.slice(0, 3).join(' ') || '—'}</span><h3>Trouble letters</h3><p class="small">${trouble.length ? 'The letters you miss most' : 'None yet — great!'}</p></button>
    <button class="card drill c-mint-l" data-drill="time"><span class="clockface">19:00</span><h3>Thai time & money</h3><p class="small">หนึ่งทุ่ม, บ่ายโมง, baht & satang</p></button>
  </div>
  <section class="card stack"><h2>Practise one skill</h2><div class="chips">${[...PHASE1_SKILLS, 'tone', 'write'].map(k => `<button class="chip" data-skill="${k}">${SKILLS[k].short}${sk[k]?.t ? ` · ${sk[k].pct}%` : ''}</button>`).join('')}</div></section>
  <section class="card stack c-lav-l">
    <div class="row between"><h2>Letter flashcards</h2><span class="pill">${fc.i % fc.deck.length + 1} / ${fc.deck.length}${learnedKeys().some(isLetter) ? ' · missed letters first' : ' · starter set'}</span></div>
    <button class="flash ${fc.flip ? 'flipped' : ''}" id="flash" aria-label="Flip card"><span class="flash-in">
      <span class="face"><span class="th big" lang="th">${c}</span><span class="small muted">What is this letter called? Tap to check.</span></span>
      <span class="face back"><span class="th" lang="th" style="font-size:24px">${x.say} ${x.word}</span><span class="rom">${x.rom} · English helper: ${x.eng}</span><b>${x.pic} ${x.en}</b></span></span></button>
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
  const row = (icn, title, sub, ctrl, forId) => `<div class="setting"><${forId ? `label for="${forId}"` : 'span'} class="row nowrap">${ic(icn)}<span><b>${title}</b>${sub ? `<br><span class="small muted">${sub}</span>` : ''}</span></${forId ? 'label' : 'span'}>${ctrl}</div>`;
  const tog = (id, on, label) => `<label class="toggle"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${label}"><span></span></label>`;
  const acct = Auth.signedIn();
  const sync = Auth.syncState;
  return `${topbar()}
  <section class="card c-lav-l row nowrap me-head">${jai(80, 'happy')}<div class="stack" style="gap:4px;min-width:0">
    <h1>${acct ? 'My account' : 'Guest learner'}</h1>
    ${acct ? `<p class="small">Signed in as <b>${esc(Auth.user()?.email || '')}</b>. Your progress is saved to your account.</p><p class="small muted">${sync.status === 'saving' ? 'Saving…' : sync.status === 'saved' ? 'All progress saved ✓' : sync.status === 'offline' ? 'Offline — progress will be saved when you are back online.' : sync.status === 'error' ? `Couldn't save just now: ${esc(sync.error)}` : ''}</p>`
      : `<p class="small">Learning without an account. Progress is saved on this device only.</p>`}
    <div class="row">${acct ? '<button class="btn line" id="mOut">Sign out</button>' : Auth.configured() ? '<button class="btn" id="mSignIn">Sign in or create an account</button>' : '<span class="pill">Accounts: coming soon</span>'}</div></div></section>
  <section class="card stack"><h2>My learning</h2>
    ${S.profile ? `<p class="small">Goal: <b>${QS[4][2].find(o => o[0] === S.profile.reason)?.[1] || '—'}</b> · ${S.profile.minutes} min a day (${dailyGoal()} points)</p>` : ''}
    <div class="row"><button class="btn line" data-go="notice">How KhaoJai teaches</button><button class="btn line" id="mOnb">Change my answers</button>${!S.placed ? '<button class="btn line" id="mPlace">Take the placement check</button>' : ''}</div></section>
  <div class="grid g2">
    <button class="card tile c-mint-l" data-go="homework">${ic('homework')}<span><b>Homework Studio</b><br><span class="small">AI check or a real Thai reviewer</span></span>${ic('chev')}</button>
    <button class="card tile c-lemon-l" data-go="plans">${ic('star')}<span><b>KhaoJai Plus</b><br><span class="small">Plans & payment (demo)</span></span>${ic('chev')}</button>
  </div>
  <section class="card"><h2>Settings</h2>
    ${row('bulb', 'Show romanization', 'On by default for beginners. You can also hide it inside any lesson. Reading tests hide it.', tog('sRom', S.rom, 'Show romanization'))}
    ${row('globe', 'How romanization works', 'KhaoJai\'s spelling system and its limits', '<button class="btn line" data-sheet="romguide">Read</button>')}
    ${row('sound', 'Sound', 'Play Thai audio', tog('sSound', S.sound, 'Sound'))}
    ${row('lock', 'Adult language lessons', 'Insults & profanity, 18+ (later phases)', tog('sAdult', S.adult, 'Adult language lessons'))}
    ${row('map', 'Unlock everything (testing)', 'For reviewing the app — normally lessons unlock in order', tog('sUnlock', S.unlockAll, 'Unlock everything'))}
    ${row('phone', 'Install on your phone or computer', 'iPhone, Android, Windows, Mac', '<button class="btn line" data-sheet="install">How</button>')}
    ${row('trash', 'Reset progress', acct ? 'Start again from the first lesson (also resets your account\'s progress)' : 'Start again from the first lesson', '<button class="btn line" id="sReset">Reset</button>')}
  </section>
  <p class="small muted center">KhaoJai early preview · v0.5 · Reading Foundations</p>`;
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
  return `${topbar()}<div class="pagehead"><h1>KhaoJai Plus</h1><p class="muted">Reading Foundations are free. Plus adds AI practice and human homework review.</p></div>
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
  <div class="enghelp"><span class="engletter">${x.eng}</span><p><b>English helper:</b> ${x.tip}<br><span class="small muted">A memory aid only — not an exact sound.</span></p></div>
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
    <tr><td><b>g · dt · bp · j</b></td><td>Soft, no puff of air: ก ต ป จ (like the k in "skin", t in "stop", p in "spin")</td></tr>
    <tr><td><b>k · t · p · ch</b></td><td>With a puff of air: ข ค · ท ถ · พ ผ · ช ฉ (like "kite", "top", "pin", "chair")</td></tr>
    <tr><td><b>ng</b></td><td>ง — the "ng" of "sing", also at the start of words</td></tr>
    <tr><td><b>a / aa · i / ee · u / oo</b></td><td>Short / long: อะ อา · อิ อี · อุ อู (a doubled letter = long)</td></tr>
    <tr><td><b>e / eh · ae · o / oh · or</b></td><td>เอะ เอ · แอะ แอ · โอะ โอ · เอาะ ออ</td></tr>
    <tr><td><b>ue / uue · er</b></td><td>อึ อือ (say "ee" with flat lips) · เออ</td></tr>
    <tr><td><b>ia · uea · ua</b></td><td>เอีย · เอือ · อัว</td></tr>
    <tr><td><b>ai · ao · am</b></td><td>ไ / ใ · เา · ำ</td></tr></table></div>
  <p class="small">Short and long partners can share a spelling (แอะ and แอ are both "ae"); lessons always say which is long or short. Tones are shown separately as a tone name when they matter.</p>
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
    const views = { auth: vAuth, notice: vNotice, onboard: vOnboard, map: vMap, letters: vLetters, practice: vPractice, decoder: vDecoder, me: vMe, homework: vHomework, plans: vPlans };
    main.innerHTML = `<div class="view ${GATE.includes(route) ? 'narrow' : ''}">${views[route]()}</div>`;
    if (route === 'letters' && lettersTab === 'sing') paintSing();
    if (route === 'letters' && lettersTab === 'write') { const cv = document.getElementById('studioPad'); if (cv) mountPad(cv, { c: studio.c, guide: studio.guide, strokes: studio.strokes, reveal: studio.score !== null && !studio.guide }); }
  }
  nav();
}
Auth.onSyncChange(() => { if (route === 'me') render(); });

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
  if (d.amode) return setMode(d.amode);
  if (t.id === 'aResend') return resendCode();
  if (t.id === 'aGuest') { S.entered = 'guest'; save(); return go('map'); }
  if (d.oauth) { auth.busy = true; return Auth.signInOAuth(d.oauth); }
  if (t.id === 'aEye') { const pw = document.getElementById('aPw'); const show = pw.type === 'password'; pw.type = show ? 'text' : 'password'; t.textContent = show ? 'Hide' : 'Show'; t.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); return; }
  if (t.id === 'nStart') { S.noticeSeen = true; save(); return go('map'); }
  if (t.id === 'oPlace') { S.placed = true; save(); return startPlacement(); }
  if (t.id === 'oSkip') { onb = null; return go('map'); }
  if (t.id === 'mOnb') { onb = null; S.profile = null; return go('onboard'); }
  if (t.id === 'mPlace') return startPlacement();
  if (t.id === 'mSignIn') { S.entered = ''; auth = { mode: 'signin', busy: false, err: '', msg: '', draft: {} }; return go('auth'); }
  if (t.id === 'mOut') { Auth.signOut().then(() => { resetAll(); toast('Signed out. Your progress is safe in your account.'); go('auth'); }); return; }
  if (d.continue) { return lessonState(d.continue) === 'needs_review' ? remedial(d.continue) : openLesson(d.continue); }
  if (d.lesson) return openLesson(d.lesson);
  if (d.remedial) return remedial(d.remedial);
  if (d.retest) return retest(d.retest);
  if (d.life) return openLife(d.life);
  if (d.phase) { const v = d.phase === 'W' ? 'W' : +d.phase; openPhase = openPhase === v ? 0 : v; return render(); }
  if (d.skill) return startPractice(`Practise: ${SKILLS[d.skill].label}`, skillDrill(d.skill, learnedKeys()));
  if (d.review) { const set = d.review === 'due' ? dueLetters() : troubleLetters(); return startPractice(d.review === 'due' ? 'Review' : 'Trouble letters', reviewDrill(set.length ? set : learnedKeys())); }
  if (d.drill) return startPractice('Thai time & money', TIME_DRILL.map(s => ({ ...s })), 'mint');
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
  if (t.id === 'sCheck') { if (!studio.strokes.length) return toast('Write the letter first.'); (studio.guide ? shapeScore(studio.c, studio.strokes, false).then(sc => ({ score: sc, ok: sc >= PASS.trace })) : recognize(studio.c, studio.strokes, LETTERS.filter(x => !x.old).map(x => x.c)).then(r => ({ score: r.score, best: r.best, ok: r.rank <= 3 && r.score >= PASS.write }))).then(r => { studio.score = r.score; studio.best = r.best; studio.ok = r.ok; render(); }); return; }
  if (d.ex) { dText = d.ex; return render(); }
  if (t.id === 'dGo') { dText = document.getElementById('dIn').value; return render(); }
  if (t.id === 'flash') { fc.flip = !fc.flip; t.classList.toggle('flipped', fc.flip); return; }
  if (d.rate) { const c = fc.deck[fc.i % fc.deck.length]; seeLetter(c, d.rate !== 'again'); if (d.rate === 'again') fc.deck.splice(Math.min(fc.deck.length, fc.i + 3), 0, c); save(); fc.i++; fc.flip = false; return render(); }
  if (d.bill) { billing = d.bill; return render(); }
  if (d.buy) { co = { item: d.buy, method: 'card', step: 'form' }; return openSheet('checkout'); }
  if (t.id === 'sReset') { if (d.armed) { const keep = { entered: S.entered, noticeSeen: true, profile: S.profile, rom: S.rom, sound: S.sound }; resetAll(keep); openPhase = null; fc.deck = []; toast('Progress reset. Back to the first lesson.'); return go('map'); } d.armed = '1'; t.textContent = 'Tap again to reset'; return; }
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
  const id = e.target.id;
  const AF = { aForm: 'signin', aSignup1: 'signup1', aSignup2: 'signup2', aVerify: 'verify', aCode: 'signincode', aReset: 'reset', aNewPass: 'newpass' };
  if (AF[id]) { e.preventDefault(); return authStep(AF[id]); }
  if (id === 'oForm') { e.preventDefault(); return onboardSubmit(e.target); }
  if (id !== 'hwForm') return; e.preventDefault();
  const title = document.getElementById('hwTitle').value.trim(), txt = document.getElementById('hwText').value.trim(), file = document.getElementById('hwFile').files[0];
  const human = document.getElementById('hwHuman').checked, err = document.getElementById('hwErr');
  if (!title) return err.textContent = 'Give your homework a short name.';
  if (!txt && !file) return err.textContent = 'Type some Thai or attach a photo or voice clip.';
  if (human && S.credits < 1) return err.textContent = 'You have no review credits yet. Get some in Plus, or choose AI check.';
  if (human) S.credits--;
  S.homework.unshift({ title, status: human ? 'queue' : 'ai', date: new Date().toLocaleDateString('en-GB'), note: human ? 'In the queue for a Thai reviewer.' : 'AI checking is coming soon. Your homework is saved on this device.' });
  save(); toast(human ? 'Sent to the review queue.' : 'Saved.'); render();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.otp !== undefined) {
    const digits = t.value.replace(/\D/g, ''); const boxes = [...document.querySelectorAll('.otpbox')]; let i = +t.dataset.otp;
    if (digits.length > 1) { digits.split('').slice(0, 6 - i).forEach((d, k) => { boxes[i + k].value = d; }); i = Math.min(5, i + digits.length - 1); } else t.value = digits;
    if (digits && boxes[i + 1]) boxes[i + 1].focus(); else if (digits) boxes[i].blur();
    if (otpValue().length === 6 && !auth.busy) authStep('verify');
  }
  if (t.id === 'aPw') document.querySelectorAll('#pwRules li').forEach(li => li.classList.toggle('ok', li.dataset.r === 'len' ? t.value.length >= 8 : /[A-Za-z]/.test(t.value) && /\d/.test(t.value)));
});
document.addEventListener('keydown', e => {
  if (e.target.dataset?.otp !== undefined && e.key === 'Backspace' && !e.target.value) { const p = document.querySelector(`[data-otp="${+e.target.dataset.otp - 1}"]`); if (p) { p.value = ''; p.focus(); } return; }
  if (e.key === 'Escape' && sheet) return closeSheet();
  if (route === 'play') return playerKey(e, render);
  if (e.key === 'Enter' && e.target.id === 'dIn' && (e.metaKey || e.ctrlKey)) { dText = e.target.value; render(); }
});
window.addEventListener('pagehide', () => { if (rec.url) URL.revokeObjectURL(rec.url); });

/* ---------- start ---------- */
(async () => {
  let r = null;
  if (Auth.configured()) { try { r = await Auth.handleRedirect(); } catch (e) { r = { error: e.message }; } }
  if (r?.recovery) { S.entered = S.entered || 'account'; auth = { mode: 'newpass', busy: false, err: '', msg: '', draft: {} }; route = 'auth'; render(); return; }
  if (r?.error) { auth.err = r.error; route = 'auth'; render(); return; }
  if (r?.signedIn) { S.entered = 'account'; save(); }
  await Promise.all([Auth.resume(), Auth.loadProviders()]);
  const h0 = location.hash.slice(1);
  route = gateRoute(ROUTES.includes(h0) && h0 !== 'play' ? h0 : 'map');
  render();
})();
if ('speechSynthesis' in window) speechSynthesis.getVoices();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !location.hostname.endsWith('claude.ai') && !location.hostname.includes('claudeusercontent')) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
