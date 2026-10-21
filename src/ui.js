// Shared UI helpers: icons, the Jai mascot, toast, speech.
import { S } from './store.js';

const ICONS = {
  map: '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
  practice: '<rect x="3" y="6" width="13" height="15" rx="3"/><path d="M8 3h10a3 3 0 0 1 3 3v11"/>',
  decoder: '<path d="M4 5h16v10H9l-5 4z"/><path d="M9 10h6"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  homework: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  play: '<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
  slow: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 12h4"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  person: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.6-5.5 6.5-5.5s5.5 2 6.5 5.5"/><path d="m16 11 2 2 4-4"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  pen: '<path d="M4 20l4-1L19 8l-3-3L5 16z"/>',
  save: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  bubble: '<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  phone: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  pause: '<path d="M8 5v14M16 5v14"/>'
};
export const ic = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

// Jai — KhaoJai's own placeholder mascot: a speech bubble with a face (จูน will redesign).
const K = '#2B2440';
const FACES = {
  happy: `<ellipse cx="38" cy="47" rx="5.5" ry="7.5" fill="${K}"/><ellipse cx="62" cy="47" rx="5.5" ry="7.5" fill="${K}"/><circle cx="40" cy="44" r="2" fill="#fff"/><circle cx="64" cy="44" r="2" fill="#fff"/><path d="M42 59q8 8 16 0" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`,
  cheer: `<path d="M31 46q7-8 14 0M55 46q7-8 14 0" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><path d="M40 57q10 13 20 0z" fill="${K}"/>`,
  oops: `<ellipse cx="38" cy="47" rx="5" ry="6.5" fill="${K}"/><ellipse cx="62" cy="47" rx="5" ry="6.5" fill="${K}"/><path d="M43 62q7-5 14 0" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`,
  think: `<ellipse cx="40" cy="45" rx="5" ry="7" fill="${K}"/><ellipse cx="64" cy="45" rx="5" ry="7" fill="${K}"/><path d="M45 60h10" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`,
  sleep: `<path d="M32 48q6 5 12 0M56 48q6 5 12 0" fill="none" stroke="${K}" stroke-width="4" stroke-linecap="round"/><ellipse cx="50" cy="60" rx="3.5" ry="3" fill="${K}"/>`
};
export function jai(size = 64, face = 'happy', fill = '#C9B6FF', cls = '') {
  return `<svg class="jai ${cls}" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Jai">
    <path d="M50 10c24 0 41 15 41 37 0 23-17 37-41 37-5 0-10-.6-14-2l-17 9 4-15C14 69 9 59 9 47 9 25 26 10 50 10z" fill="${fill}"/>
    <ellipse cx="28" cy="58" rx="6" ry="3.5" fill="#FF8FB8" opacity=".55"/><ellipse cx="72" cy="58" rx="6" ry="3.5" fill="#FF8FB8" opacity=".55"/>
    ${FACES[face] || FACES.happy}
  </svg>`;
}

// Tone contour icons (pitch shape) — a small detail for learners.
const TONE_PATHS = { Mid: 'M4 12h16', Low: 'M4 13q8 3 16 3', Falling: 'M4 10q6-6 10 0t6 7', High: 'M4 12q10-1 16-6', Rising: 'M4 9q6 8 11 5t5-8' };
export const toneIcon = t => `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="${TONE_PATHS[t]}"/></svg>`;

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let toastTimer;
export function toast(msg) {
  const host = document.getElementById('toastHost');
  host.innerHTML = `<div class="toast" role="status">${msg}</div>`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => host.innerHTML = '', 3200);
}

let warned = false;
export function say(text, rate = 0.85) {
  if (!S.sound) return toast('Sound is off. Turn it on in Me → Settings.');
  try {
    const synth = window.speechSynthesis; if (!synth) throw 0;
    const u = new SpeechSynthesisUtterance(text); u.lang = 'th-TH'; u.rate = rate;
    const v = synth.getVoices().find(v => /^th/i.test(v.lang));
    if (v) u.voice = v; else if (!warned) { warned = true; toast('This device has no Thai voice yet. The full app will use recordings of native speakers.'); }
    synth.cancel(); synth.speak(u);
  } catch (e) { toast('Audio isn\'t available here.'); }
}

export function shuffle(a, seed) {
  const r = a.slice(); let s = seed || (Date.now() % 9973);
  for (let i = r.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor(s / 233280 * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
