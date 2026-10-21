// Service worker: makes KhaoJai installable and usable on a weak connection.
// Bump VERSION whenever app files change so phones pick up the new version.
const VERSION = 'khaojai-v0.5.1';
const CORE = [
  './', './index.html', './manifest.webmanifest',
  './src/styles.css', './src/app.js', './src/ui.js', './src/store.js', './src/player.js', './src/checkout.js', './src/draw.js', './src/config.js', './src/auth.js',
  './src/data/letters.js', './src/data/curriculum.js', './src/data/beyond.js', './src/data/decoder.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Network first for our own files (so updates show up), cache as fallback; cache-first for fonts.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
  }
});
