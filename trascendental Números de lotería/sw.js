const CACHE_NAME = 'fortuna-quantum-v4-2-audit-r2';
const APP_FILES = [
  './',
  './index.html',
  './css/styles.css',
  './js/data/lotteries.js',
  './js/data/matrices.js',
  './js/utils/random.js',
  './js/utils/numerology.js',
  './js/utils/audit-engine.js',
  './js/prompt-engine.js',
  './js/app.js',
  './assets/icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
