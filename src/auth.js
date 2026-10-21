// Accounts: sign up, sign in, Google sign-in, password reset, sign out, and saving progress to the account.
// Uses Supabase Auth + a `progress` table through their REST endpoints (no extra library needed).
// If SUPABASE_URL / SUPABASE_ANON_KEY are empty, accounts are OFF and the app says so honestly.
// Setup: docs/AUTH_SETUP.md
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import { S, snapshot, replaceAll, onSave } from './store.js';

const SKEY = 'khaojai.session';
export const configured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);
let session = null;
try { session = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) {}
const keep = s => { session = s; try { s ? localStorage.setItem(SKEY, JSON.stringify(s)) : localStorage.removeItem(SKEY); } catch (e) {} };
export const user = () => session?.user || null;
export const signedIn = () => !!session?.access_token;
export const syncState = { status: 'idle', at: 0, error: '' };   // idle | saving | saved | offline | error

const here = () => location.origin + location.pathname;

// Which sign-in methods the project has switched on (read from Supabase, so the app never shows a dead button).
export const providers = { google: false, loaded: false };
export async function loadProviders() {
  if (!configured()) return;
  try { const s = await api('/auth/v1/settings'); providers.google = !!s?.external?.google; } catch (e) {}
  providers.loaded = true;
}

// Friendly error messages for common Supabase errors.
function friendly(msg = '', code = '') {
  const m = (msg + ' ' + code).toLowerCase();
  if (/invalid login|invalid_credentials/.test(m)) return 'That email and password don\'t match. Check them, or reset your password.';
  if (/already registered|user_already_exists/.test(m)) return 'An account with this email already exists. Try signing in instead.';
  if (/email not confirmed|email_not_confirmed/.test(m)) return 'Please confirm your email first — open the link we sent you, then sign in.';
  if (/password should be|weak_password/.test(m)) return 'Please choose a stronger password: at least 8 characters.';
  if (/rate limit|over_email_send_rate_limit|too many/.test(m)) return 'Too many tries in a short time. Please wait a minute and try again.';
  if (/provider is not enabled|unsupported provider/.test(m)) return 'Google sign-in is not switched on yet. Please use email for now.';
  if (/invalid email|email_address_invalid/.test(m)) return 'That email address doesn\'t look right.';
  if (/failed to fetch|network/.test(m)) return 'Can\'t reach the server. Check your internet connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

async function api(path, { method = 'GET', body, token, headers = {} } = {}) {
  let r;
  try {
    r = await fetch(SUPABASE_URL + path, { method, headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined });
  } catch (e) { throw new Error(friendly('failed to fetch')); }
  const text = await r.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) {}
  if (!r.ok) throw Object.assign(new Error(friendly(data?.msg || data?.message || data?.error_description || data?.error || r.statusText, data?.error_code || data?.code)), { status: r.status });
  return data;
}
const withExpiry = d => ({ ...d, expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600) });

export async function signUp(email, password) {
  const d = await api('/auth/v1/signup?redirect_to=' + encodeURIComponent(here()), { method: 'POST', body: { email, password } });
  if (d?.access_token) { keep(withExpiry(d)); await afterSignIn(); return { signedIn: true }; }
  return { confirm: true };   // email confirmation is required by the project
}
export async function signIn(email, password) {
  const d = await api('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  keep(withExpiry(d)); await afterSignIn(); return true;
}
export function signInGoogle() {
  location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(here())}`;
}
export async function sendReset(email) {
  await api('/auth/v1/recover?redirect_to=' + encodeURIComponent(here()), { method: 'POST', body: { email } });
}
export async function setNewPassword(password) {
  await api('/auth/v1/user', { method: 'PUT', token: await token(), body: { password } });
}
export async function signOut() {
  try { if (session) await api('/auth/v1/logout', { method: 'POST', token: session.access_token }); } catch (e) { /* the local sign-out still happens */ }
  keep(null);
}

async function token() {
  if (!session) return null;
  if (session.expires_at && session.expires_at - 60 < Date.now() / 1000) {
    try { keep(withExpiry(await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } }))); }
    catch (e) { if (e.status === 400 || e.status === 401) keep(null); throw e; }
  }
  return session?.access_token;
}

// Handle links that come back from Supabase (#access_token=…&type=recovery|signup, or #error=…)
export async function handleRedirect() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('error_description') || h.get('error')) { const e = h.get('error_description') || h.get('error'); history.replaceState(null, '', here()); return { error: friendly(e) }; }
  if (!h.get('access_token')) return null;
  const type = h.get('type');
  const s = { access_token: h.get('access_token'), refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in') || 3600 };
  history.replaceState(null, '', here());
  try { s.user = await api('/auth/v1/user', { token: s.access_token }); } catch (e) { return { error: e.message }; }
  keep(withExpiry(s));
  if (type === 'recovery') return { recovery: true };
  await afterSignIn();
  return { signedIn: true };
}

/* ---------- progress in the account ---------- */
// After signing in: load the account's saved progress. If the account has none yet,
// the progress already on this device (from guest mode) becomes the account's progress.
async function afterSignIn() {
  const remote = await pull();
  if (remote && remote.data && Object.keys(remote.data).length) replaceAll({ ...remote.data, entered: 'account' });
  else { S.entered = 'account'; await push(true); }
}
async function pull() {
  const uid = user()?.id; if (!uid) return null;
  const rows = await api(`/rest/v1/progress?user_id=eq.${uid}&select=data,updated_at`, { token: await token() });
  return rows?.[0] || null;
}
let timer = null;
export async function push(now) {
  if (!configured() || !signedIn()) return;
  clearTimeout(timer);
  const run = async () => {
    syncState.status = 'saving'; notify();
    try {
      await api('/rest/v1/progress?on_conflict=user_id', { method: 'POST', token: await token(), headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: { user_id: user().id, data: snapshot(), updated_at: new Date().toISOString() } });
      Object.assign(syncState, { status: 'saved', at: Date.now(), error: '' });
    } catch (e) { Object.assign(syncState, { status: navigator.onLine === false ? 'offline' : 'error', error: e.message }); }
    notify();
  };
  if (now) return run();
  timer = setTimeout(run, 1500);
}
onSave(() => push());
window.addEventListener('online', () => push(true));

// Re-check the account when the app starts (refresh the session; pull newer progress from another device).
export async function resume() {
  if (!configured() || !signedIn()) return;
  try {
    const remote = await pull();
    if (remote?.data && new Date(remote.updated_at).getTime() > (S.updatedAt || 0) + 1000) replaceAll({ ...remote.data, entered: 'account' });
    Object.assign(syncState, { status: 'saved', at: Date.now() });
  } catch (e) { Object.assign(syncState, { status: 'offline', error: e.message }); }
}

let listener = () => {};
export const onSyncChange = fn => { listener = fn; };
const notify = () => listener(syncState);
