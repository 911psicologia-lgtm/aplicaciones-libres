// Service Worker para MMPI-2 Clínica (PWA offline)
const CACHE_NAME = 'mmpi2-v15';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/boot.js',
  './js/lib/utils.js',
  './js/lib/storage.js',
  './js/lib/mmpi2.js',
  './js/lib/export.js',
  './js/lib/signature.js',
  './js/lib/ai-prompt.js',
  './js/lib/selftest.js',
  './js/screens/splash.js',
  './js/screens/setup.js',
  './js/screens/dashboard.js',
  './js/screens/case.js',
  './js/screens/capture.js',
  './js/screens/report.js',
  './js/app.js',
  './vendor/xlsx.full.min.js',
  './vendor/chart.umd.min.js',
  './vendor/docx.umd.min.js',
  './data/items.json',
  './data/scale_items.json',
  './data/baremos.json',
  './data/baremo_us.json',
  './data/baremo_mx.json',
  './data/vrin_trin_pairs.json',
  './data/criterios.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(resp => {
        if (resp.status === 200 && e.request.method === 'GET') {
          const respClone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, respClone));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
